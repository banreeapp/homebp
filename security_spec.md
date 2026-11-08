# Security Specification: TSH Home BP Monitor

## 1. Data Invariants
1. **User Identity Boundary**: A user can only read, write, update, and delete their own profile (`/users/{userId}`) and their own subcollections (`/users/{userId}/records/{recordId}` and `/users/{userId}/sessions/{sessionId}`).
2. **Owner Immutability**: The `userId` or `uid` on any record or session document must equal `request.auth.uid` and cannot be modified or re-assigned to another user.
3. **Valid Measurement Bounds**:
   - `avgSys`, `sys1`, `sys2` must be positive numbers within physiologic limits (e.g. 50 to 300 mmHg).
   - `avgDia`, `dia1`, `dia2` must be positive numbers within physiologic limits (e.g. 30 to 200 mmHg).
   - `avgPulse`, `pulse1`, `pulse2` must be positive numbers within physiologic limits (e.g. 30 to 250 bpm).
   - `dayIndex` must be an integer between 1 and 7.
   - `period` must strictly be either `'morning'` or `'evening'`.
4. **Subcollection Master Gate**: Sub-resources can only be created under the path `/users/{userId}/...` where `{userId}` strictly matches `request.auth.uid`.
5. **No Cross-User List Query Leaks**: Query listings must evaluate `resource.data.userId == request.auth.uid` or be restricted to the user's specific subcollection path.
6. **No Ghost Fields**: Create and update actions reject undeclared fields through strict schema checks.

## 2. The Dirty Dozen Payloads (Designed to Break Identity, Integrity, and State)

1. **Payload 1: Identity Impersonation (Spoof UID)**
   - Attempt: User A writes a record with `userId: "victim_user_b"` in their own subcollection or victim's subcollection.
   - Result: PERMISSION_DENIED.

2. **Payload 2: Subcollection Hijacking**
   - Attempt: User A attempts to write to `/users/victim_user_b/records/rec123`.
   - Result: PERMISSION_DENIED.

3. **Payload 3: Read Other Patient's Blood Pressure**
   - Attempt: User A queries `/users/victim_user_b/records`.
   - Result: PERMISSION_DENIED.

4. **Payload 4: Ghost Field Injection**
   - Attempt: Injects `{ isAdmin: true, bypassTarget: true }` into `UserProfile`.
   - Result: PERMISSION_DENIED.

5. **Payload 5: Invalid Day Index (> 7)**
   - Attempt: Writes `dayIndex: 99` in a 7-day protocol record.
   - Result: PERMISSION_DENIED.

6. **Payload 6: Invalid Period String**
   - Attempt: Writes `period: "midnight_snack"`.
   - Result: PERMISSION_DENIED (Must be "morning" or "evening").

7. **Payload 7: Negative / Out-of-Range Systolic Blood Pressure**
   - Attempt: Writes `avgSys: -120` or `avgSys: 9999`.
   - Result: PERMISSION_DENIED.

8. **Payload 8: Out-of-Range Diastolic Pressure**
   - Attempt: Writes `avgDia: 0` or `avgDia: 1500`.
   - Result: PERMISSION_DENIED.

9. **Payload 9: Path Traversal / Oversized Document ID**
   - Attempt: Document ID with 500 characters or path traversal characters `../../`.
   - Result: PERMISSION_DENIED (enforced via `isValidId()`).

10. **Payload 10: Modifying Immutable `userId` on Update**
    - Attempt: Updating an existing BP record to change `userId` to someone else.
    - Result: PERMISSION_DENIED.

11. **Payload 11: Unauthenticated Read/Write**
    - Attempt: Reading or writing when `request.auth == null`.
    - Result: PERMISSION_DENIED.

12. **Payload 12: Massive Payload / Denial-of-Wallet String Attack**
    - Attempt: Writing a `note` with 50,000 characters.
    - Result: PERMISSION_DENIED (enforced via `.size() <= 300`).

## 3. Test Runner
Included in `firestore.rules.test.ts` for automated verification.
