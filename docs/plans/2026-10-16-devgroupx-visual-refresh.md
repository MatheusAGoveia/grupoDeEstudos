# DevGroupX registration visual refresh

**Goal:** Make the existing registration application feel like the devgroupx.com website while retaining its current workflows.

**Architecture:** Keep React, Vite, routing, Express API, Postgres and authentication. Update shared design tokens, brand assets, homepage composition, auth presentation and the appearance of existing profile/admin controls. No database, endpoint, session or business-rule changes.

**Design:** Graphite backgrounds (#090a0b), white primary actions, restrained violet (#b8acf0), Inter headings/body and IBM Plex Mono labels. Exact supplied DevGroupX logo, static and softly visible behind the hero. Full-width surfaces with readable centered content; responsive navigation, accessible form controls and reduced-motion support. Existing copy remains Portuguese. Replace the visible Tripulação identity with DevGroupX.

## Implementation

- [x] Copy the existing brand/favicons into public assets and update Brand and document metadata.
- [x] Refresh Home with the DevGroupX hero, readable steps and useful links to the main site and support, preserving account-aware destinations and the private team entry.
- [x] Refresh auth presentation and shared palette/controls across the five-step profile, candidate portal and admin screens. Preserve API calls, fields, data and access checks.
- [x] Build and lint. Verify public routes, field validation/password visibility and keyboard focus. Use isolated browser API fixtures for candidate/admin layouts; do not create test records in production or retrieve private credentials.
- [x] Check 320px, mobile, tablet and wide desktop layouts, inspect screenshots, and review touched React components for accessibility and state handling.
- [x] Commit on codex/registration-visual-refresh, prepare a reviewable deployment in the existing Vercel project and verify its public routes and unchanged API behavior.

## Boundaries to verify

- Session-dependent links still choose the correct candidate/admin route.
- Logo never animates; reduced motion disables decorative text transitions.
- Input focus, selected options, notices and status indicators remain clear without green.
- Registration and sign-in still send exactly the existing request payloads.
- Server, database and private administrative state remain unchanged.

## Verification evidence

TypeScript/Vite production build passed locally and in Vercel. Browser fixtures verified registration request fields, password visibility, all five profile steps, save/submit and the candidate portal. Public, candidate and admin routes fit 320, 375, 390, 768, 1024, 1440 and 2560px; mobile sidebar width was corrected. Desktop/mobile screenshots were inspected. No production records were created and API/server/authentication files are unchanged. The Windows lint binding could not be installed reliably; final lint verification runs in the Linux preview build.

## Release result

Published at https://grupo-de-estudos-nine.vercel.app/. Production deployment `dpl_Dx4TidDkWS4vjmnqtFWMFSxiJvAM` uses application commit `e8f59708c68ce9520cc9b8f205c443ca361b4a5c`. Linux lint passed with zero errors and two pre-existing warnings in unchanged `src/App.tsx`; production build passed. Live browser checks confirmed homepage, login, registration, mobile layout, static logo and the unchanged anonymous `/api/me` JSON 401 response. Source review: https://github.com/MatheusAGoveia/grupoDeEstudos/pull/1.
