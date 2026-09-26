---
name: 003-shortener-form
description: Shortening form with client-side URL validation and backend API client for POST /api/shorten
date: 2026-09-26
status: Implemented
---

# Spec · Plan · Tasks: Shortener Form

---

## [SPEC] Technical Scope & Contracts

- **Core Logic**: Pure validation functions + Alpine store orchestrating submit lifecycle.
- **UI (Alpine.js + Tailwind)**: Form bound to store; result link + copy button; inline error states.
- **API Client**: `POST /api/shorten` on the external backend (live-verified contract).
- **Configuration**: API base URL via `VITE_API_BASE_URL` (existing `src/config.js`; dev default `http://localhost:8080`).
- **Integration**: Clipboard API for copy (graceful no-op fallback when unavailable).

### Alpine.js Store
```js
// src/stores/shortener.js — registered as Alpine.store('shortener')
{
  longUrl: '',        // bound input
  shortUrl: null,     // derived on success: `${origin}/api/${code}`
  error: null,        // user-facing error message
  isSubmitting: false,
  async submit() {
    // 1. validate(longUrl) → error? set error, return
    // 2. isSubmitting = true; clear previous result/error
    // 3. shortenUrl(longUrl) → derive `${origin}/api/${code}` → set shortUrl | map error
    // 4. isSubmitting = false
  },
  onInput() { this.error = null; },  // clear error on edit
  async copy() { /* navigator.clipboard.writeText(shortUrl); no-op if unavailable */ }
}
```

### Validation Contract (`src/validation/urlRules.js`)
```js
// validateLongUrl(input: string): string | null  → error message or null
// Rules (mirror backend): non-empty (trimmed), parseable URL,
// scheme in allowlist ['http', 'https']
```

### API Contract (live endpoint)
```http
POST /api/shorten HTTP/1.1
Host: [API_BASE_URL]
Content-Type: application/json

{ "url": "https://example.com/very/long/path" }
```
**Response (201 Created):**
```json
{ "code": "aB3xK9m", "long_url": "https://example.com/very/long/url" }
```
No `short_url` field, no domain (deliberate, backend spec 009: no BASE_URL config). The frontend derives the full short URL from its own origin: `${window.location.origin}/api/${code}` (e.g. `https://demo.vijote.dev/api/aB3xK9m`).
**Error mapping:** 400 → show backend validation error message; 5xx / network → generic failure message.

### UI Behavior
- Success: keep long URL in input; show `short_url` as clickable link + "Copy" button below form.
- Error: inline message below input; cleared on next input event.
- Submit button disabled while `isSubmitting`.

### Acceptance Criteria (machine-verifiable)
- [ ] AC-001: `bun install --frozen-lockfile` completes without errors.
- [ ] AC-002: `bun run build` produces a production bundle without errors.
- [ ] AC-003: `bun run lint` reports no warnings or errors.
- [ ] AC-004: `bun run test` passes all unit and component tests.
- [ ] AC-005: DOM tests assert form renders, validation errors show/hide, and mocked 201/400/5xx responses render result/error states.

### Assumptions & Constraints
- Frontend-only: no persistence, no short-code generation client-side.
- Endpoint path is `/api/shorten` (appended to `apiBaseUrl`); base URL is config, not hardcoded.
- Tailwind utility classes only; no custom CSS beyond existing `src/style.css`.

---

## [PLAN] Architecture Delta & File Impact

| File Path | Op | Purpose |
|:---|:---|:---|
| `src/validation/urlRules.js` | Create | Pure validation: non-empty, parseable, scheme allowlist |
| `src/validation/urlRules.test.js` | Create | Unit tests for all validation branches |
| `src/api/shortener.js` | Create | `shortenUrl(url)` fetch wrapper → `{code, long_url}` or typed error |
| `src/api/shortener.test.js` | Create | Mocked fetch: 201, 400, 500, network failure |
| `src/stores/shortener.js` | Create | Alpine store: state + submit/copy/onInput actions |
| `src/stores/shortener.test.js` | Create | Store lifecycle tests against mocked API client |
| `index.html` | Update | Replace scaffold placeholder with form UI (Alpine directives + Tailwind) |
| `src/main.js` | Update | Import + register store before `Alpine.start()` |

### Architectural Layers
1. **View Layer** — `index.html`: `x-data` reads `Alpine.store('shortener')` via `$store`.
2. **State Layer** — `src/stores/shortener.js`: reactive state, submit lifecycle.
3. **API Layer** — `src/api/shortener.js`: endpoint path, JSON schemas, error mapping.
4. **Validation Layer** — `src/validation/urlRules.js`: pure functions, no DOM access.

### Verification Gates
- `bun install --frozen-lockfile`
- `bun run build`
- `bun run lint`
- `bun run test`

---

## [TASKS] Execution DAG

> Format: `- [ ] T### [Stage N: Label] Action in path (Depends on T###, ...)`

### Stage 1: Validation & API Layer
- [x] T001 [Stage 1: Validate] Implement `validateLongUrl` in `src/validation/urlRules.js`
- [x] T002 [Stage 1: Validate] Write unit tests in `src/validation/urlRules.test.js` (Depends on T001)
- [x] T003 [Stage 1: API] Create `shortenUrl` fetch client in `src/api/shortener.js`
- [x] T004 [Stage 1: API] Write mocked fetch tests in `src/api/shortener.test.js` (Depends on T003)

### Stage 2: State Layer
- [x] T005 [Stage 2: State] Create Alpine store in `src/stores/shortener.js` (Depends on T001, T003)
- [x] T006 [Stage 2: State] Write store lifecycle tests in `src/stores/shortener.test.js` (Depends on T005)

### Stage 3: UI & Wiring
- [x] T007 [Stage 3: UI] Build form markup (input, submit, result link, copy, error) in `index.html` (Depends on T005)
- [x] T008 [Stage 3: UI] Register store + init in `src/main.js` (Depends on T005)
- [x] T009 [Stage 3: UI] Write DOM/component tests in `src/shortener.test.js` (Depends on T007)

### Stage 4: Verification
- [x] T010 [Stage 4: Check] Run `bun run build` (Depends on T008)
- [x] T011 [Stage 4: Check] Run `bun run lint` (Depends on T008)
- [x] T012 [Stage 4: Check] Run `bun run test` (Depends on T009)

---

## [CHK] Technical Quality Gates

### Contract Completeness
- [ ] CHK001 Store state shape and actions fully defined?
- [ ] CHK002 `POST /api/shorten` request/response schemas (`{code, long_url}`, origin-derived short URL) documented?
- [ ] CHK003 API base URL via `VITE_API_BASE_URL` specified?

### Code Quality & Security
- [ ] CHK004 Error states mapped (400 / 5xx / network), no silent failures?
- [ ] CHK005 No backend logic client-side?
- [ ] CHK006 Input validated before submission, mirrors backend rules?
- [ ] CHK007 No secrets or hardcoded credentials?

### Machine-Verifiability
- [ ] CHK008 `*.test.js` files for validation, API client, store, DOM?
- [ ] CHK009 API interactions tested against mocked responses?
- [ ] CHK010 All ACs rely on `bun run build` / `bun run lint` / `bun run test`?
