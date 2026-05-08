# Data not collected — boundaries

Use this page to set **expectations** and avoid **miscommunication** with students and privacy reviewers.

## Not collected by the core product (typical)

The following are **not** standard features of the open-source ProctorIDE stack described in this repo unless **explicitly integrated** by your institution:

- **Continuous webcam or screen video** (unless you add a separate proctoring vendor).
- **Microphone** audio streams for surveillance.
- **Keylogging outside the IDE surface** (OS-wide keyloggers are out of scope).
- **Browser history** unrelated to the assessment session.
- **Personal files** on the student device outside uploaded workspace paths.

## Execution sandbox

- Code is executed in a **service-controlled environment** (e.g. Judge0). Students should assume **instructors and systems** can see **submitted source** and **run output**—not “private” execution on a personal laptop.

## Third parties

If your school adds **analytics**, **AI assistants**, or **LMS deep links**, those vendors may introduce **additional** processing—document them in [Vendors & subprocessors](../procedures/vendors-subprocessors.md).

## Related

- [Privacy overview](../compliance/privacy-overview.md)
