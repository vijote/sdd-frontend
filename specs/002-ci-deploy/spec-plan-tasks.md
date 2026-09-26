---
name: 002-ci-deploy
description: Add a Docker image pipeline (bun build → nginx:alpine) and CI deploy job that pushes to ECR and triggers the infra repo's frontend image deploy.
date: 2026-09-26
status: Implemented
---

# Spec · Plan · Tasks: 002-ci-deploy

---

## [SPEC] Technical Scope & Contracts

- **Image**: multi-stage Docker build — `oven/bun:1` builds `dist/`, `nginx:alpine` serves it on port 80
- **SPA fallback**: custom `nginx.conf` — unknown paths serve `index.html` (`try_files`)
- **ECR**: push to `sdd-k8s-platform/frontend` (Terraform-managed in sdd-infra-v2), tags `:${SHA}` + `:latest`
- **Deploy trigger**: dispatch `deploy-images.yml` in `vijote/sdd-infra-v2` with `frontend_image_tag=${SHA}` (PAT `INFRA_PAT`, `actions:write`)
- **CI structure**: `test` job unchanged (install/build/lint/test); new `docker` job (`needs: test`, main push/dispatch)

### Contracts
```dockerfile
# Dockerfile (shape)
FROM oven/bun:1 AS build      # bun install --frozen-lockfile && bun run build
FROM nginx:alpine             # COPY nginx.conf, COPY dist/ → /usr/share/nginx/html
```
```nginx
# nginx.conf (shape)
server { listen 80; root /usr/share/nginx/html;
         location / { try_files $uri $uri/ /index.html; } }
```
```yaml
# .github/workflows/ci.yml docker job (shape)
docker:
  needs: test
  if: workflow_dispatch || (push && refs/heads/main)
  steps: aws bootstrap creds → ECR role (role-chaining) → ecr-login
         → docker build-push tags [:SHA, :latest]
         → gh workflow run deploy-images.yml --repo vijote/sdd-infra-v2
           -f frontend_image_tag=${SHA}   # GH_TOKEN: INFRA_PAT
```
```text
# Required GitHub repo configuration (manual, one-time)
Variables: AWS_REGION, AWS_BOOTSTRAP_ROLE_ARN, AWS_ECR_ROLE_ARN, AWS_ECR_REPOSITORY
Secret:    INFRA_PAT (PAT with actions:write on vijote/sdd-infra-v2)
```

### Acceptance Criteria (machine-verifiable)
- [x] AC-001: `docker build -t sdd-frontend:local .` completes without errors.
- [x] AC-002: container serves `/` with the app HTML (HTTP 200).
- [x] AC-003: container serves `/nonexistent` with the app HTML (SPA fallback, HTTP 200).
- [x] AC-004: `bun run lint` reports 0 errors.
- [ ] AC-005: CI `docker` job pushes `:$SHA` and `:latest` to `sdd-k8s-platform/frontend` and dispatches the infra deploy (verified on first main push).

### Assumptions & Constraints
- Frontend-only: image serves static files; no backend logic in the container.
- ECR repo and infra deploy workflow already exist (sdd-infra-v2 012-ecr-image-deploy).
- GitHub repo configuration (variables/secret) is a manual prerequisite — listed above, not automated here.

---

## [PLAN] Architecture Delta & File Impact

| File Path | Op | Purpose |
|:---|:---|:---|
| `Dockerfile` | Create | Multi-stage build: bun build → nginx serve |
| `.dockerignore` | Create | Exclude `node_modules/`, `dist/`, `.git`, `.coda`, `.env` |
| `nginx.conf` | Create | Port 80, SPA fallback via `try_files` |
| `.github/workflows/ci.yml` | Update | Add `docker` job (ECR push + infra deploy dispatch) |

### Architectural Layers
1. **Build Layer** — `oven/bun:1`: reproducible `bun install --frozen-lockfile` + `bun run build`.
2. **Serve Layer** — `nginx:alpine` + `nginx.conf`: static serving, SPA fallback, port 80 (matches infra probes).
3. **Pipeline Layer** — CI `docker` job: auth chain (bootstrap → ECR role), push, deploy dispatch.

### Verification Gates
- `docker build -t sdd-frontend:local .`
- Container run: `/` and `/nonexistent` return app HTML (HTTP 200)
- `bun run lint`

---

## [TASKS] Execution DAG

> Format: `- [ ] T### [Stage N: Label] Action in \`path\` (Depends on T###, ...)`
> Rules: 1 task = 1 file edit or 1 verification command. Same-stage independent tasks run in parallel. Stage N+1 requires full Stage N completion.

### Stage 1: Container Definition
- [x] T001 [Stage 1: Docker] Create `Dockerfile` (multi-stage: oven/bun:1 → nginx:alpine)
- [x] T002 [Stage 1: Docker] Create `nginx.conf` with SPA fallback (Depends on T001)
- [x] T003 [Stage 1: Docker] Create `.dockerignore` (Depends on T001)

### Stage 2: Image Validation
- [x] T004 [Stage 2: Validate] Run `docker build -t sdd-frontend:local .` (Depends on T002, T003)
- [x] T005 [Stage 2: Validate] Run container + verify `/` and `/nonexistent` return app HTML (Depends on T004)
- [x] T006 [Stage 2: Validate] Run `bun run lint` (Depends on T003)

### Stage 3: CI Deploy Pipeline
- [x] T007 [Stage 3: CI] Add `docker` job to `.github/workflows/ci.yml` (ECR push + infra deploy dispatch) (Depends on T005, T006)

### Stage 4: Tracking
- [x] T008 [Stage 4: Docs] Document manual GitHub repo prerequisites (variables + INFRA_PAT) in spec completion report (Depends on T007)

---

## [CHK] Technical Quality Gates

### Contract Completeness
- [x] CHK001 Image serves on port 80 (matches infra Deployment probes)?
- [x] CHK002 SPA fallback configured (`try_files … /index.html`)?
- [x] CHK003 ECR repo name matches Terraform (`sdd-k8s-platform/frontend`)?

### Code Quality & Security
- [x] CHK004 No secrets in Dockerfile or workflow (all via GitHub vars/secrets)?
- [x] CHK005 `.env` and `.coda` excluded from image (`.dockerignore`)?
- [x] CHK006 Deploy dispatch uses least-privilege PAT (`actions:write` only)?

### Machine-Verifiability
- [x] CHK007 Are image ACs verifiable with local docker commands?
- [x] CHK008 Does CI reuse the same test gates before docker build (`needs: test`)?
