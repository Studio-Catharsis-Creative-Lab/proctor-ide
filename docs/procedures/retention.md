# Data retention

Retention must match **institutional policy**, **accreditation**, and **regulatory** requirements in your jurisdiction.

## Engineering defaults (configure explicitly)

| Data class | Typical guidance |
|------------|------------------|
| **Grades / submissions** | Retain per registrar policy (often years). |
| **Integrity telemetry** | Shorter than submissions unless integrity investigation requires longer hold. |
| **Server logs** | Weeks to months in hot storage; archive or delete per infra policy. |
| **Backups** | Align restore goals with deletion—**orphaned backups** are a common gap. |

## UTC timestamps

The stack stores timestamps in **UTC** (`TIMESTAMPTZ` in PostgreSQL after migration `0002`). Use UTC when defining **cutover** jobs for purge scripts.

## Related

- [Migration notes](../releases/migration-notes.md)
