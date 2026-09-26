---
name: 001-frontend-scaffold
description: Scaffold the URL shortener frontend app with Vite + bun, bundled Alpine.js, Tailwind CSS v4, Biome, and Vitest + happy-dom, with automated CI.
date: 2026-09-26
status: Implemented
---

# Spec · Plan · Tasks: 001-frontend-scaffold

---

## [SPEC] Technical Scope & Contracts

- **Build tooling**: Vite + `bun` as package manager/runtime; plain JavaScript (no TypeScript)
- **UI runtime**: Alpine.js 3.x installed from npm and bundled by Vite (no CDN)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin (CSS-first, no `tailwind.config.js`)
- **Lint/format**: Biome as the single lint+format tool
- **Testing**: Vitest + happy-dom; app bootstrap verified by unit test
- **Configuration**: API base URL via Vite env (`import.meta.env.VITE_API_BASE_URL`), dev default `http://localhost:8080`
- **Deployment**: deferred — this spec delivers the build pipeline and `dist/` output only

### Contracts
```json
// package.json scripts
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "biome check .",
  "test": "vitest run"
}
```
```js
// src/config.js
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
```
```html
<!-- index.html mount contract -->
<div id="app" x-data="{ ready: false }" x-init="ready = true">…</div>
<script type="module" src="/src/main.js"></script>
```
```js
// src/main.js — Alpine bundled, not CDN
import Alpine from 'alpinejs'
import './style.css'
window.Alpine = Alpine
Alpine.start()
```

### Acceptance Criteria (machine-verifiable)
- [ ] AC-001: `bun install --frozen-lockfile` completes without errors.
- [ ] AC-002: `bun run build` produces `dist/` without errors.
- [ ] AC-003: `bun run lint` reports 0 errors.
- [ ] AC-004: `bun run test` passes all tests.
- [ ] AC-005: `dist/index.html` contains no CDN script tags (Alpine bundled into assets).

### Assumptions & Constraints
- Frontend-only: no persistence, no short-code generation (backend owns those).
- API base URL is configuration, never hardcoded in components.
- Styling is Tailwind utility classes; custom CSS only via justified Tailwind v4 theme extensions.
- Static deploy wiring is a follow-up spec.

---

## [PLAN] Architecture Delta & File Impact

| File Path | Op | Purpose |
|:---|:---|:---|
| `package.json` | Create | Scripts, deps (alpinejs), devDeps (vite, @tailwindcss/vite, tailwindcss, @biomejs/biome, vitest, happy-dom) |
| `bun.lock` | Create | Frozen lockfile via `bun install` |
| `vite.config.js` | Create | Vite + Tailwind v4 plugin + vitest config (happy-dom) |
| `index.html` | Create | App shell, `#app` mount, module script entry |
| `src/main.js` | Create | Alpine import/start, style import |
| `src/config.js` | Create | `apiBaseUrl` from `import.meta.env` |
| `src/style.css` | Create | `@import "tailwindcss"` (v4 CSS-first) |
| `src/main.test.js` | Create | Bootstrap smoke test (config export, mount renders) |
| `.env.example` | Create | `VITE_API_BASE_URL` documented |
| `.gitignore` | Create | `node_modules/`, `dist/`, `.env` |
| `biome.json` | Create | Biome lint/format config |
| `.github/workflows/ci.yml` | Update | Already bun-based (001 CI); verify gates match scripts |

### Architectural Layers
1. **View Layer** — `index.html` shell with Alpine directives + Tailwind classes.
2. **State Layer** — Alpine started in `src/main.js`; stores arrive in later specs.
3. **Config Layer** — `src/config.js`: env-driven API base URL.
4. **Tooling Layer** — Vite, Tailwind v4 plugin, Biome, Vitest.

### Verification Gates
- `bun install --frozen-lockfile`
- `bun run build`
- `bun run lint`
- `bun run test`

---

## [TASKS] Execution DAG

> Format: `- [ ] T### [Stage N: Label] Action in \`path\` (Depends on T###, ...)`
> Rules: 1 task = 1 file edit or 1 verification command. Same-stage independent tasks run in parallel. Stage N+1 requires full Stage N completion.

### Stage 1: Scaffold & Config
- [x] T001 [Stage 1: Scaffold] Create `package.json` with scripts and dependencies
- [x] T002 [Stage 1: Scaffold] Run `bun install` to generate `bun.lock` (Depends on T001)
- [x] T003 [Stage 1: Config] Create `vite.config.js` with Tailwind v4 plugin + vitest/happy-dom config (Depends on T001)
- [x] T004 [Stage 1: Config] Create `src/config.js` and `.env.example` (Depends on T001)
- [x] T005 [Stage 1: Scaffold] Create `.gitignore` (Depends on T001)

### Stage 2: App Shell & Styling
- [x] T006 [Stage 2: UI] Create `index.html` with `#app` mount and module entry (Depends on T003)
- [x] T007 [Stage 2: UI] Create `src/main.js` (bundled Alpine start) and `src/style.css` (Depends on T003)

### Stage 3: Quality Tooling & Tests
- [x] T008 [Stage 3: Lint] Create `biome.json` and verify `bun run lint` passes (Depends on T002, T007)
- [x] T009 [Stage 3: Test] Create `src/main.test.js` bootstrap smoke test (Depends on T007)
- [x] T010 [Stage 3: Validate] Run `bun run build` (Depends on T006, T007)
- [x] T011 [Stage 3: Validate] Run `bun run test` (Depends on T009)
- [x] T012 [Stage 3: Validate] Verify `dist/index.html` has no CDN scripts (Depends on T010)

### Stage 4: CI Alignment
- [x] T013 [Stage 4: CI] Verify `.github/workflows/ci.yml` gates match `package.json` scripts (Depends on T010, T011, T012)

---

## [CHK] Technical Quality Gates

### Contract Completeness
- [ ] CHK001 Scripts (`dev/build/preview/lint/test`) fully defined in `package.json`?
- [ ] CHK002 API base URL env-driven with dev default, documented in `.env.example`?
- [ ] CHK003 Alpine bundled from npm (no CDN) and verified by AC-005?

### Code Quality & Security
- [ ] CHK004 No backend logic client-side (no persistence, no code generation)?
- [ ] CHK005 No secrets or hardcoded credentials in client code?
- [ ] CHK006 `.env` gitignored (only `.env.example` committed)?

### Machine-Verifiability
- [ ] CHK007 Are there `*.test.js` files for bootstrap logic?
- [ ] CHK008 Do all ACs rely on `bun run build`, `bun run lint`, or `bun run test`?
- [ ] CHK009 Does CI run the same gates as local verification?
