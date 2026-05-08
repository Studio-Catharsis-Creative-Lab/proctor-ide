# Roles and permissions

## Roles

| Role | Typical capabilities |
|------|----------------------|
| **Student** | View enrolled activities; edit own workspace; run code; submit; see **own** restricted logs where exposed by API policy. |
| **TA** | Instructor-like access **within assigned courses/activities** (deployment-dependent enrollment). |
| **Instructor** | Create activities; enroll; view submissions and integrity tooling for own sections. |
| **Administrator** | Infrastructure, secrets, global configuration—not course grading unless also enrolled as staff. |

## API enforcement

Sensitive routes require **Bearer token** verification via Firebase. **WebSockets** (comments) should pass **`token=`** in the query string and derive identity **only** from verified claims—not client `user_id`.

## Principle

**Least privilege**: grant **TA** the minimum scope needed for grading assistance.
