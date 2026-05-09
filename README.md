# ProctorIDE

ProctorIDE is an academic coding assessment platform with a role-based dashboard, Monaco IDE, activity-specific integrity tracking, and secure code execution.

## Local Development

1. Start local services (Postgres is exposed on **host port 5433** so it does not conflict with a local PostgreSQL on 5432):
   - `docker compose up -d`
2. Run backend:
   - `cd backend`
   - `python -m venv venv`
   - `./venv/Scripts/pip.exe install -r requirements.txt`
   - `./venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000`
3. Run frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

Course notebooks ship under **`workspace/classes/python/`**. On first workspace use, the API copies that tree into **`data/workspaces/<uid>-<workspace_id>/classes/python/`** so edits are persisted in the student workspace.

## MVP Modules

- Invitation-based access and role model
- Student dashboard by activity type
- Monaco IDE with timeline panel
- Judge0-backed code execution
- Tracking event ingestion by activity level
- WebSocket collaboration comments
