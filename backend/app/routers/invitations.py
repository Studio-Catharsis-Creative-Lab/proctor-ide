import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.crud import get_db
from app.models.invitation import Invitation
from app.utils.firebase_auth import get_current_user, require_roles

router = APIRouter(tags=["invitations"])


def _invite_expiry_utc(value: datetime) -> datetime:
    """DB may return naive UTC; normalize so comparisons with UTC now stay valid."""
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def utc_now() -> datetime:
    return datetime.now(UTC)


class InviteRequest(BaseModel):
    email: EmailStr
    role: str = "student"
    expires_in_days: int = 30


class BulkInviteRequest(BaseModel):
    emails: list[EmailStr] = Field(min_length=1)
    role: str = "student"
    expires_in_days: int = 30


class RedeemRequest(BaseModel):
    code: str


@router.post("/invitations")
async def create_invitation(
    payload: InviteRequest,
    user: dict[str, Any] = Depends(require_roles("instructor", "ta")),
    db: AsyncSession = Depends(get_db),
) -> dict:
    code = secrets.token_urlsafe(32)
    invite = Invitation(
        code=code,
        email=str(payload.email),
        role=payload.role,
        expires_at=utc_now() + timedelta(days=payload.expires_in_days),
        used=False,
        created_by_uid=user["uid"],
    )
    db.add(invite)
    await db.commit()
    await db.refresh(invite)
    return {
        "code": invite.code,
        "email": invite.email,
        "role": invite.role,
        "expires_at": invite.expires_at,
        "used": invite.used,
        "created_by": invite.created_by_uid,
        "used_by": invite.used_by_uid,
    }


@router.get("/invitations")
async def list_invitations(
    include_used: bool = Query(default=True),
    _: dict[str, Any] = Depends(require_roles("instructor", "ta")),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    query = select(Invitation)
    if not include_used:
        query = query.where(Invitation.used == False)  # noqa: E712
    result = await db.execute(query)
    invites = result.scalars().all()
    return [
        {
            "code": invite.code,
            "email": invite.email,
            "role": invite.role,
            "expires_at": invite.expires_at,
            "used": invite.used,
            "created_by": invite.created_by_uid,
            "used_by": invite.used_by_uid,
        }
        for invite in invites
    ]


@router.post("/invitations/bulk")
async def bulk_create_invitation(
    payload: BulkInviteRequest,
    user: dict[str, Any] = Depends(require_roles("instructor", "ta")),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    created: list[dict] = []
    for email in payload.emails:
        created.append(
            await create_invitation(
                InviteRequest(email=email, role=payload.role, expires_in_days=payload.expires_in_days),
                user=user,
                db=db,
            )
        )
    return created


@router.get("/invitations/validate/{code}")
async def validate_invitation(code: str, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Invitation).where(Invitation.code == code))
    invite = result.scalar_one_or_none()
    if not invite:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if invite.used:
        raise HTTPException(status_code=400, detail="Invitation already used")
    if _invite_expiry_utc(invite.expires_at) < utc_now():
        raise HTTPException(status_code=400, detail="Invitation expired")
    return {"valid": True, "email": invite.email, "role": invite.role}


@router.post("/invitations/redeem")
async def redeem_invitation(
    payload: RedeemRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(select(Invitation).where(Invitation.code == payload.code))
    invite = result.scalar_one_or_none()
    if not invite:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if invite.used:
        raise HTTPException(status_code=400, detail="Invitation already used")
    if _invite_expiry_utc(invite.expires_at) < utc_now():
        raise HTTPException(status_code=400, detail="Invitation expired")

    invite.used = True
    invite.used_by_uid = user["uid"]
    await db.commit()
    return {"status": "redeemed", "assigned_role": invite.role, "email": invite.email}


@router.post("/invitations/{code}/revoke")
async def revoke_invitation(
    code: str,
    _: dict[str, Any] = Depends(require_roles("instructor", "ta")),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    result = await db.execute(select(Invitation).where(Invitation.code == code))
    invite = result.scalar_one_or_none()
    if not invite:
        raise HTTPException(status_code=404, detail="Invitation not found")
    invite.expires_at = utc_now() - timedelta(seconds=1)
    await db.commit()
    return {"status": "revoked", "code": code}
