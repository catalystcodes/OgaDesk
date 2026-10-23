# Clerk authentication

OgaDesk uses `@clerk/expo` with the existing Google and Apple sign-in screen. Clerk handles both new accounts and returning users. Mobile sessions persist in `expo-secure-store`; web sessions use Clerk's browser integration.

## Local configuration

Set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in your local `.env`, using the publishable key from the intended Clerk application. Preserve an existing `.env`; `.env.example` documents the variable. Restart Expo after changing it. This client does not need `CLERK_SECRET_KEY`.

The application selected during setup is `app_3KvNhe8rSGGs3MJ4X2w0QKmFPgp`. To connect the CLI to it, run:

```sh
npx --yes --package=clerk@latest clerk auth login
npx --yes --package=clerk@latest clerk link --app app_3KvNhe8rSGGs3MJ4X2w0QKmFPgp
npx --yes --package=clerk@latest clerk doctor
```

Do not pull keys from another application or create an accountless application for this project.

## Dashboard configuration

- Enable the Native API under Native applications.
- Enable Google and Apple under Social connections, completing each provider's credential requirements.
- Register `ogadesk://sso-callback` as a redirect URL for native builds. Allow the development or production web origin and its `/sso-callback` URL when using web.
- Expo Go generates an `exp://…/--/sso-callback` redirect for its current development URL. Provider policies may require a development build with the `ogadesk` scheme for end-to-end OAuth testing.
- The additional verification screen uses Clerk's hosted authentication on mobile and Clerk's web components in the browser. Native production callbacks must also be registered under Native applications.

Reference: [Clerk Expo quickstart](https://clerk.com/docs/expo/getting-started/quickstart), [OAuth custom flows](https://clerk.com/docs/guides/development/custom-flows/authentication/oauth-connections), [hosted authentication](https://clerk.com/docs/reference/expo/native-hooks/use-hosted-auth).

## Session behavior

On first launch, signed-out users see splash → onboarding → sign-in. Completing or skipping the introduction is remembered on the device; later signed-out launches open sign-in after splash. Active sessions open `/account`; users without completed business setup continue to `/create-profile`. Completed accounts verify live membership and restore the saved active organisation before opening the role-based dashboard. The account/settings screen retains organisation switching and sign-out. See [dashboards](dashboards.md) for the server-side role checks and data configuration. Removed memberships return to the organisation picker; failed checks offer retry. Incomplete accounts resume the last saved setup checkpoint. See [business setup](business-setup.md) for the six-screen flow. A pending `choose-organization` task enters the app’s profile/organisation setup, with workspace access blocked until organisation activation clears the task. Other pending session tasks stay in Clerk verification. Cancelling OAuth restores the buttons without an error; failed requests show a retryable message.

`Stack.Protected` controls navigation in the client. Any future backend must separately verify Clerk session tokens and authorize business data.

## Validation

```sh
yarn test:auth
npx tsc --noEmit
npx expo lint
```

The auth tests exercise activation, cancellation, incomplete attempts, pending session tasks, and safe error messages without creating Clerk users. A complete live sign-in, relaunch, and sign-out check should use an explicitly approved account in the configured Clerk application.

Verified during implementation: all seven auth tests, TypeScript, Expo lint, and Expo dependency compatibility passed. A fresh iOS simulator launch preserved the sign-in content pixel for pixel, excluding system bars. Browser checks confirmed signed-out account-route protection, Google and Apple provider redirects, duplicate-request prevention, and cancellation recovery. Full account authentication and session restoration were not exercised.

The Clerk CLI is now authenticated and this repository is linked to OgaDesk (`app_3KvNhe8rSGGs3MJ4X2w0QKmFPgp`). Clerk's health check confirms the application is reachable. Its development instance has the Native API, Google, and Apple enabled. The existing `.env` was preserved. The CLI's missing `CLERK_SECRET_KEY` warning does not require adding a server secret to this mobile client.

Registered development callbacks:

- `ogadesk://sso-callback`
- `exp://127.0.0.1:8081/--/sso-callback` (the current iOS simulator server)
- `http://localhost:8081/sso-callback` (the current web server)

If the development server address changes, register its exact new callback URL before testing OAuth there.

## Flow audit

See [the flow review](auth-flow-review.md) for the latest fixes, simulator checks, and remaining live-account/release work.
