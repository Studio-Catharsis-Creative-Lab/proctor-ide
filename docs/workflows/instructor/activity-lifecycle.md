# Instructor workflow — activity lifecycle

This page describes the **intended** lifecycle from authoring through review. Exact UI labels may evolve; the **order of operations** stays stable.

## 1. Plan

- Choose **activity type** (assignment, project, challenge, quiz, test, exam).
- Choose **tracking level** consistent with your syllabus and institutional policy (see [matrix](../../reference/activity-types-matrix.md)).
- Decide **due date** and late policy (communicated outside or inside the product as available).

## 2. Create

- Create the activity in the **Teacher** or admin UI (or API if automated).
- Record the internal **activity ID** if you integrate tools or docs.

## 3. Configure integrity / transparency

- Ensure students will see the correct **pre-start disclosure** for this type.
- For exams, confirm whether additional proctoring (camera, lockdown) is in scope for your **deployment**—not all features ship in every release.

## 4. Upload template

- Provide starter files and `ASSIGNMENT.md` (or equivalent) so the IDE opens with clear instructions.
- See [Templates](templates.md).

## 5. Enroll

- Add students by **invitation** or **bulk UID list** as supported.
- Verify enrollments before the due date.
- See [Enrollment](enrollment.md).

## 6. Monitor (optional but recommended)

- Watch submission status and integrity signals appropriate to the activity type.
- See [Monitoring & review](monitoring.md).

## 7. Review and grade

- Open submissions (files, timeline, run logs per policy).
- Apply your rubric; ProctorIDE provides **artifacts**, not automatic **final grades** unless you add external tooling.

## 8. Archive

- Follow your institution’s retention policy; see [Retention](../../procedures/retention.md).

## Related

- [Assignments & projects](assignments-projects.md)
- [Tests & exams](tests-exams.md)
- [Transparency hub](../../transparency/index.md)
