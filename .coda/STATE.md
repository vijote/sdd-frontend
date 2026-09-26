# Current Session State

**Current Spec:**
- `specs/003-shortener-form` — Implemented, all gates green (build/lint/test 24/24). Not yet committed.

**Objective:**
- Shortening form with client-side URL validation and backend API client for `POST /api/shorten`.

**Context (Why):**
- Live-verified contract: `POST /api/shorten` `{"url"}` → 201 `{"code", "long_url"}` — no `short_url`, no domain (backend spec 009). Frontend derives short URL from its own origin: `${window.location.origin}/api/${code}`.
- Validation mirrors backend rules: non-empty (trimmed), parseable, scheme allowlist `http`/`https`.
- UX: result as clickable link + Copy button below form; long URL kept in input; error cleared on edit; submit disabled while submitting.
- Biome override added for `index.html` (`useAnchorContent`/`useValidAnchor` off) — Biome cannot statically see Alpine-bound `x-bind:href`/`x-text`.

**Modified/Uncommitted Files:**
- `src/validation/urlRules.js` + test (new)
- `src/api/shortener.js` + test (new)
- `src/stores/shortener.js` + test (new)
- `src/shortener.test.js` (new, DOM tests)
- `index.html` (form UI), `src/main.js` (store registration), `biome.json` (a11y override)
- `specs/003-shortener-form/spec-plan-tasks.md` (new), `.coda/feature.json`, `.coda/STATE.md`

**Blockers/Unresolved Bugs:**
- None open.

**Next Immediate Steps:**
- Commit 003 (suggested: `feat(shortener-form): shortening form with validation and API client`).
- Live smoke test against https://demo.vijote.dev after deploy.
