# Data collected — overview

This page summarizes **categories** of data the platform may process. **Not every category applies to every activity or deployment.**

## Identity and access

- **Authentication provider subject** (e.g. Firebase UID), **email** when exposed by the IdP and stored by policy.
- **Invitation codes** and **role** (student, TA, instructor) after redemption.

## Course and activity data

- **Activity metadata**: title, type, due dates, enrollment links.
- **Submissions** and **workspace file contents** for graded work.
- **Git-like history**: commits or snapshots for recovery and integrity review.

## Execution

- **Run requests** (language, source sent to sandbox).
- **Stdout/stderr**, exit status, and **timestamps** from the execution service (e.g. Judge0).
- **Server-side run logs** may include the authenticated **user id** for audit trails.

## Behavioral telemetry (when enabled)

- **Tracking events** such as keystroke bursts, clipboard operations, focus/blur—**gated by activity type** in the product design.
- Events are stored for **review workflows**, not for sale.

## Collaboration

- **Comments** on code lines, author identity, timestamps.

## Technical diagnostics

- **HTTP logs**, **error traces** on servers (often excluding full request bodies in production).
- **WebSocket** connection metadata for real-time features.

## Related

- [Data not collected](data-not-collected.md) · [Retention](../procedures/retention.md)
