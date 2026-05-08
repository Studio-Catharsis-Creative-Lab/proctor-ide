# Changelog

All notable changes to the **application and documentation** are tracked here at a high level. For file-level history, use `git log`.

## Unreleased

- Documentation: complete MkDocs **How-to**, **Transparency**, **Procedures**, **Compliance**, **Reference**, and **Releases** sections.
- Backend: **lifespan** startup; **UTC-aware** datetimes; **role-scoped** run logs; **WebSocket** auth via verified token.
- Database: Alembic **`0002`** for PostgreSQL `TIMESTAMPTZ` columns (no-op on SQLite test DB).

## 0.1.0 — Initial integrated stack

- Monorepo: **Vite + React** frontend, **FastAPI** backend, **PostgreSQL**, **Judge0** execution, **Firebase** auth, **GitPython** workspaces.
- Core flows: invitations, activities, workspace, run, tracking hooks, collaboration WebSocket.

---

For deployment upgrade steps, see [Migration notes](migration-notes.md).
