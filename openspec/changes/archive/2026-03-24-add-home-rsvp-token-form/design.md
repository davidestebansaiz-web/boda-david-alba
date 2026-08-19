## Context

The frontend app currently has a minimal home page and no RSVP flow, while the backend public RSVP contract is invitation-level (`guestName`, `maxGuests`, aggregate RSVP fields) instead of per-invitee status and notes. The requested UX requires a token-first flow that supports both QR URL entry and manual token entry, then a per-invitee form and a success redirection.

## Goals / Non-Goals

**Goals:**
- Provide a home-page RSVP component with two-step UX: token validation then per-invitee response form.
- Support token acquisition from URL (QR landing) and manual input in the same flow.
- Submit one payload containing attendance and optional notes for each invitee associated with the token.
- Redirect to a dedicated success view after a successful submission.

**Non-Goals:**
- Redesigning the whole site navigation or adding authentication.
- Building admin management UX in this change.
- Implementing QR generation; this change only consumes tokenized URLs.

## Decisions

### Decision: Two-step state machine in a single home-page flow
The component will use explicit UI states (`token-entry`, `loading-token`, `guest-form`, `submitting`, `success`, `error`) to keep behavior deterministic and easy to test.

Alternatives considered:
- Multiple disconnected components with implicit state in local variables: rejected due to harder recovery and validation handling.
- Route-per-step wizard: rejected to keep the first iteration simple and embedded in the home page.

### Decision: Token source precedence and normalization
The component will attempt to read token from URL on initial load (QR flow), prefill the token input, and auto-trigger token validation to reduce friction for QR users. If validation fails, users remain on the token step and can edit/replace the token manually. Token strings will be trimmed before API calls.

Alternatives considered:
- URL token as immutable source: rejected because users may need to correct malformed links.
- Manual input only: rejected because QR scan deep-link is a core requirement.

### Decision: Per-invitee API contract for context and submission
The flow will rely on API DTOs that include invitee rows in the token context response and accept per-invitee RSVP items on submission. This avoids lossy conversion from per-person radio attendance choices/notes into aggregate invitation-level fields.

Alternatives considered:
- Map per-invitee UI into existing aggregate RSVP fields (`status`, `attendingCount`, `message`): rejected because it cannot persist per-invitee notes or independent attendance decisions.
- Store per-invitee data only client-side and submit aggregate data: rejected because information would be lost.

### Decision: Success as explicit terminal route/state
After successful submission, users will be redirected to a success view so refresh/back behavior does not accidentally re-submit the form.

Alternatives considered:
- Inline success toast in same form: rejected because it leaves stale editable state and higher double-submit risk.

### Decision: React Hook Form + Zod + React Query in application hook layer
Frontend orchestration is centralized in a dedicated feature hook that coordinates token validation, invitee form submission, URL success state, and API error handling. Token and invitee forms are managed with React Hook Form using Zod schemas, and all network calls run via React Query mutations.

Alternatives considered:
- Local `useState` form management: rejected due to higher manual validation and state-sync complexity.
- Direct `fetch` calls from the render component: rejected to avoid coupling IO logic with UI rendering and to improve testability.

## Risks / Trade-offs

- [API shape mismatch with current invitation-level contract] -> Mitigation: update OpenAPI and backend handlers in the same change; keep strict DTO typing in frontend adapter.
- [Users open link without token or with invalid token] -> Mitigation: always keep manual token input visible with clear validation and retry path.
- [Partial save on multi-invitee payload] -> Mitigation: require atomic backend validation/persistence and return consistent error when any invitee entry is invalid.
- [Home page complexity increases] -> Mitigation: isolate RSVP flow into a dedicated component/module and keep App composition thin.

## Migration Plan

1. Extend API contract for token context and submission payload to represent invitee lists.
2. Implement backend mapping/validation/persistence for per-invitee RSVP data.
3. Build frontend RSVP component in the home page with token and guest-form states.
4. Add success view/route and redirect on successful submit.
5. Validate end-to-end with manual and URL-token entry paths.

Rollback strategy:
- Revert frontend component integration and API contract/handler changes together to restore previous invitation-level behavior.

## Open Questions

- URL token source for v1 is implemented as both query (`?token=`) and path (`/rsvp/:token`), with query taking precedence when both are present.
- Should existing invitation-level RSVP records be migrated to per-invitee records, or can they coexist during transition?
- What should be displayed as invitee label when the backend has a seat without a specific name (for example companion slots)?
