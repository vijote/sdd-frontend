# Current Session State

**Current Spec:**
- `specs/004-relative-api-base` — DONE, committed (`cb6a1f0`), pushed. Working tree clean.
- Also this session: `specs/003-shortener-form` — DONE, committed (`dcab833`), pushed.

**Objective:**
- Ship the shortening form (003) and fix the API base URL to same-origin relative (004) so the deployed form actually works.

**Context (Why):**
- 003: shortening form with client-side validation (non-empty/parseable, scheme allowlist `http`/`https`), API client for `POST /api/shorten` (live contract: `{"url"}` → 201 `{"code", "long_url"}`; frontend derives short URL as `${origin}/api/${code}`), Alpine store, form UI, full test coverage (24 tests).
- Debugging 003's broken deploy: white unstyled page, JS served as `text/html`. Root cause was INFRA (sdd-infra-v2): ingress-level `rewrite-target: /$2` + `use-regex` rewrote ALL non-`/api` requests (including `/assets/*`) to `/`. Handoff doc written to `../sdd-infra-v2/.coda/docs/handoff-ingress-frontend-rewrite.md`; infra repo fixed it.
- 004: after the ingress fix, the form still failed — `src/config.js` baked `http://localhost:8080` as default. Fixed to `import.meta.env.VITE_API_URL ?? ''` (empty = same origin → relative `/api/shorten`, ingress routes `/api` to backend). `.env.example` documents the local-dev override. Grep gate: no `localhost:8080` in `src/`/`dist/`.
- Biome override in `biome.json` for `index.html` (`useAnchorContent`/`useValidAnchor` off) — Biome can't statically see Alpine-bound `x-bind:href`/`x-text`.

**Modified/Uncommitted Files:**
- None — working tree clean. All specs committed and pushed to `main`.

**Blockers/Unresolved Bugs:**
- None open. Carried over: live TLS chain curl can't verify (`-k`/`NODE_TLS_REJECT_UNAUTHORIZED=0` used for smoke tests; possibly corporate TLS intercept or incomplete LE chain).

**Next Immediate Steps:**
- Live smoke test at https://demo.vijote.dev after the `cb6a1f0` deploy completes: styles applied, form shortens end-to-end, short link resolves.
- If issues: check CI run, then ECR tag `cb6a1f0`-sha and the infra Deployment image.
