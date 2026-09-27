# Phase 86 — Placement Offer Rules

Implemented server-side placement offer rules on top of Phase 85.

## Rules
- A student can complete at most 2 accepted-offer decisions.
- A third acceptance attempt is automatically rejected.
- After one accepted offer, a second offer can only be accepted when its package is at least 2x the previous accepted offer package.
- When the qualifying second offer is accepted, the previous accepted offer is marked REVOKED and its application is marked REJECTED.
- The new offer becomes ACCEPTED and the student's placement status remains PLACED.
- Declining an offer does not consume an acceptance slot and does not affect an existing accepted offer.
- Acceptance/decline/revocation rules run inside a Prisma transaction.
- Admin/placement-officer offer editing cannot manually set ACCEPTED, DECLINED, or REVOKED; the student response workflow controls those statuses.

## Database
Added `Student.acceptedOfferCount` with default 0. Apply the included migration before running the app:

```bash
npx prisma migrate dev
npx prisma generate
```

For an existing database, do not skip the migration because the new counter is used by the acceptance transaction.
