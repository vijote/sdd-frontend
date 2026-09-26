---
name: [NNN-feature-name]
description: [One-sentence overview of the spec]
date: [DATE]
status: Draft
---

# Spec · Plan · Tasks: [FEATURE_NAME]

---

## [SPEC] Technical Scope & Contracts

- **Core Logic**: [Alpine.js stores / reactive state / validation logic]
- **UI (Alpine.js + Tailwind)**: [Components (`x-data` scopes) / views / user interactions]
- **API Client**: [Backend endpoints consumed / request & response JSON schemas / error mapping]
- **Configuration**: [API base URL / env handling via Vite (`import.meta.env`)]
- **Integration**: [External services / browser APIs]

### Alpine.js Components & Stores
```js
// Example store registration
Alpine.store('shortener', {
  longUrl: '',
  shortUrl: null,
  error: null,
  isSubmitting: false,
  async shorten() { /* calls API client */ }
})

// Example component scope
// x-data="shortenerForm()" — reactive state shape:
{
  longUrl: '',
  result: null,
  error: null
}
```

### API Contracts (consumed from the external backend)
```http
POST /shorten HTTP/1.1
Host: [API_BASE_URL]
Content-Type: application/json

{
  "url": "https://example.com/very/long/path"
}
```
**Response (201 Created):**
```json
{
  "short_code": "aB3xY9k",
  "short_url": "https://demo.vijote.dev/aB3xY9k"
}
```
**Error mapping:** 400 → show validation error; 5xx → show generic failure message.

### Acceptance Criteria (machine-verifiable)
- [ ] AC-001: `bun install --frozen-lockfile` completes without errors.
- [ ] AC-002: `bun run build` produces a production bundle without errors.
- [ ] AC-003: `bun run lint` reports no warnings or errors.
- [ ] AC-004: `bun run test` passes all unit and component tests.
- [ ] AC-005: UI renders expected elements/states and handles mocked API success/error responses correctly.

### Assumptions & Constraints
- This repo is frontend-only: no persistence, no short-code generation (backend owns those).
- API base URL is configuration, not hardcoded (backend registers routes without an `/api` prefix).
- Styling is Tailwind utility classes; custom CSS only via justified Tailwind config extensions.
- Client-side URL validation mirrors backend rules (scheme allowlist: `http`/`https`, non-empty, parseable).

---

## [PLAN] Architecture Delta & File Impact

| File Path | Op | Purpose |
|:---|:---|:---|
| `index.html` | Modify | App shell, Alpine/Tailwind mount points |
| `src/main.js` | Modify | Alpine init, store registrations |
| `src/stores/[domain].js` | Create | Reactive state + actions |
| `src/api/[client].js` | Create | Backend API client (fetch wrapper) |
| `src/validation/[rules].js` | Create | Client-side input validation |
| `src/[domain]/[file].test.js` | Create | Unit / component tests |

### Architectural Layers
1. **View Layer** — HTML templates with Alpine directives (`x-data`, `x-show`, `x-model`) and Tailwind classes.
2. **State Layer** — Alpine stores: reactive state, actions, computed values.
3. **API Layer** — fetch-based client: endpoint paths, JSON schemas, error mapping.
4. **Validation Layer** — pure functions mirroring backend input rules.

### Verification Gates
- `bun install --frozen-lockfile`
- `bun run build`
- `bun run lint`
- `bun run test`

---

## [TASKS] Execution DAG

> Format: `- [ ] T### [Stage N: Label] Action in \`path\` (Depends on T###, ...)`
> Rules: 1 task = 1 file edit or 1 verification command. Same-stage independent tasks run in parallel. Stage N+1 requires full Stage N completion.

### Stage 1: State & API Layer
- [ ] T001 [Stage 1: API] Create fetch-based API client in `src/api/[client].js`
- [ ] T002 [Stage 1: State] Create Alpine store in `src/stores/[domain].js` (Depends on T001)
- [ ] T003 [Stage 1: Validate] Write unit tests for API client in `src/api/[client].test.js` (Depends on T001)

### Stage 2: Validation & Business Logic
- [ ] T004 [Stage 2: Core] Implement validation rules in `src/validation/[rules].js` (Depends on T002)
- [ ] T005 [Stage 2: Core] Write unit tests for validation in `src/validation/[rules].test.js` (Depends on T004)

### Stage 3: UI & Components
- [ ] T006 [Stage 3: UI] Build component markup with Alpine directives + Tailwind in `index.html` (Depends on T002)
- [ ] T007 [Stage 3: UI] Register stores and init Alpine in `src/main.js` (Depends on T002)
- [ ] T008 [Stage 3: UI] Write component/DOM tests in `src/[domain]/[file].test.js` (Depends on T006)

### Stage 4: App Wiring & Validation
- [ ] T009 [Stage 4: App] Wire config (API base URL) via Vite env in `src/config.js` (Depends on T001)
- [ ] T010 [Stage 4: Validate] Run `bun run build` (Depends on T009)
- [ ] T011 [Stage 4: Validate] Run `bun run lint` (Depends on T009)
- [ ] T012 [Stage 4: Validate] Run `bun run test` (Depends on T009)

---

## [CHK] Technical Quality Gates

### Contract Completeness
- [ ] CHK001 Alpine stores, component scopes, and reactive state shapes clearly defined?
- [ ] CHK002 Backend endpoints, verbs, and expected JSON structures fully documented?
- [ ] CHK003 API base URL and Vite env configuration specified?

### Code Quality & Security
- [ ] CHK004 Proper error handling and user-facing error states (no silent failures)?
- [ ] CHK005 No backend logic implemented client-side (no persistence, no code generation)?
- [ ] CHK006 User input validated client-side before submission (mirrors backend rules)?
- [ ] CHK007 No secrets or hardcoded credentials in client code?

### Machine-Verifiability
- [ ] CHK008 Are there corresponding `*.test.js` files for core logic?
- [ ] CHK009 Are API interactions tested against mocked responses?
- [ ] CHK010 Do all Acceptance Criteria rely on `bun run build`, `bun run lint`, or `bun run test`?
