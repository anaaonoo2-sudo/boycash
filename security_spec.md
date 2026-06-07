# Security Specification for BoyCash

## 1. Data Invariants
- A user cannot have negative coins or balance.
- Immutable fields: `uid`, `email`, `referralCode`, `createdAt` cannot be changed after creation.
- A user can only update their own profile (except for admin overrides).
- Transactions and Withdrawal requests must be linked to a valid user ID.
- Coin updates must follow specific allowed keys (Identity integrity).

## 2. The "Dirty Dozen" Payloads (Attack Vectors)
1. **The Ghost Field**: Trying to add `isAdmin: true` to a user profile. (Target: `/users/{uid}`)
2. **The Fortune Update**: Directly setting `coins: 9999999`. (Target: `/users/{uid}`)
3. **The Identity Theft**: Creating a withdrawal with someone else's `userId`. (Target: `/withdrawals/{id}`)
4. **The Time Traveler**: Setting `createdAt` to a date in the past to look like an old user.
5. **The Email Spoof**: Setting `email_verified: true` in the token if our rules relied on it without checking. 
6. **The Shadow Referral**: Updating `referredBy` multiple times to get rewards repeatedly.
7. **The Withdrawal Spammer**: Creating 1000 withdrawal requests in a second (Rate limiting - handled by Firebase, but we need structure).
8. **The PII Leach**: Reading another user's email via a list query.
9. **The Negative Payout**: Requesting a withdrawal of `-100` coins to try and gain balance.
10. **The ID Poisoning**: Using a 1MB string as a document ID to bloat the database.
11. **The Status Jump**: Manually updating a withdrawal status from `pending` to `approved`.
12. **The Immortal Reset**: Changing the `createdAt` date to reset progress or bypass bans.

## 3. Red Team Evaluation (Pre-Rules)
| Collection | Identity Spoofing | State Shortcutting | ID Poisoning |
| :-- | :-- | :-- | :-- |
| /users | Restricted to UID | Strict Keys | Partially blocked by size check |
| /withdrawals | Restricted to Auth UID | Status locked to 'pending' | Needs explicit size check |

## 4. Mitigation Strategy
- Implement `isValidUser` with strict key matching.
- Implement `isAdmin` using `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`.
- Use `affectedKeys().hasOnly()` for every update action.
- Ensure `email_verified == true` for critical write operations.
