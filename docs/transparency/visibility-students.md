# Student visibility of data

Students should be able to understand **what exists about them** and **how to request corrections** under institutional policy.

## Generally visible to the student

- Their **own submissions** and **IDE workspace** state for active activities.
- **Run output** from their own executions in the console UI.
- **Their comment** history where collaboration is enabled.

## May be limited during exams

- **Full instructor analytics** and **integrity timelines** may be **hidden** until after the exam window—deployment-dependent.

## Run logs (API)

In hardened deployments, **GET /api/run/logs** returns:

- **Students**: rows associated with **their** user id.
- **Instructors / TAs**: broader visibility per role policy.

If you see empty logs, your role or activity policy may restrict the view.

## Related

- [Data requests](../procedures/data-requests.md)
