def verify_access(role: str, allowed: set[str]) -> bool:
    return role in allowed
