# ProctorIDE Handoff

## Current snapshot
- Branch: `main`
- Target demo URLs:
  - Frontend: `https://proctor.catalystflux.com`
  - API: `https://proctor-api.catalystflux.com`
- Runtime host: `seshnotes-vm` (`us-central1-a`)

## What is built
- Full MVP application stack is present:
  - FastAPI backend + PostgreSQL models/migrations
  - React/Vite frontend
  - Judge0 execution path
  - Tracking and collaboration channels
- IDE has been refactored into a VS Code-like shell with:
  - Workspace file explorer
  - Monaco editor pane
  - Bottom panel tabs for Terminal / Timeline / Assistant
  - Assistant pane reusing comment channel transport
- Deployment layer updates:
  - Frontend Docker build args wired for `VITE_*`
  - Frontend nginx SPA fallback config (`try_files ... /index.html`)
  - Backend image installs `git` for GitPython runtime needs

## What is currently in progress
- UI polish pass for instructor demo quality:
  - Better editor behavior (language switching + format action wiring)
  - Better terminal visual hierarchy and output sections
- Finalizing handoff/status docs and syncing latest changes to remote.

## Verified recently
- Public deep-link route `/ide` returns `200`.
- Frontend bundle with updated IDE layout is being served publicly.
- Local frontend build passes (`npm run build`).

## Known temporary/demo settings
- `VITE_DEV_AUTH_ROLE` may be enabled in VM env for demo-only auth bypass.
- Backend Firebase Admin credentials path still needs final production mount and verification.

## Next steps for clean production handoff
1. Disable demo auth bypass (`VITE_DEV_AUTH_ROLE`) and verify real Firebase sign-in.
2. Mount Firebase Admin SDK JSON on VM and set `FIREBASE_CREDENTIALS_PATH`.
3. Run full smoke test on public routes:
   - auth
   - dashboard activities
   - IDE save/run
   - timeline view
   - assistant message flow
4. Gather instructor feedback and queue final UX refinements.
