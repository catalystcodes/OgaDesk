OgaDesk — Implementation Plan

Status: Proposed / not implemented

Prepared: 19 October 2026

Working name: OgaDesk — Your Business. In Control.

Purpose: A mobile-first business operations platform that begins with inventory, stock movement, stock taking, expense recording, staff permissions and operational reporting for small and medium-sized Nigerian warehouses and distributors.

Planning note: This document is adapted in structure, not product scope, from the supplied Codexgram plan. No OgaDesk repository has been inspected, and no development work is represented as complete. The name, requirements, stack and launch criteria should be validated before final commitment.

Product and proposed scope
1.1 Product goal

Help the owner and staff of a small business know what stock they have, what moved, who handled it, what operating expenses were recorded and what requires attention. The mobile app must be usable during a normal working day, not just attractive as a demo.

Initial customer hypothesis: one-location wholesalers or distributors handling their own stock, with 2–20 staff. Interview warehouse operators that store third-party goods separately: their ownership, billing and custody workflows can differ materially.

Target platforms: Android first for pilot acceptance, iOS supported with the same core workflows. Mobile-first; a complete web dashboard is not required for the pilot.

Business model: free pilot and useful free core; no subscription paywall, marketplace fee or payment gateway in the first release. Optional advanced services and paid tiers remain hypotheses, not commitments.

1.2 Users and permissions

Owner/Admin: organisation configuration, all authorised stock operations, expense visibility, staff invitations, approvals, audit and reporting.
Manager: inventory operations, counting and discrepancy review, relevant expense records, operational reports; permissions controlled by the owner.
Staff: assigned stock recording/counting operations; cannot grant permissions, approve their own restricted adjustments or view confidential financial information unless permitted.
An account may eventually belong to multiple organisations; for the MVP, design membership records for this but make the primary experience a single selected organisation and location.

1.3 Included in the first pilot

Email/password authentication, email verification, password reset, reliable sign-in persistence and sign-out.
Create an organisation, configure its single stock location, and invite staff with role-based access.
Product catalogue: name, SKU, optional barcode, unit of measure, category, low-stock threshold and searchable list. Allow manual entry and a modest CSV import only if pilot users need it.
Auditable opening-stock entries, goods received, goods dispatched and adjustments. Each operation has an actor, reference, timestamp and reason when relevant.
Stock-on-hand view derived from a stock-movement ledger, with transactional balance updates, not arbitrary quantity editing.
Barcode scanning with manual search/entry fallback.
Physical stock-count sessions: save progress, compare expected and counted amounts, review variances, and apply approved adjustments without erasing concurrent stock movements.
Simple expense recording: category, amount, date, description, optional receipt attachment, employee and history. Not full accounting.
Role-relevant dashboard: low-stock alerts, counts needing attention, recent movements, recorded expenses and recent staff activity.
Basic date-filtered reports and CSV export for inventory, stock movements, discrepancies and expenses.
Limited offline experience: locally cached product list and saved stock-count drafts in SQLite; visible pending/sync/error states. See section 5 for restrictions.
Clear empty, loading, denied, failed, cancelled and success states; accessible forms and manual alternatives to scanning.
1.4 Explicitly excluded from pilot

Multi-warehouse management, retail POS, invoicing, bookkeeping/general ledger, payroll, supplier/retailer marketplace, logistics marketplace, card payments, subscription billing, AI assistant, advanced forecasting, public API, push notifications, complex product conversions, and unattended offline receipt/dispatch posting. Do not create fake functional screens for excluded capabilities.

1.5 Decisions still open

Exact first segment: own-stock distributor vs third-party storage warehouse.
Required units: pieces, packs, cartons, kilograms; whether conversion is essential at launch.
Whether the first pilot requires CSV import and receipt attachments.
Whether certain stock adjustments always require manager approval.
Expected maximum catalogue size and number of staff per organisation.
Whether an admin web view is essential for importing large existing catalogues.
Do not resolve these by assumption in code. Validate them in customer interviews and document decisions.

2. Recommended implementation stack and constraints

