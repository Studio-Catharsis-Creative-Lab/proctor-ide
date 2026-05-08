# Administrator guide — deployment summary

This condenses `PROJECT_MEMORY.md` and `.env.example` into an **operator-facing** checklist.

## Components

| Component | Role |
|-----------|------|
| **Frontend** | Static SPA (e.g. Vite build behind nginx or CDN). |
| **API** | FastAPI backend. |
| **PostgreSQL** | Primary datastore (`TIMESTAMPTZ` after migration `0002`). |
| **Judge0** (or equivalent) | Sandboxed code execution. |
| **Firebase** | End-user authentication; Admin SDK on server for token verification. |

## Environment variables (representative)

See repository **`.env.example`** for authoritative names. Typical:

- `DATABASE_URL` — async Postgres URL.
- `JUDGE0_URL` — base URL for the execution service.
- `FIREBASE_CREDENTIALS_PATH` — path to service account JSON on the API host.
- `TZ=UTC` — recommended on servers.

## Database migrations

From `backend/` with venv active:

```bash
alembic upgrade head
```

Run against **staging** before production.

## HTTPS and WebSockets

- Production should serve API over **HTTPS** and WebSockets over **`wss://`**.
- Align **CORS** and **cookie** policies with your frontend origin.

## Related

- [Migration notes](../../releases/migration-notes.md)
- [Security controls](../../compliance/security-controls.md)
