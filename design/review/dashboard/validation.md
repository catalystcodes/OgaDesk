# Dashboard validation

## Current backend: Convex

The dashboard data layer now uses the existing Convex development deployment, with Clerk issuer/audience verification and fresh server-side session/membership checks. PostgreSQL packages, SQL migration, and the Expo dashboard API route were removed. The mobile app sends its Clerk token directly to the Convex action in the authorization header. No business/demo data was inserted.

50 tests pass: 31 auth/setup/permission tests and 19 Convex tests. Convex tests cover all roles, nested Clerk v2 organisation claims, wrong-user/tenant denial, removed memberships, inactive sessions, stale role claims, finance isolation, empty data, stale days, bounded reads with complete counters, and invalid progress. The development push passes backend typechecking. The production iOS export succeeds and contains no server-key, server-issuer, database-URL, or server-table-name markers.

Live integration verified on 2026-10-22: Clerk accepts the replacement development secret and confirms it belongs to the existing OgaDesk instance. The secret was synced to the verified Convex development deployment without displaying it. The simulator restores its active Clerk session and organisation, then loads the Owner dashboard through the deployed Convex action. The final route state is `ready`, with no loading or error state. The backend returns the expected empty workspace because no business records have been inserted. TypeScript and Expo lint pass after this verification. The screenshot remains in the temporary review directory because it contains actual account/workspace information.

The sections below preserve the earlier visual review and loading-loop investigation; their PostgreSQL checks describe the implementation before the Convex migration.

The user approved Owner → `opwner-ref.png`, Manager → `staff-ref.png`, Staff → `manager-ref.png`.

## Visual iterations

1. First iOS captures established the three role layouts, shared components, Inter typography, colour palette, and bottom navigation.
2. Corrected the count-session subtitle and Staff progress wrapping. Preview captures were clean after a cold launch; a later live-session check exposed a separate dashboard loading loop, documented below.
3. Tightened card/heading/header spacing, corrected Home icon rendering, and checked all three role compositions again.
4. Small-screen interaction tests found the bottom tab row could extend outside a 320 × 568 viewport. The minimum navigation height now accounts for 44-point touch targets and padding.
5. Final captures use the completed spacing/navigation changes and rounded stock labels consistent with the reference. Native dashboard content scrolls on the shorter real-device viewport.
6. Repeated native detail-sheet navigation exposed a stale dimming backdrop after dismissal. Inactive modals now unmount; native interaction checks and the resting-screen capture confirm the dashboard returns undimmed.

`*-final.png` are current iPhone 14 Pro / iOS 16.4 / Expo Go captures. `*-pass1.png` through `*-pass3.png` preserve earlier iterations. `*-web.png` capture the web layout at 393 × 950.

## Checks passed

- 40 auth, setup, permission, and database tests.
- TypeScript, Expo lint, and whitespace checks.
- PostgreSQL migration/repository tests in isolated PGlite: tenant and actor filtering, financial exclusion, SQL parameterization, invalid totals, stale-day summaries, and progress totals above the display limit.
- Owner detail-sheet navigation for expenses, stock, activity, and workspace.
- Manager approvals/count detail navigation and absence of Owner financial data.
- Staff task progress, assigned count details, task notifications, and absence of privileged actions.
- All three layouts at 393 × 852 and 320 × 568: no horizontal overflow, every bottom tab visible/reachable, and recent activity reachable by scrolling.
- Native Stock, Activity, and More sheets open/close; Staff assigned count inspection works.
- Anonymous requests to `/api/dashboard` return HTTP 401 and `private, no-store` through both web HTTP and native relative fetch.
- Signed-out browser access to `/dashboard` returns to authentication.
- Production API export and iOS Hermes export build successfully. The generated iOS bundle contains no database query, database URL variable, or Clerk secret-key variable markers.
- No browser runtime exceptions in the interaction suite.

No live database was configured or migrated, no Clerk users/organisations were created, and no inventory/expense/approval records were written. Server-side verification with a real Clerk session and live PostgreSQL still requires server credentials and a database connection. Transaction entry forms and mutations are outside this dashboard milestone.

The phone mockups and iPhone 14 Pro have different aspect ratios and OS chrome. Organisation artwork and some icon details differ. These are faithful native layouts with recorded comparison passes, not a claim of pixel identity.

## Live-session loading regression

The live dashboard originally depended on Clerk Expo's `getToken` callback in its focus effect. That SDK returns a fresh wrapper on every render, so updating loading state repeatedly restarted the effect and produced “Maximum update depth exceeded.” The route now keeps the latest token getter in a ref updated by an effect, and keys loading to the session, user, and organisation. Session changes also clear prior data.

After the fix, a cold simulator launch leaves the loading screen without a React update-depth warning. With the backend still unconfigured, the live request reaches the expected service-unavailable state. A native retry check confirms one HTTP request and a stable resting state rather than repeated requests. All 40 existing tests, TypeScript, and Expo lint pass.
