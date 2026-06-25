# Security

`before-the-launch` handles untrusted product, competitor, and web content. Treat every source as hostile input.

## Implemented Controls

- URL ingestion allows only HTTP and HTTPS.
- Localhost, private IP ranges, link-local ranges, multicast ranges, and embedded URL credentials are blocked before fetch.
- DNS targets are checked before URL fetches.
- Redirects are limited.
- Fetched content size is limited.
- Upload size is limited by `MAX_UPLOAD_BYTES`.
- Supported file parsing fails closed when a format cannot be extracted.
- Raw source content is not logged by application code.
- AI prompts explicitly treat scraped and uploaded source text as untrusted evidence, never as instructions.
- Sources and runs can be deleted.
- Secrets are read only from server-side environment variables.

## Reporting Issues

Please open a private security advisory or contact the project maintainers before publishing a vulnerability.

Include:

- A short description.
- Reproduction steps.
- Expected impact.
- Suggested fix, if known.

## Deployment Notes

- Keep `DATABASE_URL` and AI credentials out of client code.
- Set conservative upload and URL fetch limits for public deployments.
- Put public deployments behind Vercel Firewall or equivalent abuse protection.
- Review stored source retention policies before using real customer or competitor material.
