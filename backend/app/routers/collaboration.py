from collections import defaultdict
from datetime import UTC, datetime
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from sqlalchemy import select

from app.database.db import SessionLocal
from app.models.assessment import Activity
from app.models.collaboration import Comment
from app.models.user import User
from app.utils.firebase_auth import verify_token

router = APIRouter(tags=["collaboration"])
rooms: dict[str, set[WebSocket]] = defaultdict(set)


@router.websocket("/ws/comments/{activity_id}")
async def comments_socket(websocket: WebSocket, activity_id: str) -> None:
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    try:
        auth_user = verify_token(token)
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    rooms[activity_id].add(websocket)
    try:
        while True:
            message = await websocket.receive_text()
            try:
                payload = json.loads(message)
            except json.JSONDecodeError:
                payload = None

            if payload and activity_id.isdigit():
                async with SessionLocal() as db:
                    user_uid = auth_user["uid"]
                    user_result = await db.execute(select(User).where(User.firebase_uid == user_uid))
                    user = user_result.scalar_one_or_none()
                    if not user:
                        user = User(firebase_uid=user_uid, email=f"{user_uid}@local", role="student")
                        db.add(user)
                        await db.flush()

                    activity_result = await db.execute(select(Activity).where(Activity.id == int(activity_id)))
                    activity = activity_result.scalar_one_or_none()
                    if activity:
                        line_number = int(payload.get("line_number", 1))
                        text = str(payload.get("text", ""))
                        db.add(
                            Comment(
                                activity_id=activity.id,
                                user_id=user.id,
                                line_number=line_number,
                                text=text,
                                created_at=datetime.now(UTC),
                            )
                        )
                        await db.commit()
                        message = json.dumps(
                            {
                                "user_id": user_uid,
                                "line_number": line_number,
                                "text": text,
                                "timestamp": datetime.now(UTC).isoformat(),
                            }
                        )

            for connection in rooms[activity_id]:
                await connection.send_text(message)
    except WebSocketDisconnect:
        rooms[activity_id].discard(websocket)
