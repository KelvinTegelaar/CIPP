# Folder Permission Identity Resolution (Calendar + Contacts)

**Date:** 2026-08-04  
**Status:** Approved for implementation

## Problem

Calendar (and contact) permission lists show only Exchange `User` display names. When two accounts share a display name (e.g. one licensed, one unlicensed), Remove passes that display name to `Remove-MailboxFolderPermission`. Exchange may resolve to the wrong principal and return:

`There is no existing permission entry found for user:'Alexandria McConnel'.`

The UI also cannot show which account owns the ACE, so admins cannot distinguish duplicates or re-grant the correct user Editor access.

## Goals

1. List calendar/contact permissions with a stable email (SMTP/UPN) and object ID when resolvable.
2. Prefer email/object ID for Add/Remove API calls from the Exchange user page.
3. On `UserNotFoundInPermissionEntryException` / `InvalidExternalUserIdException`, retry removals/sets against all resolvable identities for that display name.
4. Apply the same pattern to contact folder permissions.

## Non-goals

- MFCMAPI/orphaned SID cleanup for permanently deleted principals.
- Changing the offboarding wizard calendar-permission removal flow (uses cache/display names separately).
- Full redesign of mailbox Full Access / Send As permission UI (already uses different identifiers).

## Design

### Backend — list enrichment

`Invoke-ListCalendarPermissions` and `Invoke-ListContactPermissions`:

- Keep `User` as returned by Exchange (display name / system name) for compatibility.
- Add optional fields per entry:
  - `UserEmail` — primary SMTP or UPN when uniquely resolvable or when `User` already contains `@`
  - `UserId` — Entra / ExternalDirectoryObjectId when resolvable
  - `UserAmbiguous` — `$true` when multiple recipients match the display name and we could not bind a single SMTP
- Skip enrichment for `Default`, `Anonymous`, `NT AUTHORITY\SELF`.
- Resolve via Graph `users` and `groups` `$filter=displayName eq '...'` (and treat single `@`-containing `User` as already email).
- Prefer the default Calendar/Contacts folder (`FolderType -eq 'Calendar'` / `'Contacts'`) instead of `Select-Object -First 1` alone.

### Backend — set/remove hardening

Shared helper (used by `Set-CIPPCalendarPermission` and `Set-CIPPContactPermission`):

1. Build candidate identity list: provided value, then Graph/EXO-resolved SMTP, UPN, object ID for that display name (all matches when ambiguous).
2. Attempt Remove/Set/Add with each candidate until one succeeds.
3. Catch both `UserNotFoundInPermissionEntryException` and `InvalidExternalUserIdException`.
4. Surface a clear error if all candidates fail, mentioning duplicate display names / unlicensed recipients when relevant.

### Frontend — Exchange user page

Calendar and contact permission tables:

- Show an **Email** column (`UserEmail`, fallback empty / "Ambiguous").
- Remove actions send `UserEmail` or `UserId` when present, else fall back to `_raw.User`.
- Off-canvas details include email and object ID when known.

## Verification

1. Calendar with two same-display-name users: list shows distinct emails.
2. Remove the licensed account’s ACE by Email succeeds.
3. Remove still works for unique display-name-only entries and for Default/Anonymous exclusion.
4. Contact permissions behave the same.
5. Ambiguous unresolved rows show Ambiguous flag; Remove retries candidates rather than failing on first wrong bind.
