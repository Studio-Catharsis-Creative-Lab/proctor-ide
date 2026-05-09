import os
from typing import Annotated, Any

import firebase_admin
from fastapi import Depends, Header, HTTPException, status
from firebase_admin import auth, credentials

_initialized = False


def _init_firebase() -> None:
    global _initialized
    if _initialized:
        return

    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    if cred_path:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        _initialized = True


async def get_current_user(authorization: Annotated[str | None, Header()] = None) -> dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1]
    return verify_token(token)


def verify_token(token: str) -> dict[str, Any]:
    # Local dev tokens always work, even when Firebase Admin is configured.
    if token.startswith("dev-"):
        role = token.removeprefix("dev-") or "student"
        return {"uid": f"dev-{role}", "email": f"{role}@local.dev", "role": role}

    _init_firebase()
    try:
        if _initialized:
            decoded = auth.verify_id_token(token)
            role = decoded.get("role") or decoded.get("claims", {}).get("role") or "student"
            return {"uid": decoded["uid"], "email": decoded.get("email"), "role": role}
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {exc}") from exc

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Firebase not configured. Set FIREBASE_CREDENTIALS_PATH or use dev-{role} token in local mode.",
    )


def require_roles(*allowed_roles: str):
    async def _require(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
        if user.get("role") not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return _require
