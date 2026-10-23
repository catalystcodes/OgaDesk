# Business setup

The signed-in setup flow implements six screens from the supplied designs:

| Screen | Route | Reference |
| --- | --- | --- |
| Create profile | `/create-profile` | `design/proficeimg.png` |
| Select role | `/select-role` | `design/select-role.png` |
| Select organisation | `/select-organisation` | `design/select-org.png` |
| Invitation / Join organisation | `/join-organisation` | `design/invitation.png` |
| Review and confirm | `/review-confirm` | `design/review-confirmation.png` |
| Success | `/setup-success` | `design/succes.png` |

Users without a saved setup enter Create profile after signing in. Continue persists the draft, role preference, selected organisation, creation intent, and next step so setup can resume after relaunch; required fields, selections, modal pickers, back navigation, and review edits are functional. Owners can create an organisation on final confirmation. Existing members can select an organisation, and invited users can review and accept their own pending invitations. Confirmation verifies membership with Clerk before activating the organisation and saving completion. Retry IDs are retained after acknowledged organisation creation or invitation acceptance.

Clerk Organisations is enabled on the linked OgaDesk development instance. No production settings, existing environment keys, users, invitations, or organisation records were changed during implementation and testing.

## Data and access

- Live organisation and invitation lists come from `useOrganizationList()` and support pagination, empty, loading, refresh, and error states.
- The role picker records a preference. Access comes from Clerk's server-assigned membership; the picker never updates membership roles. Default `org:admin` and `org:member` labels appear as Owner and Staff; Manager is shown for `org:manager` if that custom role is configured. Other custom roles retain their display names.
- The invitation's assigned role and organisation location can be inspected without changing the invitation's access. Review shows assigned membership roles in a read-only sheet; only a new organisation's role preference can return to the role picker. An invitation is accepted only after the user confirms the review screen.
- Full name, business type, preferred location, and setup progress are saved as application profile preferences through Clerk's `user.updateMetadata()`. A newly created organisation's name is stored in Clerk. Shared warehouse/location records and organisation-wide business settings need the future business backend; this flow does not write them to client-editable organisation metadata.
- User `unsafeMetadata` is never an authority for permissions. Future business APIs must verify the Clerk token and organisation membership for every protected operation.
- The success button opens `/account` for live membership verification and then the role-based `/dashboard`. See [dashboard implementation](dashboards.md) for the protected API and remaining server configuration.

## Visual review

Three simulator capture passes refined typography, field spacing, illustration placement, selected cards, icon fills, text wrapping, and the invitation header curve. Final captures are in [the setup review folder](../design/review/setup/). [The comparison sheet](../design/review/setup/reference-comparison.jpg) places reference viewports above the current iOS captures. Device frames, photographic details, and operating-system chrome differ; typography and controls are native, and UI artwork is vector-based where appropriate.

For repeatable visual review without creating Clerk users, development builds expose:

```text
/design-preview?step=create-profile
/design-preview?step=select-role
/design-preview?step=select-organisation
/design-preview?step=join-organisation
/design-preview?step=review-confirm
/design-preview?step=setup-success
```

This route renders the same screen components with isolated design fixtures. It is guarded by `__DEV__`, redirects in production, and never writes fixtures to Clerk. Real setup routes remain protected by authentication. The reference business names, invitations, and generated organisation photographs appear only in the development preview.

## Validation

- TypeScript, Expo lint, and whitespace checks passed.
- Fifteen auth/setup tests passed, including profile validation, unsafe input handling, server-role labels, paginated membership checks, missing membership, and request failure handling.
- Browser interactions passed for profile validation, business/location pickers, preserving form edits when going back, role selection, organisation selection, locked invitation roles, review edits, completion, and authentication guards.
- All six screens were checked at 393 × 852 and 320 × 568: no horizontal overflow, with every primary action reachable by scrolling.
- Native visual captures used iPhone 14 Pro, iOS 16.4, Expo Go SDK 57.

No live user creation, organisation creation, or invitation acceptance was executed by the review. The existing simulator session was found waiting on Clerk’s `choose-organization` task. The updated app routes that live pending session into profile setup and blocks account access until membership is established. Completing account mutations still needs an authenticated account test.

```sh
yarn test:setup
yarn test:auth
npx tsc --noEmit
npx expo lint
```
