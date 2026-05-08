# Account and access

## How access works

ProctorIDE is **invitation-oriented**. Your institution or instructor controls who can join and which **role** you receive.

### Typical flow

1. You receive an **invitation** (link or code) or are **enrolled** on a roster that your school syncs.
2. You **sign in** with the identity provider your course uses (commonly **Google** via Firebase Auth).
3. The platform assigns a **role** and shows only the **activities** you are entitled to see.

### Roles

| Role | Capabilities (summary) |
|------|-------------------------|
| **Student** | View dashboard, open enrolled activities, use the IDE, submit work, see own run logs (per product policy). |
| **TA** | Student capabilities for assigned courses, plus instructor-style tools where enabled (enrollment, review, monitoring). |
| **Instructor** | Create and configure activities, manage templates, enroll students, view submissions and integrity-related signals. |

Details: [Roles & permissions](../reference/roles-permissions.md).

### Invitations (codes and email)

- **Create** (instructor/TA): invitations are generated in the product; each has an **expiry** and can be **revoked**.
- **Redeem** (student): you redeem while signed in; the system records which account used the code.
- **Validate** (optional): a “check code” step may be offered before sign-in to confirm the invite is still valid.

!!! warning "One person, one account"
    Use the identity your school expects. Switching accounts mid-course can break enrollment links.

## First sign-in checklist

- [ ] Complete sign-in with the required provider.
- [ ] Confirm your **name and email** match what the course expects.
- [ ] Open the **Dashboard** and verify you see the right course or section.
- [ ] Read the **transparency** or **integrity** notice for the first activity you start.

## If you cannot sign in

- **Wrong school account**: try the Google profile your syllabus lists.
- **Invite expired or revoked**: contact your instructor or IT.
- **“Configuration” or 503 errors**: the deployment may be missing Firebase admin configuration on the server—escalate to your admin with the time of the error.

## Related

- [Transparency: what we record](../transparency/index.md)
- [Troubleshooting (students)](../workflows/student/troubleshooting.md)
