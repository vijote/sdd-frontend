# Current Session State

**Current Spec:**
- `specs/004-relative-api-base` — Implemented, all gates green (build/lint/test 24/24 + grep gate). Not yet committed.

**Objective:**
- API base URL relative (same-origin) with build-time `VITE_API_URL` override for local dev.

**Context (Why):**
- After the infra ingress fix (sdd-infra-v2, handoff doc in its `.coda/docs/`), the frontend still called `http://localhost:8080` (baked default) — browser-side calls can never reach the pod's localhost.
- Fix: `src/config.js` → `import.meta.env.VITE_API_URL ?? ''`; empty = same origin → relative `/api/shorten`, ingress routes `/api` to backend.
- `.env.example` documents the override (`VITE_API_URL=http://localhost:8080` for local dev).
- Grep gate confirms no `localhost:8080` in `src/` or `dist/`.

**Modified/Uncommitted Files:**
- `src/config.js`, `src/main.test.js`, `src/api/shortener.test.js`, `.env.example`
- `specs/004-relative-api-base/spec-plan-tasks.md` (new), `.coda/feature.json`, `.coda/STATE.md`

**Blockers/Unresolved Bugs:**
- None open.

**Next Immediate Steps:**
- Commit 004 (suggested: `fix(api-base): same-origin relative base with VITE_API_URL override`).
- After deploy: live smoke test — shorten a URL end-to-end at https://demo.vijote.dev.
