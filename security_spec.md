# Security Specification - Búnker Financiero

## 1. Data Invariants
- `userProfile` can only be updated by the owner (`request.auth.uid == userId`).
- `userProfile.updatedAt` must be updated with the server timestamp on any change.
- `commitment` can only be created, read, updated, or deleted if the user is authenticated and is the owner of the parent `user` document.
- `commitment.userId` must match `request.auth.uid` AND the parent `{userId}` path.
- Amounts cannot be negative strings (they must be numbers).
- Arrays are not used; all lists are subcollections (`commitments`).

## 2. The "Dirty Dozen" Payloads
1. User reads/writes another user's profile.
2. User creates a commitment under another user's subcollection.
3. User spoofs `userId` on creation of a commitment.
4. User tries to upload a commitment with an array instead of a number for `amount`.
5. User attempts to inject 200 fields into the `userProfile`.
6. User modifies `updatedAt` to a past or future date instead of `request.time`.
7. User leaves out required fields on creation of a commitment.
8. Unauthenticated user attempts to read any data.
9. User tries to update `peacePoint` without changing `updatedAt`.
10. Payload containing invalid `status` string for commitment.
11. User attempts to change `userId` of an existing commitment.
12. Payload with strings over 100 characters for `title`.

## 3. The Test Runner (firestore.rules.test.ts)
A test runner would emulate the above 12 payloads and ensure `PERMISSION_DENIED`.
