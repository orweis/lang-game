# Security policy

## Supported versions

Only the latest release on the `main` branch receives fixes.

## Reporting a vulnerability

Please report security problems privately through GitHub's
[private vulnerability reporting](https://docs.github.com/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
("Report a vulnerability" on the repository's Security tab) rather than in a
public issue. Include steps to reproduce and the affected version.

## Security model

- The app is fully client-side: no API routes, server actions, middleware,
  accounts, cookies, analytics or storage. All content is static data in
  `src/data`.
- Speech uses the browser's local `speechSynthesis`; no audio or text leaves
  the device.
- The Heebo font is downloaded at build time and served from the app, so the
  running app makes no third-party requests.
- `next.config.mjs` sends a Content Security Policy and other security
  headers on every response. The CSP allows `'unsafe-inline'` scripts and
  styles because Next.js's static pages use inline bootstrap scripts and
  framer-motion sets inline styles; no third-party origins are allowed.
- Dependencies are kept current with Dependabot, and CI runs
  `npm audit --omit=dev --audit-level=high`.
