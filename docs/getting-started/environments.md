# Environments and client requirements

## Supported client (MVP)

| Area | Guidance |
|------|----------|
| **Form factor** | **Desktop** browser; mobile support may be limited in early releases. |
| **Browsers** | Latest **Chrome**, **Edge**, or **Firefox**. Safari is best-effort. |
| **JavaScript** | Must be **enabled** (the IDE and dashboard are single-page applications). |
| **Pop-ups** | Not required for core flows; if your school uses a third-party auth pop-up, allow it. |

## Network

| Requirement | Why |
|-------------|-----|
| **HTTPS** to the ProctorIDE API | All REST calls and auth. |
| **WebSocket** to the same API host (if used) | Real-time comments; some networks block `ws://`—production should use **`wss://`**. |
| **Outbound to execution service** | Code runs on the **backend** (e.g. Judge0); you do not need a local compiler. |

!!! tip "Locked-down labs"
    School IT may need to allow your **production API domain** and **WebSocket** (or `wss://`) to the same host. Provide them the base URL and that you use standard ports 443.

## Time and locale

- The platform stores **UTC** internally. Due times and logs should be shown in a **sensible local or course timezone** in the UI as the product matures; until then, treat due dates as specified in the syllabus.
- Set server `TZ=UTC` in deployment to avoid skew in logs (see [Admin deployment](../workflows/admin/deployment.md)).

## Accessibility

- Target: **WCAG-oriented** components; see [Accessibility statement](../compliance/accessibility.md) for scope and how to report issues.

## Related

- [Troubleshooting](../workflows/student/troubleshooting.md)
- [Security controls](../compliance/security-controls.md)
