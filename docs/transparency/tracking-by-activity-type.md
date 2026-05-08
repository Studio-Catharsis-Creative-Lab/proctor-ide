# Tracking by activity type

Activity **type** drives default **integrity monitoring** intensity. Exact behavior depends on **course configuration** and **product version**—verify in your deployment.

## Summary matrix

| Activity type | Typical monitoring | Rationale |
|---------------|-------------------|-----------|
| **Challenge** | Light | Practice and experimentation; lower stakes. |
| **Quiz** | Basic | Short assessments; time and focus signals often enabled. |
| **Assignment / project** | Moderate | Full IDE use; version history and run logs common. |
| **Test / exam** | Comprehensive | Strongest signals and tightest rules per institutional policy. |

## What “stronger” monitoring can include

Examples that **may** apply in exam modes (not all are guaranteed in every build):

- **Editor events**: keystrokes, paste/cut, focus changes (where implemented).
- **Execution**: command runs, stdout/stderr through the sandbox ([data collected](data-collected.md)).
- **Session metadata**: timestamps in **UTC** for correlation.

## Instructor responsibility

- Choose the **lowest** adequate integrity level for the learning goal.
- Align disclosures with your syllabus and accessibility office.

## Related

- [Activity types matrix](../reference/activity-types-matrix.md)
