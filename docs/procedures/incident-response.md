# Incident response

## Triggers

- **Availability**: API or database unavailable beyond SLA.
- **Integrity**: suspected **token leak**, **privilege escalation**, or **mass data export**.
- **Privacy**: accidental exposure of **another student’s** work or grades.

## Immediate actions

1. **Contain**: rotate compromised credentials; disable affected invitations if abuse is invitation-based.
2. **Preserve**: snapshot logs (access-controlled); avoid destructive DB operations until scope is known.
3. **Notify**: internal security / legal per institutional policy; **do not** promise specifics publicly until confirmed.

## Product-specific notes

- **Firebase**: revoke leaked tokens at IdP if applicable; review **Admin SDK** key exposure.
- **PostgreSQL**: identify time window from **`TIMESTAMPTZ`** audit columns.

## After resolution

- Document root cause and corrective actions.
- Update [Vendors](vendors-subprocessors.md) if a vendor contributed.

## Related

- [Security controls](../compliance/security-controls.md)