2.1 Recommended stack — proposal, not locked

LayerProposed choiceReasonMobileReact Native + Expo + TypeScript + Expo RouterOne shared Android/iOS codebase; builds on existing development experienceUIReusable RN components, central design tokens; NativeWind only after compatibility verificationConsistency without tying business logic to stylingLocal dataexpo-sqlitePersistent local catalogue cache and offline count draftsScanningexpo-camera barcode scanning + manual inputPractical on-device warehouse workflowBusiness APINode.js / NestJS + TypeScript, modular monolithExplicit domain services, validation, permissions and transactionsServer databasePostgreSQLTransactional stock mutations, constraints and reportingAuthenticationManaged auth provider such as Supabase Auth, verified by the APIAvoid custom password/session implementationFile storagePrivate cloud object storageOptional receipts and product photosDeploymentManaged PostgreSQL + hosted API with separate staging/productionSimpler operation for early pilotsTestingAPI integration tests, database concurrency tests, mobile unit tests, Android/iOS acceptanceFocus on real stock correctness

Alternative to assess: Supabase Auth + PostgreSQL with carefully designed transactional database functions may reduce the need for a separate API at very small scale. If choosing that approach, demonstrate equivalent tenant isolation, role enforcement, idempotency and transaction safety. Do not add NestJS solely to make the stack look bigger.

Check current Expo, native scanner, SQLite, authentication and deployment compatibility before pinning versions. Do not import Codexgram's old Expo/Clerk/Convex versions automatically.

2.2 Engineering principles

Start with a modular monolith, not microservices.
Backend is the authoritative source for accepted stock balances and financial records.
Each inventory change is an immutable, attributable event; corrections create compensating entries rather than deleting history.
Validate tenant membership and action permission server-side on every protected request.
Make stock-changing requests idempotent using a unique operation identifier supplied by the client.
Use transactional row locks or other demonstrated safe concurrency controls for affected balances; reject insufficient stock unless a defined policy permits it.
Store quantities in exact numeric types and money in a precise decimal/minor-unit representation; never use floating-point arithmetic for monetary totals.
Keep secure credentials out of the app bundle, logs and repository.
Protect local business data and purge or re-scope it safely on logout or organisation switch. 3. Core user journeys and screens

3.1 Authentication and business setup

Welcome, register, verify email or sign in.
Create organisation, provide business name/type, currency (NGN default) and first stock location.
Owner sees an empty-state checklist: add first product, set opening stock, invite staff.
Owner invites Manager/Staff; invited users accept and see only authorised functions.
Returning users resume their authenticated session, with expired-session and revoked-membership handling.
3.2 Navigation

Suggested bottom tabs: Home, Stock, Scan, Activity, More. Role-based actions on each screen; do not rely on hiding buttons as the only form of authorisation.

3.3 Inventory catalogue

Add/search/filter a product; optional scan or manually enter SKU/barcode.
Product detail shows current confirmed stock, unit, low-stock threshold and movement history.
Product creation does not silently create stock; opening quantities are added through an auditable opening-balance transaction.
SKU is unique within an organisation; barcode collision behaviour is deliberate and explained.
3.4 Receive and dispatch

Start Receive or Dispatch; scan/search one or more products.
Enter quantities, optional partner/reference and notes.
Review a summary before confirming.
Submit with a unique client operation ID.
Server verifies permissions, product ownership and stock rules, commits stock ledger and balance atomically, and returns receipt/reference.
Client shows the confirmed outcome or an explicit pending/retry state; a double-tap/retry cannot create duplicate movements.
3.5 Physical stock count

Manager begins a count session with a stable baseline/snapshot and scope.
Staff scan/search products, enter counted quantities and save progress.
Count drafts remain locally available when offline.
When connected, submitted counts are reconciled against the baseline plus any intervening movements; do not replace today's balance with an old count.
Manager reviews discrepancies, reasons and adjustments; approval creates audit entries.
Show completion summary and history.
3.6 Expenses and reporting

