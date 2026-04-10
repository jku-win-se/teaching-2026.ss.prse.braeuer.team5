# Artifact Management

## Purpose

Persistent working artifacts make AI-assisted work reviewable and resumable.

## Required Artifact Behavior

- Every non-trivial issue should have one primary plan file
- The plan file must be updated when scope, decisions, progress, or blockers change
- The plan file must not become a full chat transcript
- The plan file should stay concise and structured

## Required Sections

- Meta
- Goal
- Scope
- Acceptance Criteria
- Repo Context
- Open Questions
- Assumptions
- Decisions
- Plan
- Progress
- Verification
- Next Step

## Repository Convention

Primary location:

- `docs/ai/<name>/issue-<id>-plan.md`

## Shared vs Personal

- Shared docs remain under `docs/`
- Personal AI artifacts remain under `docs/ai/<name>/`
- Do not turn personal notes into shared docs without explicit team agreement
