"""Use timezone-aware timestamps (PostgreSQL TIMESTAMPTZ).

Revision ID: 0002_datetime_timezone
Revises: 0001_initial_schema
Create Date: 2026-05-08
"""

from alembic import op
from sqlalchemy import text

revision = "0002_datetime_timezone"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return

    columns: list[tuple[str, str]] = [
        ("activities", "due_date"),
        ("invitations", "expires_at"),
        ("enrollments", "started_at"),
        ("enrollments", "submitted_at"),
        ("comments", "created_at"),
        ("tracking_events", "created_at"),
    ]
    for table, column in columns:
        op.execute(
            text(
                f'ALTER TABLE "{table}" ALTER COLUMN "{column}" '
                f"TYPE TIMESTAMPTZ USING {column} AT TIME ZONE 'UTC'"
            )
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return

    columns: list[tuple[str, str]] = [
        ("activities", "due_date"),
        ("invitations", "expires_at"),
        ("enrollments", "started_at"),
        ("enrollments", "submitted_at"),
        ("comments", "created_at"),
        ("tracking_events", "created_at"),
    ]
    for table, column in columns:
        op.execute(
            text(
                f'ALTER TABLE "{table}" ALTER COLUMN "{column}" '
                f"TYPE TIMESTAMP WITHOUT TIME ZONE USING {column} AT TIME ZONE 'UTC'"
            )
        )
