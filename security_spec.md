# Security Specification - AURA Banking & Kredit

## 1. Data Invariants
- Each user profile belongs to a registered client or admin.
- Only the authenticated user (`request.auth.uid == userId`) or an admin can read and update their personal banking records.
- Transactions can only be created by the owner or system administrator.
- Unauthenticated users have no access to banking records.

## 2. Dirty Dozen Payloads (Rejection Targets)
1. Write to user profile without authentication.
2. User A updating User B's account balance.
3. User setting `isAdmin: true` on self.
4. Injecting oversized string (>128 chars) as user ID.
5. Deleting another user's transaction records.
6. Reading other users' KYC ID document photo.
7. Injecting negative balances without valid transaction.
8. Modifying locked/closed credit contract status arbitrarily.
9. Injecting script tags or HTML into username or purpose.
10. Unverified email write attempt if email verification is mandated.
11. Bypassing owner ID validation on transaction subcollection.
12. Blanket list queries across entire users collection by standard users.

## 3. Security Hardening Summary
- `isValidId()` guard on path variables.
- Owner-only checks: `request.auth.uid == userId`.
- Admin override: `request.auth.token.email == 'okcreditro9@gmail.com'`.
- Default-deny all unmatched paths.