Owner or authorised manager adds expense with exact amount, category, date, notes and optional receipt.
Expense history displays actor and changes; corrections are traceable.
Reports include low-stock products, inventory on hand, stock movement history, count variances and expenses by category/date.
Export CSV with correct tenant/date filtering; monetary reports are not labelled profit-and-loss accounts.
3.7 Main screen inventory

Splash/Welcome
Sign In/Register/Recovery
Business Setup
Invite/Accept Employee
Owner Dashboard
Staff Dashboard
Inventory List
Product Create/Edit
Product Detail
Scan Barcode / Manual Search
Receive Stock
Dispatch Stock
Stock Count Sessions
Counting Workspace
Discrepancy Review
Movement History
Expense List
Add/Edit Expense
Reports and Export
Team and Roles
Activity and Alerts
Offline Queue / Sync Details
Profile and Settings
Use the approved OgaDesk visual concept as a starting point, not a pixel-perfect specification. Verify business semantics before polishing screens.

4. Data model and API responsibilities

4.1 Minimum entities

EntityMinimum fields / dutiesOrganisationID, name, business type, currency, created byLocationID, organisation ID, name; one active location for pilotUser and MembershipProvider identity, organisation, role, status, invitation lifecycleProductOrganisation ID, SKU, optional barcode, name, unit, category, threshold, active statusStock MovementOrganisation/location/product, type, signed quantity, actor, reference, reason, operation ID, timestampStock BalanceOrganisation/location/product, confirmed quantity, version; updated only transactionallyStock Count Session/LineSnapshot reference, counted quantity, actor, state, discrepancy and approval outcomeExpenseOrganisation, amount/currency, category, date, description, actor, optional attachmentAudit RecordActor, organisation, action, affected entity, timestamp, before/after or referenceClient OperationGlobally unique request ID, organisation, request fingerprint, status, outcome for safe retriesOffline DraftOn-device pending count entries and synchronisation metadata

The stock ledger is authoritative; Stock Balance is an efficiently queried projection maintained in the same transaction. Provide an integrity/reconciliation job to detect mismatches.

4.2 Suggested API capabilities

Auth/session validation and organisation memberships.
POST /organisations, POST /invitations, GET /memberships.
GET /products, POST /products, PATCH /products/:id.
POST /stock/receipts, POST /stock/dispatches, GET /stock/movements.
POST /stock-counts, PATCH /stock-counts/:id/lines, POST /stock-counts/:id/submit, POST /stock-counts/:id/approve.
GET /expenses, POST /expenses, auditable corrections.
GET /dashboard, GET /reports/_, GET /exports/_.
A future explicit sync endpoint if broader offline write support is approved.
Document payload schemas, error codes, pagination, time zones, idempotency rules and permission matrix. Prefer OpenAPI and a single source of truth for TypeScript types.

4.3 Important invariants

No user can read or mutate another organisation's records.
A disabled membership loses access promptly.
Staff cannot approve restricted operations they initiated where separation of duties is required.
A retry of an accepted stock transaction returns the original result instead of applying it again.
Concurrent dispatches cannot take stock below zero under the normal policy.
A count correction is reviewable and does not erase concurrent receipts or dispatches.
A product can be archived, not physically deleted, while referenced by historical movements.
Every successful stock change is attributable and queryable. 5. State, offline behaviour and failure handling

Proposed pilot offline boundary: users can view a recently cached product list and save/edit count-session drafts while offline. The interface marks these drafts Local — not submitted. Actual stock receipt/dispatch/adjustment submissions require a connection in the pilot.

On reconnection:

Upload count drafts using durable operation IDs.
Do not mark synced until server acknowledgement.
Show conflicts or permission changes instead of silently overwriting records.
Keep retryable drafts until confirmed or explicitly discarded.
If a staff account loses access, prohibit syncing unapproved drafts and provide a safe recovery path for administrators.
Before enabling offline receiving/dispatching in a later version, design and test a proper command queue, ordering rules, conflict resolution, negative-stock policy and cross-device scenarios. Local submission is not global stock confirmation.

General state handling:

