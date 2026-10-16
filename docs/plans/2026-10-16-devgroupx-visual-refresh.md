# DevGroupX registration visual refresh

**Goal:** Make the existing registration application feel like the devgroupx.com website while retaining its current workflows.

**Architecture:** Keep React, Vite, routing, Express API, Postgres and authentication. Update shared design tokens, brand assets, homepage composition, auth presentation and the appearance of existing profile/admin controls. No database, endpoint, session or business-rule changes.

**Design:** Graphite backgrounds (#090a0b), white primary actions, restrained violet (#b8acf0), Inter headings/body and IBM Plex Mono labels. Exact supplied DevGroupX logo, static and softly visible behind the hero. Full-width surfaces with readable centered content; responsive navigation, accessible form controls and reduced-motion support. Existing copy remains Portuguese. Replace the visible Tripulação identity with DevGroupX.

## Implementation

- [ ] Copy the existing brand/favicons into public assets and update Brand and document metadata.
- [ ] Refresh Home with the DevGroupX hero, readable steps and useful links to the main site and support, preserving account-aware destinations and the private team entry.
- [ ] Refresh auth presentation and shared palette/controls across the five-step profile, candidate portal and admin screens. Preserve API calls, fields, data and access checks.
- [ ] Build and lint. Verify public routes, field validation/password visibility and keyboard focus. Use isolated browser API fixtures for candidate/admin layouts; do not create test records in production or retrieve private credentials.
- [ ] Check 320px, mobile, tablet and wide desktop layouts, inspect screenshots, and review touched React components for accessibility and state handling.
- [ ] Commit on codex/registration-visual-refresh, prepare a reviewable deployment in the existing Vercel project and verify its public routes and unchanged API behavior.

## Boundaries to verify

- Session-dependent links still choose the correct candidate/admin route.
- Logo never animates; reduced motion disables decorative text transitions.
- Input focus, selected options, notices and status indicators remain clear without green.
- Registration and sign-in still send exactly the existing request payloads.
- Server, database and private administrative state remain unchanged.
