# AI-DLC Workflow

AWS AI-DLC inspired workflow for this repository.

This file defines the primary working mode for AI-assisted development in this project. It is intentionally more detailed than a minimal agent guide because the workflow should be explicit, reviewable, and repeatable.

Generative AI can make mistakes. All plans, code, decisions, and generated artifacts must be reviewed by a human before merge.

## Purpose

Use AI as a structured development partner, not as an autonomous replacement for engineering judgment.

Core pattern:

- AI analyzes intent
- AI asks clarifying questions when context is missing
- AI proposes a plan
- human validates critical decisions
- AI implements only approved next steps
- human verifies output and controls merge

## Project Context

- Repository: Smart Home Team 5
- Stack: React, TypeScript, Vite, React Router, Supabase
- Product state: early frontend scaffold with placeholder pages and prepared Supabase client
- Team size: 3 students
- Delivery model: GitHub Issues, feature branches, pull requests, reviews, release milestones

## Source of Truth

- GitHub Issues define the official work assignment
- code and tests define the implementation truth
- shared project docs remain under `docs/`
- personal AI work artifacts live under `docs/ai/<name>/`
- this file and `.aidlc-rule-details/` define the workflow rules for AI-assisted work

## Critical Rules

- Do not start implementation without a corresponding GitHub Issue
- Do not treat AI-generated output as approved by default
- Do not silently invent requirements, architecture decisions, or security behavior
- Do not mix personal AI notes into shared project docs unless the team agrees
- Keep changes small, reviewable, and easy to validate
- Prefer one coherent pull request per issue or sub-problem
- Document open questions, assumptions, decisions, and progress in a persistent file
- For risky topics such as auth, permissions, data model, realtime behavior, or rules logic, require explicit human validation before proceeding

## Activation

Start AI-DLC style work with a request such as:

`Using AI-DLC, work on issue #60 and use docs/ai/rsheed/issue-60-plan.md as the working artifact.`

## Working Artifacts

Primary persistent artifacts in this repository:

- `docs/ai/<name>/issue-<id>-plan.md`
- optional supporting files in `docs/ai/<name>/`
- shared workflow guidance in `.aidlc-rule-details/`

The persistent artifact must always capture:

- issue reference
- current goal
- scope and non-goals
- open questions
- assumptions
- decisions with rationale
- progress
- verification status
- next concrete step

## Three-Phase Adaptive Workflow

AI-DLC work follows three phases and can adapt to task complexity.

### 1. Inception

Goal:

- determine what is being built and why

Activities:

- understand the issue
- inspect current repository state
- identify missing context
- surface open questions
- define or refine acceptance criteria
- identify affected files, data, UI, and risks
- propose small units of work

Output:

- updated plan artifact
- clarified scope
- approved next step

### 2. Construction

Goal:

- determine how to build the approved unit of work

Activities:

- propose technical approach
- identify file changes
- implement only approved small steps
- update tests or verification steps
- keep artifact current after meaningful progress

Output:

- code and doc changes
- updated plan artifact
- verification results

### 3. Operations

Goal:

- prepare the work for integration and later traceability

Activities:

- summarize what changed
- record verification status
- prepare review context
- identify remaining risks or follow-up work

Output:

- PR-ready branch
- clear reviewable history
- documented next actions if work is incomplete

## Adaptive Depth

Not every issue needs the same ceremony.

Use lightweight flow for:

- tiny text updates
- small UI polish
- isolated refactors with low risk

Use fuller AI-DLC flow for:

- multi-step issues
- architecture changes
- auth or permissions
- state model changes
- Supabase or realtime behavior
- work that will continue across sessions

## Question-Driven Behavior

When context is missing, AI should not guess blindly.

AI should:

- ask for clarification
- record uncertainty in the plan artifact
- state assumptions explicitly if temporary continuation is necessary
- stop for human validation when the missing context affects behavior, security, or architecture

## Human Control Points

Human validation is expected before:

- changing architecture direction
- introducing new shared workflow conventions
- changing auth or role logic
- changing data model or persistence logic
- merging the final branch

## Verification Rules

At minimum, before merge:

- `npm run lint`
- `npm run build`

If tests exist or are affected, run them as well.

For documentation-only changes, explicitly record that code verification was not relevant.

## Repository-Specific Notes

- current app structure is still early and incomplete
- avoid over-designing the whole system before issue-level progress is made
- keep UI placeholders and domain evolution aligned with real requirements
- do not assume backend behavior exists just because the frontend references it

## Branch and Commit Rules

- Branch naming: `feature/<issue-id>/<kurzbeschreibung>`
- Target branch for features: `develop`
- Commit format: `#<issue-id> [<zeit>] <kurze beschreibung>`

See `docs/git-workflow.md`

## Rule Details

Detailed guidance is split into:

- `.aidlc-rule-details/common/`
- `.aidlc-rule-details/inception/`
- `.aidlc-rule-details/construction/`
- `.aidlc-rule-details/operations/`

Use those files as extensions of this workflow rather than duplicating all detail here.

## Personal Workspaces

Current personal workspace:

- `docs/ai/rsheed/`

Additional personal workspaces can be added later without changing the shared project documentation model.
