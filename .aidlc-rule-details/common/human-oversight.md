# Human Oversight

## Principle

AI may accelerate work, but humans remain responsible for correctness, safety, architecture, and final integration.

## Require Human Validation When

- requirements are ambiguous
- architecture changes are proposed
- auth, roles, permissions, or security behavior are involved
- data model changes affect multiple parts of the system
- realtime or Supabase behavior is assumed without evidence
- the implementation changes workflow rules for the whole team

## Review Expectations

- review the plan before larger implementation
- review code before merge
- review verification results before merge

## Failure Mode to Avoid

Do not let AI continue confidently on top of a wrong assumption just because output looks plausible.
