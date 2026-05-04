# Security Specification - BoyCash

## 1. Data Invariants
- A user document must exist at `/users/{uid}` where `uid` matches the authentication ID.
- User balance and coins cannot be negative.
- A user can only have one referral code.
- Transactions are immutable after creation.
- Withdrawals must be created with a 'pending' status.
- Only the user can access their own data, and an admin can access all data.

## 2. The "Dirty Dozen" Payloads (Target: /users/{uid})

1. **Identity Spoofing (Create)**: Create a user document with a different `uid` than the auth ID.
2. **Field Injection (Create)**: Create a user with an `isAdmin: true` field.
3. **Immutability Breach (Update)**: Update the `createdAt` or `referralCode` field.
4. **Identity Takeover (Update)**: Update the `uid` or `email` of a user document.
5. **State Shortcut (Update)**: Update someone else's balance by spoofing the `uid`.
6. **Value Poisoning (AddCoins)**: Update `coins` with a 1MB string instead of a number.
7. **Phantom Points (AddCoins)**: Update `coins` without updating `updatedAt`.
8. **Negative Payout (Withdrawal)**: Create a withdrawal with a negative amount.
9. **Status Hijack (Withdrawal)**: Create a withdrawal with status 'completed'.
10. **Referred By Loop (Update)**: Set `referredBy` to the user's own `uid`.
11. **Shadow Field (Update)**: Update `coins` and add an unapproved `verified: true` field.
12. **Admin Privilege Escalation**: Try to update a document as admin using a spoofed email (not verified).

## 3. Test Runner Concept (firestore.rules.test.ts)
The tests will verify that:
- `create` fails if `uid` doesn't match `request.auth.uid`.
- `create` fails if required fields are missing.
- `update` fails if it attempts to change immutable fields (`uid`, `email`, `createdAt`, `referralCode`).
- `update` fails if the "Action" doesn't strictly match whitelisted keys.
- `withdrawals/` can only be created with status 'pending' and by a signed-in user.
- Admin access works but requires `email_verified == true`.
