# Setup artwork

Generated with the built-in imagegen tool using the supplied local screen images as visual references. Original outputs remain in the Codex generated-image library. Final project assets:

- `assets/images/setup-warehouse.png`: 2172 × 724 transparent warehouse vignette, used in the profile footer and invitation header.
- `assets/images/setup-org-exterior.jpg`: 384 × 384 development-preview organisation thumbnail.
- `assets/images/setup-org-stock.jpg`: 384 × 384 development-preview organisation thumbnail.
- `assets/images/setup-org-warehouse.jpg`: 384 × 384 development-preview organisation thumbnail.

Thumbnail originals were optimized into small JPEGs for bundling. Production organisation photos come from Clerk; these reference thumbnails are isolated to the development design preview. Logos, interface icons, button gradients, mint/blue waves, and the success illustration are code-authored vectors in `src/features/setup/artwork.ts`.

## Warehouse prompt

Use case: precise-object-edit. Asset type: clean high-resolution photographic warehouse vignette for the bottom of the OgaDesk mobile create-profile screen and the top-right of its invitation screen. Input Image 1 is the profile screen reference; Input Image 2 is the invitation screen reference. Extract and reconstruct ONLY the warehouse decorative scene seen at the bottom of image 1: brown cardboard carton stacks on wooden pallets on the left, a black and yellow forklift near the centre-right, with softly defocused industrial warehouse shelves on the far right, a light reflective floor below. Match the objects, photoreal miniature look, proportions and natural lighting of these references. Output the decorative scene by itself in a wide landscape composition approximately 3:1, with crisp detail suitable for a 1200-pixel wide asset. Transparent background above and around the cutout vignette, smoothly fading the far-right warehouse background into transparency. The cartons and forklift should sit along the bottom edge; preserve the whole forklift and carton stacks without cropping. Do not include a phone, screen, UI, text, logos, buttons, icons, a person, status bar, border, or any coloured ribbons; mint and blue ribbons will be drawn separately in native UI.

## Organisation thumbnail prompts

Shared prompt: Asset type: square photographic organisation thumbnail for a mobile business app. The attached design is a composition reference only. Recreate ONLY the scene below, matching the corresponding thumbnail in the reference. Photorealistic, clean, crisp, square composition, at least 512px, entirely filled by the photo. No phone, interface, border, rounded corners, text, labels or watermarks. This will be displayed as a small 70px thumbnail in the app.

1. First selected organisation thumbnail: the compact two-storey yellow/orange and dark charcoal warehouse facade, viewed from the front-left corner, stacked cartons at its loading entrance, blue sky.
2. Second organisation thumbnail: close view of neatly stacked brown cardboard cartons inside an industrial warehouse, dark blue steel shelves and warm light, no legible branding.
3. Third organisation thumbnail: front view of a teal corrugated-metal industrial warehouse building with loading shutters, brown cartons and pallets at the entrance, bright blue sky.
