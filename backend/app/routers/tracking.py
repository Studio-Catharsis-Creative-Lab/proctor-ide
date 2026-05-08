from datetime import datetime, UTC
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.crud import get_db
from app.models.assessment import Activity
from app.models.tracking import TrackingEvent as TrackingEventModel
from app.models.user import User
from app.utils.firebase_auth import get_current_user

router = APIRouter(tags=["tracking"])


class TrackingEvent(BaseModel):
    student_id: str | None = None
    activity_id: str
    event_type: str
    event_data: dict


@router.post("/tracking/events")
async def ingest_events(
    payload: list[TrackingEvent],
    current_user: dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, int]:
    authenticated_uid = current_user["uid"]
    authenticated_email = current_user.get("email") or f"{authenticated_uid}@local"
    authenticated_role = current_user.get("role") or "student"
    user_result = await db.execute(select(User).where(User.firebase_uid == authenticated_uid))
    user = user_result.scalar_one_or_none()
    if not user:
        user = User(firebase_uid=authenticated_uid, email=authenticated_email, role=authenticated_role)
        db.add(user)
        await db.flush()

    for event in payload:
        activity_id: int | None = None
        if event.activity_id.isdigit():
            activity_result = await db.execute(select(Activity).where(Activity.id == int(event.activity_id)))
            activity = activity_result.scalar_one_or_none()
            activity_id = activity.id if activity else None

        db.add(
            TrackingEventModel(
                student_id=user.id,
                activity_id=activity_id,
                event_type=event.event_type,
                event_data=event.event_data,
                created_at=datetime.now(UTC),
            )
        )
    await db.commit()
    return {"accepted": len(payload)}


@router.get("/tracking/events")
async def list_events(
    _: dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    result = await db.execute(select(TrackingEventModel).order_by(TrackingEventModel.id.desc()).limit(200))
    items = result.scalars().all()
    return [
        {
            "id": item.id,
            "student_id": item.student_id,
            "activity_id": item.activity_id,
            "event_type": item.event_type,
            "event_data": item.event_data,
            "timestamp": item.created_at.isoformat(),
        }
        for item in items
    ]
