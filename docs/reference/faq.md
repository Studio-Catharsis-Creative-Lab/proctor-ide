# Frequently asked questions

## Students

### Why can I not see other students’ work?

The platform enforces **privacy** and **integrity**—submissions are visible only to **you** and **authorized staff**.

### Are my keystrokes recorded?

**Maybe**, depending on **activity type** and **course settings**. Read [Tracking by activity type](../transparency/tracking-by-activity-type.md) before starting.

### Is my code run on my laptop?

**Execution** goes through a **server-side sandbox** (e.g. Judge0). You should assume staff can see **source** and **output** you run through the product.

## Instructors

### Can I export submissions?

Use your deployment’s **export** or **database** tools consistent with [Retention](../procedures/retention.md) and [Data requests](../procedures/data-requests.md).

### TAs see too much / too little

Map **enrollment** and **role** configuration; see [Roles & permissions](roles-permissions.md).

## Administrators

### SQLite vs PostgreSQL in CI?

Tests often use **SQLite** for speed; run **Alembic** against **Postgres** in staging because some migrations are **no-ops** on SQLite—see [Testing policy](../procedures/testing-policy.md).

### Where is UTC configured?

Set **`TZ=UTC`** on servers; DB uses **`TIMESTAMPTZ`** after migration `0002`—see [Migration notes](../releases/migration-notes.md).
