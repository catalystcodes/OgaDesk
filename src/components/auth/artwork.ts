// Vector artwork keeps the supplied design sharp at every device density.
const googlePaths = `
  <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.23c1.89-1.74 2.98-4.31 2.98-7.36Z"/>
  <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.23-2.51c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.12H3.05v2.59A10 10 0 0 0 12 22Z"/>
  <path fill="#FBBC05" d="M6.39 13.92a6 6 0 0 1 0-3.84V7.49H3.05a10 10 0 0 0 0 9.02l3.34-2.59Z"/>
  <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.82 1.49l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.95 5.49l3.34 2.59A6.01 6.01 0 0 1 12 5.96Z"/>`;

const applePath = `<path fill="#050606" d="M17.05 12.54c.03 3.25 2.85 4.33 2.88 4.34-.02.08-.45 1.54-1.49 3.05-.91 1.3-1.85 2.59-3.33 2.62-1.46.03-1.93-.85-3.6-.85-1.66 0-2.18.82-3.55.88-1.43.05-2.52-1.41-3.43-2.7C2.67 17.24 1.24 12.39 3.15 9.1c.95-1.64 2.65-2.68 4.5-2.71 1.4-.03 2.74.94 3.6.94.87 0 2.49-1.16 4.19-.99.71.03 2.69.29 3.96 2.16-.1.07-2.37 1.38-2.35 4.04ZM14.32 4.59c.76-.92 1.27-2.19 1.13-3.46-1.09.04-2.43.73-3.21 1.65-.7.81-1.31 2.1-1.14 3.34 1.21.09 2.45-.62 3.22-1.53Z"/>`;

function svgSource(contents: string, viewBox: string) {
  return {
    uri: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${contents}</svg>`,
    )}`,
  };
}

export const googleIcon = svgSource(googlePaths, "0 0 24 24");
export const appleIcon = svgSource(applePath, "0 0 24 24");

// The social illustration is drawn from the same vector logos as the buttons.
// Keep it vector-based: the previous 188px screenshot crop blurred on @3x screens.
export const socialIllustration = svgSource(
  `<defs>
    <linearGradient id="wash" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#EAF8F5"/><stop offset="1" stop-color="#C3EEE4"/>
    </linearGradient>
    <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2=".2">
      <stop stop-color="#78D9C2"/><stop offset=".55" stop-color="#009A7B"/><stop offset="1" stop-color="#80DCC9"/>
    </linearGradient>
    <linearGradient id="tile" x1="0" y1="0" x2=".8" y2="1">
      <stop stop-color="#FFFFFF"/><stop offset="1" stop-color="#F2FAF8"/>
    </linearGradient>
  </defs>
  <path fill="url(#wash)" d="M24 63C42 37 108 27 166 27c59-1 76 17 116 30 38 12 69 35 60 78-8 42-38 61-86 62l-165-1c-43 0-73-12-78-48C8 116 9 87 24 63Z"/>
  <path fill="#D6F3EB" fill-opacity=".75" d="M201 62C230 39 250-7 291 6c43 13 60 35 45 70-17 39-50 73-84 78-39 6-83-63-51-92Z"/>
  <path fill="url(#ribbon)" d="M34 174c18-22 38-36 66-39 37-4 78 19 116 35 30 13 59 20 92 10-12 17-32 21-58 21H78c-37 0-62-5-44-27Z"/>
  <path fill="#75D3BE" fill-opacity=".4" d="M80 137c34-12 61-7 91 6l70 35c16 8 32 13 48 13-20 8-49 10-75 9-57-1-111-21-134-63Z"/>
  <circle cx="40" cy="151" r="10" fill="#A3E4D5"/>
  <circle cx="351" cy="84" r="6" fill="#C4EFE5"/>
  <g transform="rotate(-13 125 98)">
    <rect x="73" y="47" width="116" height="119" rx="21" fill="#81CBB9" fill-opacity=".1"/>
    <rect x="68" y="39" width="116" height="119" rx="21" fill="url(#tile)" stroke="#EDF8F5"/>
    <g transform="translate(99 71) scale(2.35)">${googlePaths}</g>
  </g>
  <g transform="rotate(11 242 132)">
    <rect x="189" y="80" width="116" height="120" rx="21" fill="#53B79F" fill-opacity=".12"/>
    <rect x="184" y="72" width="116" height="120" rx="21" fill="url(#tile)" stroke="#EAF6F2"/>
    <g transform="translate(218 100) scale(2.35)">${applePath}</g>
  </g>`,
  "0 0 365 208",
);

export const brandMark = svgSource(
  `<defs>
    <linearGradient id="left" x2="1" y2="1"><stop stop-color="#00B49C"/><stop offset="1" stop-color="#006F65"/></linearGradient>
    <linearGradient id="right" x2=".5" y2="1"><stop stop-color="#007D76"/><stop offset="1" stop-color="#003D43"/></linearGradient>
    <linearGradient id="top"><stop stop-color="#FFC52D"/><stop offset="1" stop-color="#FFA900"/></linearGradient>
  </defs>
  <path fill="url(#top)" d="m23 1 20 10-20 11L3 11Z"/>
  <path fill="url(#left)" d="M2 15 20 25v23L2 38Z"/>
  <path fill="url(#right)" d="m44 15-20 11v22l20-11Z"/>
  <path fill="#fff" d="m23 22 21-11v7L30 26v7l10-6v8L23 45V22Z"/>`,
  "0 0 46 50",
);
