# ProctorIDE Project Memory

## Startup Commands

### Backend
```bash
cd backend
python -m venv venv
./venv/Scripts/pip.exe install -r requirements.txt
./venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Local Infrastructure
```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

## File Structure
- `frontend/`: React + Vite + TypeScript UI
- `backend/`: FastAPI API and services
- `docker-compose.yml`: local PostgreSQL + Judge0 + Redis
- `.github/workflows/ci.yml`: lint/test CI pipeline

## Core Architecture Decisions
- Git backend: GitPython + bare repositories
- Code execution: Judge0 CE via backend proxy endpoint
- Auth: Firebase Authentication (frontend + backend verification)
- Database: PostgreSQL (Cloud SQL in production)

## Notes
- Students only interact with ProctorIDE UI; no direct Git commands.
- Tracking is activity-level and configurable by assessment type.
- **Timezones:** API and DB store instants in **UTC**. Models use `DateTime(timezone=True)`; PostgreSQL uses `TIMESTAMPTZ` after Alembic revision `0002_datetime_timezone`. Set `TZ=UTC` on hosts when deploying.

## Deployment checklist
1. **PostgreSQL (e.g. Cloud SQL):** create database and user; allow Cloud Run (or your runtime) to connect (VPC connector / Cloud SQL Auth Proxy / Unix socket).
2. **Environment:** copy `.env.example` → production secrets. Set `DATABASE_URL`, `JUDGE0_URL`, `FIREBASE_CREDENTIALS_PATH` (service account JSON), `FIREBASE_PROJECT_ID`, optional `GCS_BUCKET` for recordings/assets, `TZ=UTC`.
3. **Migrations:** from `backend/`: `./venv/Scripts/alembic.exe upgrade head` (or `alembic upgrade head`) against production `DATABASE_URL`.
4. **Firebase:** enable Auth; download Admin SDK JSON; configure same project on the frontend (`VITE_*` vars). Custom claims for roles (`instructor`, `ta`, `student`) should match backend expectations.
5. **Judge0:** run Judge0 (or managed equivalent) reachable from the API; set `JUDGE0_URL`.
6. **Containers:** build/push per `Dockerfile`s or `cloudbuild.yaml`; wire Cloud Run env vars and secrets (Secret Manager for `FIREBASE_CREDENTIALS` contents or file mount).
7. **Frontend:** set `VITE_API_URL` to the public API base (e.g. `https://api.example.com/api`).
