# ProctorIDE

ProctorIDE is an academic coding assessment platform with a role-based dashboard, Monaco IDE, activity-specific integrity tracking, and secure code execution.

## Local Development

1. Start local services:
   - `docker-compose up -d`
2. Run backend:
   - `cd backend`
   - `python -m venv venv`
   - `./venv/Scripts/pip.exe install -r requirements.txt`
   - `./venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000`
3. Run frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## MVP Modules

- Invitation-based access and role model
- Student dashboard by activity type
- Monaco IDE with timeline panel
- Judge0-backed code execution
- Tracking event ingestion by activity level
- WebSocket collaboration comments
