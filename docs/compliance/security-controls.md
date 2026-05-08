# Security controls

## Transport

- **TLS** for browser ↔ API; **`wss://`** for WebSockets in production.
- Avoid mixed content that downgrades to insecure HTTP.

## Authentication & authorization

- **Firebase ID tokens** verified on the **API** (not trusting client-provided user ids for sensitive paths).
- **Role-based** access for instructor vs student operations ([roles](../reference/roles-permissions.md)).
- **Run logs** and similar endpoints filter by **authenticated identity**.

## Data layer

- **PostgreSQL** with **`TIMESTAMPTZ`** for audit clarity.
- **Migrations** via Alembic; test on staging before production.

## Execution isolation

- Student code runs in **sandbox services** (e.g. Judge0), **not** on the API host.

## Hardening backlog (operators)

- Tighten **CORS** from `*` to known frontend origins in production.
- **Workspace path traversal** reviews for multi-tenant filesystem access.
- Ensure **tracking** endpoints bind **`student_id`** to the token, not client-supplied ids.

## Related

- [Incident response](../procedures/incident-response.md)