Handle scanner denial, unknown barcode, expired login, access denied, duplicate SKU, low stock, invalid quantity, partial data loads, failed receipt upload, timeout and retry.
Show recent confirmed records during network loss without representing them as current live data.
Show a visible last-synced timestamp.
Persist count drafts through application restart; consider local encryption and clear-data handling.
Avoid storing tokens, personally identifiable information or confidential expense notes in logs. 6. Step-by-step implementation checklist

Step 0 — Validate the problem and choose first segment

Interview 15–20 operators across own-stock distributors and warehouse operators.
Observe at least three real receiving/count/dispatch workflows.
Identify current tools, recurring errors, adoption barriers and device/network constraints.
Choose first customer segment; document MVP feature priorities and measurable problem.
Complete when: A signed-off first-persona description and verified workflow map exist. If the findings contradict the concept, revise scope before coding.

Step 1 — Repository and design foundation

Inspect existing repo and preserve uncommitted modifications; if none exists, create a clean monorepo or clearly separated apps.
Verify supported Expo + camera + SQLite + navigation + styling versions.
Establish mobile, api, shared and migration/test structure as appropriate.
Implement OgaDesk design tokens, navigation shell and empty/error/loading states.
Verify a basic Android build and iPhone build.
Complete when: Both applications launch, navigation works and CI runs lint/type checks.

Step 2 — Auth, organisations and role security

Configure managed auth and secure token/session handling.
Add organisation creation, one location, invitations and membership states.
Enforce role checks server-side; publish explicit permission matrix.
Test session expiry, membership revocation and cross-tenant access denial.
Complete when: Two organisations cannot access each other's data even with modified API requests.

Step 3 — Catalogue and initial balances

Product CRUD, unique per-organisation SKU and barcode rules.
Build search, filtering, add/edit/detail screens, scanning/manual fallback.
Implement auditable opening-balance entry.
Seed development-only sample items and test quantities.
Complete when: A pilot business can create and find products, then establish an audited starting stock position.

Step 4 — Receiving, dispatching and ledger

Design stock movement records, balance projection and transaction boundaries.
Implement receipt and dispatch workflows with server-side validation.
Add idempotency IDs, insufficiency checks and concurrency controls.
Return stable operation receipts/references and useful errors.
Build movement history and audit views.
Complete when: Repeated or simultaneous requests cannot duplicate or oversell stock.

Step 5 — Physical counting and offline drafts

Create count sessions and count-line entry screens.
Implement baseline snapshots and reconciliation with intervening movements.
Save drafts locally using SQLite; test interrupted app sessions.
Add submission, discrepancy review and authorised adjustment flow.
Display pending, synced, conflicted and failed states.
Complete when: A physical count can be completed across temporary connectivity loss without corrupting confirmed inventory.

Step 6 — Expenses, dashboard and reports

Expense categories, create/list/details, role restrictions and traceability.
Dashboard summaries and low-stock alerts, filtered by organisation.
Basic inventory, movement, variance and expense reports.
CSV export and realistic empty/populated states.
Complete when: Owner can see stock and recorded costs without exposing restricted data to staff.

Step 7 — Security, quality and user experience

Add database indexes, migrations, backups and restore rehearsal.
Add operational error monitoring and scrub sensitive data from logs.
Validate large product lists, scanner performance and accessibility.
Review handling of receipts and local cached records.
Run complete Android and iOS acceptance walkthroughs.
Complete when: High-severity security, data-integrity and crash issues are resolved.

Step 8 — Pilot and documentation

Prepare five pilot businesses, or adjust after discovery.
Document onboarding, role assignments, exports, offline limits and support contact.
Deploy staging and isolated production environments.
Record usage, stock-operation success, weekly retention, support load and onboarding time.
Collect structured feedback after 2–4 weeks; revisit MVP decisions.
Complete when: Pilot users repeatedly perform live workflows and the team can safely support and recover the system.

7. Required acceptance and regression tests

Security

