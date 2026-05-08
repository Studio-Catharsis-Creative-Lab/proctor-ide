# Student troubleshooting

## Sign-in fails

- Use the **identity provider** your syllabus specifies (often school Google).
- Clear site data only if IT recommends it; then retry **incognito** to rule out extensions.
- If error mentions **configuration**, escalate to your instructor—**server Firebase** setup may be incomplete.

## “Cannot load activities”

- Check network/VPN.
- Confirm **enrollment**.

## Code run fails or times out

- Read stderr; fix compile errors first.
- If the **sandbox** is down (502 from API), retry later and notify your instructor with **timestamp**.

## WebSocket / comments not working

- Some campus networks block WebSockets—try another network or ask IT to allow **`wss://`** to the API host.

## Wrong time on deadlines

- Confirm your **system clock**; course policy may define timezone for due dates.

## Related

- [Environments](../../getting-started/environments.md)
- [Incident response](../../procedures/incident-response.md) (for admins)
