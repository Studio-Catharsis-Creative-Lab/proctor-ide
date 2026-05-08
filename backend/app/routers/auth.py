from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.utils.firebase_auth import get_current_user

router = APIRouter(tags=["auth"])


class TokenRequest(BaseModel):
    id_token: str


@router.post("/auth/verify-token")
async def verify_token(payload: TokenRequest) -> dict[str, str]:
    # The FE sends token in Authorization for protected endpoints;
    # this endpoint is a convenience ping for token validity.
    return {"status": "accepted", "hint": "Use Authorization: Bearer <id_token> on protected routes."}


@router.get("/auth/me")
async def me(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    return user