Unauthenticated requests fail appropriately.
Forged organisation IDs and guessed record IDs cannot cross tenant boundaries.
Suspended staff cannot perform stock operations.
A staff member cannot elevate their own role or approve forbidden adjustments.
Attachment URLs and export files do not expose another business's data.
Inventory invariants

Opening balance 20, receipt 10, dispatch 7 => confirmed stock 23.
Dispatch 24 from stock 23 is rejected under the standard policy.
Concurrent dispatch 15 + 15 from stock 23 allows at most one successful dispatch.
Retrying the same receipt with the same operation ID changes stock only once.
A given operation ID cannot be reused with a different request payload.
Stock count based on a snapshot reconciles correctly after an intervening receipt.
Historical movements remain visible after a product is archived.
Expenses and exports

Only permitted roles see expense values.
A missing/invalid category or amount is rejected with useful feedback.
CSV export respects organisation, date range and pagination boundaries.
Currency and numeric precision remain correct in reports.
Offline and device acceptance

Counting drafts survive app termination and device restart where supported.
No draft is labelled synced before server acknowledgement.
A failed sync can be retried without duplicating a count submission.
A count begun offline does not silently overwrite new confirmed stock.
Camera permissions denied => manual search works.
Tested on an affordable Android device and at least one iPhone, including intermittent connectivity. 8. Launch readiness, assumptions and risks

Pilot readiness checklist

Owner creates organisation, adds 20 products and completes a full stock cycle.
Two real employees carry out allowed and denied operations correctly.
Stock counts reconcile without losing or duplicating movement history.
Android workflows are fast enough for daily use on representative hardware.
Offline limits are transparent and safe.
Tested backup/restore, privacy notice, support process and data export exist.
All material decisions and known limitations are documented.
Primary risks

Wrong customer segment: a custody warehouse needs different features than a wholesaler owning goods.
Stock correctness: incorrect balances rapidly destroy trust.
Offline synchronisation complexity: pretending local updates are confirmed is unsafe.
Onboarding cost: businesses may have messy starting records and limited time to migrate.
Adoption: staff may continue using notebooks if scanning/counting is slower.
Security and privacy: organisation boundaries, employee records, receipts and audit data need controls.
Free-tier economics: support and storage costs still accrue even without monetisation.
Product-name clearance: OgaDesk is selected as the working brand; trademark, business name, domain and app-store availability must still be checked formally.
Success signals for pilot (targets to validate, not industry benchmarks)

At least 5 businesses complete onboarding and record real operations.
At least 3 businesses use the app during most of their working weeks in the pilot.
Core stock tasks consistently complete without unexplained balance discrepancies.
Owners can identify specific time saved or a reduction in recordkeeping friction.
Support cost and onboarding time are low enough to make expansion plausible.
Next product questions

Does the product lead with stock taking, or with receiving and dispatching?
Is Android-only public launch acceptable after cross-platform engineering validation?
Do businesses need basic purchasing and sales records earlier than expected?
Is a web console needed for bulk data entry sooner than planned?
Can the company eventually charge for multi-site reporting, integrations or marketplace services without weakening the free core?
Explicitly not yet decided: final tech stack, detailed UI acceptance, data-import breadth, first target segment, exact feature cut, future subscription pricing, marketplace launch and public release date.

Codex / senior architect handoff instruction

Treat this document as a proposed implementation plan, not permission to implement every section immediately. First inspect the repository and preserve user changes. Identify unresolved product decisions and any incompatibilities in the proposed stack. Produce a brief architecture decision record (ADR), permission matrix, core stock invariants, database model and milestone breakdown. Implement only the explicitly approved milestone, with tests and acceptance evidence. Do not implement marketplace, payments, advanced offline stock posting, AI or multi-warehouse features without a new scope decision.

Reference documentation used for technical feasibility

Expo SQLite: https://docs.expo.dev/versions/latest/sdk/sqlite/
Expo Camera: https://docs.expo.dev/versions/latest/sdk/camera/
PostgreSQL row-level locking: https://www.postgresql.org/docs/current/explicit-locking.html
Supabase Expo quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native
