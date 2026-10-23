# Role dashboards

The dashboards share native components in `src/features/dashboard`. Clerk handles sign-in and organisation membership; Convex stores dashboard data and runs the backend in `convex/`. PostgreSQL, `DATABASE_URL`, and SQL migrations are no longer used.

## Reference mapping

| Role | Reference | Layout |
| --- | --- | --- |
| Owner | `design/opwner-ref.png` | Business metrics, expenses, quick actions, stock overview, activity |
| Manager | `design/staff-ref.png` | Active count, operational metrics, approvals, assigned tasks, activity |
| Staff | `design/manager-ref.png` | Personal progress, assigned tasks, quick actions, personal activity |

The user approved this mapping because the Manager and Staff reference filenames are reversed.

## Configuration

The mobile app needs these public values in its existing local environment:

```dotenv
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_existing_clerk_publishable_key
EXPO_PUBLIC_CONVEX_URL=https://your-development-deployment.convex.cloud
```

Enable the Convex integration on the **same Clerk application and environment**. It adds the `convex` audience to Clerk session tokens. The app refreshes the token before a dashboard read, so enabling the integration does not require replacing the Clerk application.

Configure these **Convex deployment** variables:

| Variable | Purpose |
| --- | --- |
| `CLERK_SECRET_KEY` | Server-only key for fresh session and membership checks |
| `CLERK_JWT_ISSUER_DOMAIN` | That Clerk application's Frontend API URL, including `https://` |
| `CLERK_AUTHORIZED_PARTIES` | Comma-separated allowed app/web origins, when the token has an `azp` claim |

Never prefix the secret with `EXPO_PUBLIC_`. Adding it to a local environment does not automatically configure the cloud backend. Each development/production deployment needs its own matching configuration. Local environment files are ignored by Git.

Run `yarn convex:dev` for development after confirming the selected deployment. Production deployment requires separately matching Clerk production configuration and explicit deployment approval.

## Access and navigation

After setup, `/account` verifies membership and restores the selected organisation before opening `/dashboard`. The account page is reachable using `/account?settings=1`. Organisation switching uses the setup picker.

The app calls the Convex `dashboard.load` action with a Clerk token in the authorization header. Tokens and secrets are never passed as function arguments. Convex validates the issuer, signature, audience, and token expiration. The action derives user/session/active organisation from the verified identity, rejects a different requested organisation, and fetches the current session and membership from Clerk. Roles from a stale token or client-editable metadata never grant permissions.

Only this action calls the internal `dashboardData.read` query. Clients cannot request a role or user ID from that query. Unknown roles, removed memberships, and inactive sessions fail closed. Data clears when the session/user/organisation changes and before foreground checks. Requests time out, cancel on leaving the route, and do not retain earlier privileged data on an error.

| Capability | Owner | Manager | Staff |
| --- | --- | --- | --- |
| Stock aggregates | Yes | Yes | No aggregate response |
| Expenses and expense activity | Yes | No | No |
| Approval entry point | Yes | Yes | No |
| Start a count | Yes | Yes | No |
| Continue assigned count | Yes | Yes | Yes |
| Task records | Own assignments | Own assignments | Own assignments |
| Activity | Organisation | Organisation excluding expenses | Own activity excluding expenses |

Clerk `org:admin`/`org:owner`, `org:manager`, and `org:member` map to Owner, Manager, and Staff. Assign Manager through Clerk. The UI preference is not a permission authority.

## Data model

`convex/schema.ts` defines daily stock/operational summaries, separate private expense summaries, assigned tasks, daily per-user task counters, and activity. Reads use bounded indexed queries scoped by organisation, assignee/actor, date, kind, and status. Manager and Staff reads skip the expense table; Staff also skips stock summaries. Today's Lagos business date is chosen by the action rather than a client argument. Activity remains a bounded recent history.

Amounts use integer kobo. Task totals use daily counter documents, independent of the 100-task display limit. Future task mutations must update tasks and their counters in the same transaction, including separate approval counters so Staff totals exclude approvals. Below the display limit, a missing counter can be derived exactly from the rows. At the limit, missing counters fail closed instead of silently understating progress; importers must supply complete counters for larger datasets. The current app has no public business-write functions.

An empty Convex deployment produces a real empty dashboard. Deploying the schema does not insert business/demo records. Cards and quick actions open inspection sheets; inventory entry, camera scanning, expense submission, approval mutations, and services that maintain these read models remain separate workflows.

## Design previews

Development-only routes use isolated fixtures with the same UI components:

```text
/dashboard-preview?role=owner
/dashboard-preview?role=manager
/dashboard-preview?role=staff
```

See `design/review/dashboard/index.html` for comparisons. Mockup/device aspect ratios, organisation artwork, and some icon details differ; the captures are not pixel-identical.

## Verification

```sh
yarn test:auth
yarn test:setup
yarn test:dashboard
npx tsc --noEmit
npx expo lint
```

Convex tests run in memory with `convex-test`. They cover real indexed reads, each role, tenant/actor isolation, financial exclusion, stale roles, revoked/pending sessions, removed membership, foreign origins, empty states, stale dates, and counts beyond the display limit. Clerk network responses are mocked only in automated tests; simulator verification uses the actual signed-in session and deployed development backend.

Integration references: https://docs.convex.dev/auth/clerk and https://docs.convex.dev/client/react-native.
