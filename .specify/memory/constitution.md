# <!--
# Sync Impact Report
# Version change: TEMPLATE/unknown -> 0.1.0
# Modified principles:
# - [PRINCIPLE_1_NAME] -> I. Readable & Maintainable Code
# - [PRINCIPLE_2_NAME] -> II. Unit-Test Business Logic
# - [PRINCIPLE_3_NAME] -> III. Follow Best Practices
# - [PRINCIPLE_4_NAME],[PRINCIPLE_5_NAME] -> removed (placeholders replaced)
# Added sections:
# - Additional Constraints
# - Development Workflow
# Governance updated with explicit amendment & versioning policy
# Templates updated:
# - ✅ .specify/templates/plan-template.md
# - ✅ .specify/templates/spec-template.md
# - ✅ .specify/templates/tasks-template.md
# - ⚠ .specify/templates/commands/*.md (no commands/ directory found; none to update)
# Follow-up TODOs:
# - Ratification date set to 2025-10-31 in the constitution.
# - Manually review .specify/templates/* for project-specific placeholders
#   (e.g., LANGUAGE, TEST_FRAMEWORK) and update when feature-specific decisions are made.
# -->

# schratcho-crawler Constitution

## Core Principles

### I. Readable & Maintainable Code (NON-NEGOTIABLE)
Code MUST be written for humans first. This project requires clear naming, small
functions/modules, and in-code documentation where intent is not obvious. Every
public function or module interface MUST include a concise description of
inputs, outputs, and error conditions. Code formatting and style conventions
MUST be enforced via linting and automated formatting in CI.

Rationale: Readability reduces onboarding time, decreases bugs, and improves
long-term maintainability.

### II. Unit-Test Business Logic (NON-NEGOTIABLE)
Business logic MUST have fast, deterministic unit tests that exercise the
logic in isolation from I/O, network, and external services. Tests for business
logic MUST be included with every feature and are a required part of PRs.

Rationale: Unit tests ensure correctness of core behavior and provide
confidence for refactors and future changes.

### III. Follow Best Practices (MUST)
The project MUST follow established best practices: use minimal and well-audited
dependencies, prefer explicit invariants over clever shortcuts, and prefer
simplicity (YAGNI) where appropriate. Code reviews MUST validate architecture
decisions, complexity trade-offs, and adherence to these principles.

Rationale: Best practices limit technical debt and keep the codebase healthy as
it grows.

## Additional Constraints

- Security: Sensitive data MUST not be committed. Secrets MUST be stored in
	environment-managed secrets (CI/CD secret stores). Any change that touches
	data handling or storage MUST include a short security impact note in the PR.
- Performance: Reasonable performance targets should be documented in plans;
	unless stated otherwise, optimize for clarity first and measure before
	optimizing.
- Dependencies: New direct runtime dependencies MUST be justified in the PR
	description (why the dependency is required, alternatives considered).

## Development Workflow

- Pull requests MUST include: description, linked spec/task, tests, and CI-green
	before merge. Code review by at least one other contributor is REQUIRED.
- CI gates MUST include: lint/format, unit tests, and the constitution check
	(see Governance → Amendment & Compliance). Releases MUST be tagged and follow
	semantic versioning.

## Governance

Amendments: Changes to this constitution require a documented proposal in a PR
that cites the reasons and migration steps. A MINOR version bump is required for
additive principles or expanded guidance; a MAJOR bump is required for removals
or redefinitions of existing principles. Patch bumps are for wording and
clarity-only edits.

Compliance: Every PR is expected to reference the relevant constitution
principles it touches. Non-compliant changes MUST include an explicit
justification in the PR and a remediation plan.

Versioning Policy: Version numbers follow MAJOR.MINOR.PATCH with the rules
above. The project SHOULD aim for conservative MAJOR bumps.

**Version**: 0.1.0 | **Ratified**: 2025-10-31 | **Last Amended**: 2025-10-31
