---
name: 004-relative-api-base
description: Make the API base URL relative (same-origin) with build-time VITE_API_URL override for local dev
date: 2026-09-26
status: Implemented
---

# Spec · Plan · Tasks: Relative API Base

---

## [SPEC] Technical Scope & Contracts

- **Problem**: `src/config.js` defaults `VITE_API_BASE_URL` to `http://localhost:8080`. Deployed builds bake that literal in; browser calls go to the user's own machine → form can never work in prod.
- **Fix**: API base defaults to `""` (same origin). Calls become relative `/api/shorten`; the browser resolves against the page origin and the ingress routes `/api` to the backend.
- **Configurability**: build-time env `VITE_API_URL` overrides the base (e.g. local dev against a running backend: `VITE_API_URL=http://localhost:8080`).
- **Out of scope**: ingress/backend changes (infra repo, already fixed).

### Config Contract (`src/config.js`)
```js
export const apiBaseUrl = import.meta.env.VITE_API_URL ?? '';
// '' = same origin → fetch(`${apiBaseUrl}/api/shorten`)
```

### Acceptance Criteria (machine-verifiable)
- [x] AC-001: `bun run build` succeeds.
- [x] AC-002: `bun run lint` reports no errors.
- [x] AC-003: `bun run test` passes — including a test asserting the deployed default is same-origin (empty base) and that `shortenUrl` requests end in `/api/shorten`.
- [x] AC-004: `grep -r "localhost:8080" src/ dist/` returns no production-code matches (only `.env.example` / docs may mention it).

---

## [PLAN] Architecture Delta & File Impact

| File Path | Op | Purpose |
|:---|:---|:---|
| `src/config.js` | Update | Default `''` (same origin); read `VITE_API_URL` instead of `VITE_API_BASE_URL` |
| `src/main.test.js` | Update | Assert `apiBaseUrl` is a string (empty default = same origin) |
| `src/api/shortener.test.js` | Update | Assert request URL is exactly `<base>/api/shorten` with empty base |
| `.env.example` | Update | Document `VITE_API_URL` (empty = same origin; example for local dev) |

### Notes
- `src/api/shortener.js` unchanged — already builds `${apiBaseUrl}/api/shorten`.
- Store/DOM tests unchanged — they mock the API client.

---

## [TASKS] Execution DAG

- [x] T001 Update `src/config.js` to `import.meta.env.VITE_API_URL ?? ''`
- [x] T002 Update `src/main.test.js` config assertions (Depends on T001)
- [x] T003 Tighten `src/api/shortener.test.js` URL assertion to `'/api/shorten'` (Depends on T001)
- [x] T004 Update `.env.example` with `VITE_API_URL` docs (Depends on T001)
- [x] T005 Run gates: `bun run build` + `bun run lint` + `bun run test` (Depends on T002, T003, T004)

---

## [CHK] Technical Quality Gates

- [x] CHK001 No hardcoded absolute backend URL in bundled code?
- [x] CHK002 Same-origin default verified by unit test?
- [x] CHK003 Local-dev override documented in `.env.example`?
- [x] CHK004 All ACs map to `bun run build` / `lint` / `test` / grep?
