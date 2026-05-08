# Testing policy (engineering)

This document describes how **ProctorIDE** is validated in development—distinct from **academic integrity** “testing” of students.

## Automated tests

- **Backend**: `pytest` under `backend/tests/` against a **SQLite** test database for fast CI.
- **CI**: GitHub Actions workflow runs tests on push/PR (see `.github/workflows/ci.yml`).

## What CI does *not* guarantee

- **PostgreSQL-only** behaviors (some migrations are no-ops on SQLite)—run **`alembic upgrade head`** against staging Postgres before production.
- **Firebase** end-to-end flows without configured credentials.
- **Judge0** availability or language runtime parity.

## Manual smoke (recommended each release)

1. Sign in with a **test tenant** user.
2. List **activities**, open **workspace**, **save** a file.
3. **Run** code; confirm console output.
4. Open **WebSocket comments** with a valid token (query param in dev).
5. Verify **role-scoped** run logs (student vs instructor).

## Local dev tokens

Some deployments support **`dev-{role}`** tokens for local development **only**—never enable in production.

## Related

- [How-to for admins](../how-to/admins.md)
- [Accessibility](../compliance/accessibility.md) for UI regression checks
