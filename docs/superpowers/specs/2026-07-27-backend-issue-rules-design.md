# Design Spec: Backend Issue Rules & Verification Protocol
Date: 2026-07-27

## 1. Objectives
- Establish an authoritative rules document (`RULES.md`) for checking, testing, and reporting backend API mismatches.
- Update `CLAUDE.md` to reference `RULES.md` and standardise backend audit practices.
- Detail the current backend anomalies (such as Stripe Checkout currency, cycle durations, duplicate signups, and webhook activation failures) with exact request/response schemas.

## 2. Approach: Integrated Documentation (Approach A)
- **CLAUDE.md**: Adds context referencing the status of live API endpoints, routing to `RULES.md` for CLI testing, payload rules, and log locations.
- **RULES.md**: Contains actionable validation checklists for devs (e.g. integer cents in AUD, 28-day cycle validation, unique constraints for spin wheels, 409 error propagation).
- **docs/BACKEND-ISSUES.md**: Remains the living document of verified live bugs, stack traces, and response payloads.

## 3. Detailed Verification Scenarios
- **Registration & Login**:
  - Auto-generate test credentials (`fe-test-<timestamp>@example.com`).
  - Capture access and refresh tokens directly in the registration payload logic if code allows it.
  - Return `requires_payment: true` for paid signups, routing to `POST /stripe/checkout`.
- **Duplicate Account Gate**: Check for `409 ACCOUNT_PENDING_PAYMENT` on re-registrations.
- **Stripe Webhook CS & Allocation**: Verify incoming webhook calls on test runs (using Stripe test cards `4242...`) to ensure a new cycle generates 4 draw passes and correctly sets tokens.
- **Spin Wheel Eligibility**: Validate constraints on `user_id` + `moment` to block multi-plan spin farm exploits.

## 4. Spec Review Rules
- Check standard output constraints.
- No dummy/placeholder values.
