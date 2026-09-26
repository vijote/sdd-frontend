---
name: 002-1-ci-oidc-permission
description: Add id-token write permission to the CI docker job so configure-aws-credentials can assume AWS roles via OIDC.
date: 2026-09-26
status: Implemented
---

# Spec · Plan · Tasks: 002-1-ci-oidc-permission

---

## [SPEC] Technical Scope & Contracts

- **Bug**: `docker` job fails at "Configure AWS Bootstrap Credentials" — GitHub OIDC token cannot be minted without `id-token: write`
- **Fix**: job-level `permissions: { id-token: write, contents: read }` on the `docker` job only (least-privilege; `test` job unaffected)
- **Reference**: old backend CI used workflow-level `id-token: write` + `contents: read`

### Acceptance Criteria (machine-verifiable)
- [ ] AC-001: `docker` job passes the AWS credential steps on next main push (OIDC token minted, roles assumed).

### Assumptions & Constraints
- Workflow-level `contents: read` stays; job-level permissions override for `docker` only.

---

## [TASKS] Execution DAG

- [x] T001 [Stage 1: CI] Add job-level `permissions` block to `docker` job in `.github/workflows/ci.yml`

---

## [CHK] Technical Quality Gates

- [x] CHK001 Permission scoped to `docker` job (not workflow-wide)?
- [x] CHK002 `contents: read` preserved for checkout?
