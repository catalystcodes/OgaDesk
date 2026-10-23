Authentication screen visual review

The six business setup screens and their three-pass screenshot review are documented in [business setup](../../docs/business-setup.md). Final [iOS previews](setup/screens-ios.jpg), [reference comparison](setup/reference-comparison.jpg), and [generated assets/prompts](setup/assets-and-prompts.md) are saved under `setup/`.

- Reference: the third screen, “Sign in (Social Only)”, in `../auth-page.png`.
- Device: iPhone 14 Pro, iOS 16.4, Expo Go SDK 57.
- Native screenshot: `auth-screen-ios.png` (1179 × 2556 pixels; 393 × 852 points).
- Original side-by-side comparison: `auth-comparison.png`. This predates the vector illustration fix; `auth-screen-ios.png` is the current native capture.
- Three visual passes refined heading width, spacing, provider label alignment, icon sizes, illustration placement, and legal text.
- The social illustration is now recreated as vector shapes in `src/components/auth/artwork.ts`, using the same Google and Apple paths as the buttons. This replaces the enlarged 188 × 111 pixel crop while retaining its mint background, overlapping white tiles, and provider logos.
- Text and controls are native; the brand mark and provider icons are scalable vectors. The phone frame and operating system chrome in the reference are outside the app UI.
- Provider buttons use Clerk OAuth. Legal-document links still show availability messages; published legal documents are not configured in this repository.

Validation: `npx tsc --noEmit`, `npx expo lint`, and `git diff --check`.

Splash and onboarding visual review

- References: the first two screens in `../auth-page.png`.
- Final screenshots: `splash-screen-ios.png` and `onboarding-screen-ios.png`.
- Original side-by-side comparisons: `splash-comparison.png` and `onboarding-comparison.png`. The onboarding comparison predates the consistent-height layout fix; the native captures are current.
- Multiple simulator comparison passes refined logo proportions, typography, illustration placement, feature-card text, pagination, button placement, and footer spacing.
- The splash uses a reconstructed warehouse photograph with native branding and an animated loading indicator. Onboarding uses a cleaned illustration with a native feature card, four swipeable pages, selectable pagination, Get Started, Skip, and Sign in controls.
- Reconstructed artwork follows the supplied composition; photo details, vector logo geometry, native font rendering, and operating system chrome differ from the flattened reference. Image preparation and final prompts are recorded in `asset-prompts.md`.
- Routes: `/` shows the splash, `/onboarding` shows the introduction, and `/sign-in` retains the existing authentication UI. The splash advances 1.8 seconds after its background finishes loading.
- Native launch configuration in `app.json` now uses the OgaDesk mark on a dark teal background. This configuration needs a new development/release binary; the complete native launch sequence has not been verified in a release build.
- Native verification: iPhone 14 Pro, iOS 16.4, Expo Go SDK 57, including the automatic splash-to-onboarding transition.
- Browser interaction checks passed for all four pagination controls, Get Started, Skip, Sign in, automatic splash transition, no horizontal document overflow at 320 × 568, and no runtime exceptions.
- Final lint, TypeScript, and whitespace checks passed. No packages or native project directories were added.

Illustration and carousel layout fixes

- `onboarding-pages-ios.jpg` shows all four current pages side by side. Individual captures are `onboarding-screen-ios.png` and `onboarding-page-2-ios.png` through `onboarding-page-4-ios.png`.
- The carousel now has a measured, bounded viewport. All pages reserve equal heading/subtitle space and share one image canvas with `contentFit="contain"`; the first illustration is no longer stretched.
- On the iPhone 14 Pro, all four image frames measure 296 points high. Pagination, Get Started, and Sign in remain in a shared footer below the carousel.
- Short viewports and larger text can scroll within a page while shared controls remain visible. The feature card's labels fit on one line at its illustration scale.
- Browser checks at 393 × 852 and 320 × 568 confirmed equal image heights and vertical positions, stable footer bounds across every page, correct pagination selection, and no horizontal page overflow. Actual touch drags advanced through all four slides at 393 × 852; pagination now updates from scroll events on web as well as native momentum events.
- The vector sign-in illustration was checked in the iOS simulator and at 3× browser pixel density. No dependencies were added for these fixes.
