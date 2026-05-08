# How-to — administrators

## Deploy or upgrade

Follow [Deployment](../workflows/admin/deployment.md) and [Migration notes](../releases/migration-notes.md).

Checklist:

1. Apply **database migrations** (`alembic upgrade head`) in **staging**, then production.
2. Deploy **API** with correct **`DATABASE_URL`**, **Firebase** credentials, and **Judge0** (or equivalent) URL.
3. Deploy **frontend** with **`VITE_*`** variables pointing at the production API.
4. Confirm **`/health`** and a **smoke test** (sign-in + list activities).

## Rotate secrets

- **Firebase** service account JSON: replace file on API hosts, restart workers.
- **Database** credentials: rotate in secret manager and update `DATABASE_URL`; avoid downtime with connection pool reload where supported.

## Respond to incidents

Use [Incident response](../procedures/incident-response.md); preserve logs per retention policy.

## Vendor due diligence

Maintain [Vendors & subprocessors](../procedures/vendors-subprocessors.md) when adding OAuth IdPs, hosting regions, or analytics.
