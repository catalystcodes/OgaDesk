# Authentication flow review

Reviewed against the ten-stage OgaDesk journey on 21 October 2026.

## Main blocker fixed

The existing iOS simulator session was pending Clerk's `choose-organization` task. The previous guards treated that session as signed out and sent it to hosted verification, preventing the user from reaching the app's own organisation setup.

The root navigator now distinguishes identity verification from organisation selection. A session waiting only for organisation selection can enter profile/setup; it cannot enter the account workspace. Other tasks, including MFA and password reset, continue through Clerk verification. This follows [Clerk's pending-session model](https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks).

## Other corrections

- Splash waits for auth, user, and session hydration. It routes returning users to their account or unfinished setup and remembers when signed-out users have completed/skipped the introduction.
- OAuth completion distinguishes pending tasks from a fully active session, so account navigation cannot overwrite verification navigation.
- Leaving hosted verification signs out a pending session before returning to sign-in, avoiding a redirect loop.
- Setup checkpoints persist the selected role, organisation, creation intent, and next step. Required fields and organisation selections are checked before later setup screens render.
- Account entry verifies live Clerk membership, restores the saved active organisation, and displays the current organisation name and assigned role. Removed access returns to the picker; request/activation failures offer retry. Checks repeat on focus and foreground entry.
- Assigned roles are read-only during review. Preferences never grant membership or permissions.
- Direct success links do not imply completion. A reloaded success screen returns through account verification; the normal confirmation path shows success after membership verification and saving completion.
- Duplicate navigation is blocked while setup requests/sign-out are in progress.
- Native preview navigation uses `step` because `screen` is a reserved navigator parameter. Older preview links remain readable.

## Journey coverage

| Stage | Current behavior and remaining work |
| --- | --- |
| Splash | Session-aware entry; introduction remembered; existing pending session restored after cold launch. |
| Welcome / Sign in | Google/Apple redirects, request locking, and cancellation recovery verified. |
| Authentication verification | Clerk verifies identity and session tasks. A separate application backend/account database is still pending. |
| Create Profile | Required-field validation and saved checkpoint connected to Clerk. |
| Select Role | Saved preference; access comes from actual membership. |
| Select Organisation | Live memberships/invitations; new organisation creation is confirmed at the final review. |
| Invitation / Join Organisation | Pending invitation review/acceptance implemented. Arbitrary join requests and administrator approval require backend work. |
| Review & Confirm | Edits, assigned-role inspection, actual membership verification, organisation activation, and saved completion connected. |
| Success / Pending Approval | Verified-success path implemented. Pending-approval state is not implemented. |
| Dashboard | Currently opens the account page. The business dashboard and server-enforced business permissions remain to be built. |

## Verification

- All 28 auth/setup tests passed, including pending-task access rules, safe setup resumption, route prerequisites, paginated membership checks, removed memberships, workspace activation failures, and obsolete requests.
- `npx tsc --noEmit`, `npx expo lint`, and `git diff --check` passed without code/lint errors or lint warnings.
- Browser first-launch, four onboarding slides, remembered introduction, all seven signed-out account/setup route guards, and callback recovery passed.
- Google reached its provider login; duplicate requests were disabled and cancellation recovered. Apple reached its provider login. No provider credentials were entered by the review.
- Browser setup interactions passed for validation, pickers, back navigation, selections, locked assigned roles, review edits, success, and cancelling additional organisation creation. All six setup screens fit at 393 × 852 and 320 × 568, with actions reachable by scrolling.
- The actual iOS pending organisation session now enters Create Profile. Attempting to open the account route returns to setup. After terminating and relaunching Expo Go, the same session resumed Create Profile.
- Updated iOS screenshots of the six setup screens are saved in [`design/review/flow`](../design/review/flow/). Screenshots use isolated preview fixtures, not account data.

The review did not create users, create organisations, accept invitations, or change the existing user's profile. Full live confirmation and invitation acceptance still need an account test. Android/device release testing, the application backend, approval workflow, and business dashboard are separate remaining milestones.

## Subsequent dashboard milestone

The role dashboards and protected read API were added after this flow audit. See [dashboard implementation](dashboards.md) for current coverage, database configuration, and validation.
