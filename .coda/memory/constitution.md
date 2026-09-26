<!--
Sync Impact Report:
Version change: 5.0.0 → 5.0.1 (PATCH: Clarify Principle 4 to reference the TASKS section of the consolidated spec file instead of a standalone tasks.md)
Modified principles: 4
Added sections: None
Removed sections: None
Follow-up TODOs: None
-->

# System & LLM Execution Directives

## Core Principles

### 1. Zero Narrative Policy
Skip all introductory conversational filler, user personas, marketing justifications, and high-level product narratives. Go directly to technical engineering contracts, JavaScript/Alpine.js interfaces, UI specifications, and machine-verifiable acceptance criteria.

### 2. Architecture First & Explicit Engineering Contracts
Use explicit engineering jargon, precise file paths, and exact JS module/function names. This project is the **frontend client** for the URL shortener: it consumes the external backend API and MUST NOT implement backend logic (no persistence, no short-code generation). Every specification and plan MUST define:
- Exact Alpine.js components (`x-data` scopes, `Alpine.store(...)` registrations) and their reactive state shapes
- HTML structure styled with Tailwind CSS utility classes (custom CSS only via justified Tailwind config extensions)
- API client contracts against the external backend: endpoint paths, methods, request/response JSON schemas, and error mapping (e.g. `POST /shorten`; `GET /{code}` redirect is handled server-side by the backend)
- API base URL as configuration (backend registers routes without an `/api` prefix; public base: `https://demo.vijote.dev`)
- Build tooling: Vite with `bun` as package manager/runtime
- Client-side input validation mirroring backend rules (scheme allowlist: `http`/`https`, non-empty, parseable)

### 3. Payload & Token Efficiency
Keep spec, plan, and architecture delta artifacts strictly below 200 lines. Use compact markdown tables, bullet points, and code blocks. Non-frontier and local LLMs (e.g. GLM-4.6, Qwen-Coder) must not experience reasoning degradation from bloated context windows.

### 4. Granular Dependency Tree (Micro-DAG)
Write the `TASKS` section of `specs/NNN-feature-name/spec-plan-tasks.md` as an acyclic dependency graph (DAG) where every task corresponds to a 1:1 file edit, JS module, Alpine component, UI view, or testing step with explicit dependency pointers:
`- [ ] T001 [Stage] Task description in path/to/file (Depends on Txxx)`

### 5. Machine-Verifiable Acceptance Gates
Never use vague adjectives ("robust", "scalable", "fast"). All acceptance criteria MUST be machine-verifiable through automated commands:
- Dependency install (`bun install --frozen-lockfile`)
- Production build (`bun run build`)
- Linting/formatting (`bun run lint`)
- Unit and component tests (`bun run test`)
- DOM assertions: expected rendered elements, reactive states, and applied Tailwind classes
- API interactions: expected HTTP calls, status-code handling, and JSON payload shapes (mocked)

### 6. Testing Policy
- **Automated Testing Required**: Generate unit tests for Alpine stores, the API client, and validation logic.
- **Component/DOM Testing**: Verify Alpine component rendering and reactivity against mocked API responses.
- **Validation Steps**: UI logic MUST be verifiable through the project's test runner (e.g. Vitest); manual browser-only checks are not an acceptance gate.

### 7. CI/CD Automation Policy
- **No Manual Approval Gates**: All builds, test suites, and static deployments must run fully automated on main branch push.
- **Input Validation via Automation**: Client-side long URL validation (scheme allowlist: `http`/`https`, non-empty, parseable) must be rigorously tested and validated in automation.

### 8. Prefer Standard Frontend Tooling Over Custom Scripts
- **Tooling-First Execution**: Use `bun`, Vite, the Tailwind CSS pipeline, and the project's lint/test runners as the primary mechanisms for validation and state management.

## Session Isolation Protocol
When implementing tasks with LLM agents, load only the minimal context payload:
1. Directive: `.coda/memory/constitution.md`
2. Active Single Task: Target file, action goal, and exact data/infrastructure contract
3. Instruction: Output ONLY the implementation code and verification command. No conversational text outside code blocks.

## Governance
This constitution is the non-negotiable governing standard for all artifacts in this repository. All PRs, plans, specifications, and task graphs must strictly adhere to these directives.

**Version**: 5.0.1 | **Ratified**: 2026-09-19 | **Last Amended**: 2026-09-26
