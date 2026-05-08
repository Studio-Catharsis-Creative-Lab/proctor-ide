import secrets
from datetime import UTC, datetime, timedelta


def build_invite(email: str, role: str, expires_in_days: int = 30) -> dict:
    return {
        "code": secrets.token_urlsafe(32),
        "email": email,
        "role": role,
        "expires_at": datetime.now(UTC) + timedelta(days=expires_in_days),
        "used": False,
    }
