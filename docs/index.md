# ProctorIDE documentation

**ProctorIDE** is an invitation-based academic platform that combines a **web IDE** (editing, version history, code execution) with **activity-specific integrity controls** and **instructor workflows** for courses that use coding assignments, projects, practice challenges, quizzes, and high-stakes tests or exams.

This site is the **single source of truth** for:

- **How to** complete tasks (students, instructors, administrators)
- **End-to-end workflows** by activity type
- **Transparency** about what the platform records and who can see it
- **Operational procedures** and **compliance-oriented** reference material (not legal advice)

!!! note "Not legal advice"
    Compliance pages describe common practices and product behavior. Your institution’s counsel and privacy office should review final policies, DPAs, and notices.

## Start by role

| I am a… | Start here |
|---------|------------|
| **Student** | [Student workflows](workflows/student/index.md) · [IDE, run, submit](workflows/student/ide-run-submit.md) · [Transparency](transparency/index.md) |
| **Instructor or TA** | [Instructor workflows](workflows/instructor/index.md) · [Activity lifecycle](workflows/instructor/activity-lifecycle.md) · [Monitoring](workflows/instructor/monitoring.md) |
| **IT / admin** | [Admin deployment](workflows/admin/deployment.md) · [Security controls](compliance/security-controls.md) |
| **Compliance / privacy** | [Privacy overview](compliance/privacy-overview.md) · [Education records framing](compliance/education-records.md) · [Data collected](transparency/data-collected.md) |

## Principles

1. **Transparency first** — Students should understand monitoring **before** starting each activity type ([tracking overview](transparency/tracking-by-activity-type.md)).
2. **Least privilege** — Access follows role ([roles reference](reference/roles-permissions.md)).
3. **UTC everywhere** — Stored timestamps use UTC; configure hosts with `TZ=UTC` in production.
4. **Human review for high stakes** — Automated signals support instructors; policy for grading and integrity decisions remains institutional.

## Build this documentation locally

From the `proctor-ide` app directory:

```bash
pip install -r requirements-docs.txt
mkdocs serve
```

Open the URL shown (usually `http://127.0.0.1:8000`).

To publish a static site:

```bash
mkdocs build
# output in site/
```
