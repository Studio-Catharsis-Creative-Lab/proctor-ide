import os
from datetime import UTC, datetime
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.utils.firebase_auth import get_current_user

router = APIRouter(tags=["execution"])
_execution_logs: list[dict[str, Any]] = []


class RunRequest(BaseModel):
    language_id: int
    source_code: str
    activity_id: str | None = None
    stdin: str | None = None


@router.post("/run")
async def run_code(
    payload: RunRequest,
    user: dict[str, Any] = Depends(get_current_user),
) -> dict:
    judge_url = os.getenv("JUDGE0_URL", "http://localhost:2358")
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                f"{judge_url}/submissions?base64_encoded=false&wait=true",
                json=payload.model_dump(),
            )
            resp.raise_for_status()
            result = resp.json()
            _execution_logs.append(
                {
                    "timestamp": datetime.now(UTC).isoformat(),
                    "user_uid": user["uid"],
                    "activity_id": payload.activity_id,
                    "language_id": payload.language_id,
                    "success": result.get("status", {}).get("id") == 3,
                    "execution_time": result.get("time"),
                    "memory": result.get("memory"),
                    "status": result.get("status", {}).get("description"),
                }
            )
            return result
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Judge0 unavailable: {exc}") from exc


@router.get("/run/logs")
async def run_logs(user: dict[str, Any] = Depends(get_current_user)) -> list[dict[str, Any]]:
    if user.get("role") in {"instructor", "ta"}:
        return _execution_logs
    return [item for item in _execution_logs if item.get("user_uid") == user["uid"]]
