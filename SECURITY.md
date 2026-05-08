# Security Policy

## Scope

PromptPulse v1 is a static, frontend-only demo app. It has no backend, no database, no authentication layer, and no server-side data processing.

## Security Boundary

PromptPulse does not:

- scrape Prompted
- call private Prompted APIs
- access Prompted accounts
- use Prompted cookies
- read Prompted browser storage
- connect to hidden endpoints
- track users in the background
- upload pasted drafts to a server

The app uses local JSON demo data and manual paste/import only.

## Data Storage

PromptPulse currently does not use `localStorage`, `sessionStorage`, IndexedDB, cookies, or a backend database for pasted drafts. Draft text exists only in React component state while the page is open.

If storage is added later, it should be documented here before release.

## Future Integrations

Any future Prompted integration should use official APIs only, with clear user consent and a documented data contract. Future integrations must not use scraping, hidden endpoints, private user data, cookies, or browser-session access.

## Reporting Issues

If you find a security or privacy issue, open a GitHub issue with:

- a concise description
- steps to reproduce
- expected behavior
- actual behavior
- suggested impact or severity

Do not include sensitive personal data in public reports.
