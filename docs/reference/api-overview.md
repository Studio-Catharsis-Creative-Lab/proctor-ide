# API overview

Base URL shown as **`{API}`**. Authenticated routes expect **`Authorization: Bearer <Firebase ID token>`** unless noted.

## Health

| Method | Path | Notes |
|--------|------|-------|
| GET | `{API}/health` | Liveness probe. |

## Auth (`/api`)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/auth/verify-token` | Validate token / bootstrap session patterns. |
| GET | `/api/auth/me` | Current user profile from verified token. |

## Invitations (`/api`)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/invitations` | Create invitation. |
| GET | `/api/invitations` | List invitations (scoped by role). |
| POST | `/api/invitations/bulk` | Bulk create. |
| GET | `/api/invitations/validate/{code}` | Pre-flight validation. |
| POST | `/api/invitations/redeem` | Redeem code → enrollment. |
| POST | `/api/invitations/{code}/revoke` | Revoke code. |

## Activities (`/api`)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/activities` | Create activity. |
| GET | `/api/activities` | List activities for user. |
| POST | `/api/activities/{activity_id}/start` | Start session. |
| POST | `/api/activities/{activity_id}/submit` | Submit attempt. |
| POST | `/api/activities/{activity_id}/template` | Attach template. |
| POST | `/api/activities/{activity_id}/template-files` | Multi-file template upload. |
| POST | `/api/activities/{activity_id}/enroll` | Enroll user. |
| GET | `/api/activities/{activity_id}/submissions` | List submissions (instructor/TA). |

## Workspace (`/api`)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/workspace/{workspace_id}/files` | List or fetch file tree. |
| PUT | `/api/workspace/{workspace_id}/files/{path}` | Write file (`path` is path segment). |
| GET | `/api/workspace/{workspace_id}/log` | Version / commit log. |
| POST | `/api/workspace/{workspace_id}/restore/{commit_id}` | Restore snapshot. |

## Execution (`/api`)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/run` | Run code via sandbox (e.g. Judge0); **auth required**; logs include user. |
| GET | `/api/run/logs` | **Role-filtered** run logs (student: own; instructor/TA: broader). |

## Tracking (`/api`)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/tracking/events` | Ingest integrity/telemetry events. |
| GET | `/api/tracking/events` | Query events (role-scoped). |

## WebSocket

| URL | Notes |
|-----|-------|
| `wss://{host}/api/ws/comments/{activity_id}?token=...` | Real-time comments; **token** must be verified server-side. |

## CORS

Default dev server may allow **all** origins—**tighten in production** to your SPA origin.
