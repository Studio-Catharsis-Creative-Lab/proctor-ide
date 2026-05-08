# Vendors and subprocessors

Maintain a **live register** of organizations that **process personal data** on behalf of your deployment.

## Common candidates for this stack

| Vendor / service | Typical role |
|------------------|--------------|
| **Firebase (Google)** | Authentication; token verification via Admin SDK. |
| **Cloud host** (e.g. Google Cloud Run, Cloud SQL) | Runtime and database. |
| **Judge0** (or equivalent) | Sandboxed code execution; receives **source code** transiently. |
| **Email / LMS** | Invitation delivery—if integrated. |

## When to update

- Changing **region** or **data residency**.
- Enabling **AI** features that send prompts outside your VPC.
- Adding **error tracking** (Sentry, etc.) that captures PII.

## Contract checklist

- **DPA** / **FERPA** alignment where applicable.
- **Subprocessor notification** clauses if you add vendors mid-term.

## Related

- [Privacy overview](../compliance/privacy-overview.md)
