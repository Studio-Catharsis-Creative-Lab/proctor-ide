import asyncio
import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_proctoride.db"

from app.database.db import engine  # noqa: E402
from app.main import app  # noqa: E402


def _run(coro):
    return asyncio.run(coro)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    # Startup event already creates tables; this fixture keeps the DB clean between test sessions.
    yield
    async def cleanup():
        async with engine.begin() as conn:
            for table in ["tracking_events", "comments", "enrollments", "invitations", "activities", "users"]:
                await conn.execute(text(f"DELETE FROM {table}"))

    _run(cleanup())


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
