# Migration notes

## Alembic `0002` — datetime timezone awareness

**Purpose:** Align ORM and PostgreSQL with **UTC** using `TIMESTAMPTZ` for time columns where applicable.

| Environment | Effect |
|-------------|--------|
| **PostgreSQL** | Columns migrated to **timestamp with time zone**; store and compare in UTC. |
| **SQLite** (tests) | Often a **no-op** or compatible mapping—continue to run pytest locally. |

### Operator checklist

1. **Backup** production database before migration.
2. Apply on **staging**: `alembic upgrade head`.
3. Set **`TZ=UTC`** on API workers and verify invitation/expiry behavior.

### Application expectations

- Prefer **`datetime.now(timezone.utc)`** (or shared helpers) over naive **`utcnow()`** for new code.
- Invitation expiry comparisons should tolerate legacy naive rows until backfilled (product uses UTC helpers).

## Firebase / auth

When rotating **service account** JSON:

1. Deploy new secret.
2. Restart API instances **before** revoking old keys.
3. Smoke-test **sign-in**, **run**, and **WebSocket** comments.

## Related

- [Testing policy](../procedures/testing-policy.md)
- [Deployment](../workflows/admin/deployment.md)
