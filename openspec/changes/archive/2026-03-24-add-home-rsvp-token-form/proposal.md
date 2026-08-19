## Why

Guests need a simple way to confirm attendance for each invitation linked to their QR token, whether they arrive from a QR URL or type the token manually. This should be available from the home page to reduce friction and centralize RSVP completion.

## What Changes

- Add a home-page RSVP component with a token input that accepts token entry manually.
- Add support to prefill/read the RSVP token from the QR-associated URL query/path and auto-validate it on entry.
- After token validation, show a per-guest RSVP form listing all guests linked to that token.
- For each guest row, include an attendance radio group (`asistiré` / `no asistiré`) and an optional notes textarea.
- Submit all guest responses in one action through the existing API integration.
- Redirect to a success view after successful submission.

## Capabilities

### New Capabilities
- `guest-rsvp-by-token`: Validate an invitation token and capture per-guest attendance plus optional notes, with post-submit success redirection.

### Modified Capabilities
- None.

## Impact

- Frontend home route/page composition and navigation flow.
- Frontend API adapter for token validation, guest retrieval, and RSVP submission.
- UI state management for token step, guest form step, loading/errors, and success redirect.
- Potential backend contract alignment if token validation or RSVP payload shape is incomplete.
