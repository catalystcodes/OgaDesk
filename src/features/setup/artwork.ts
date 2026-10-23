function svg(contents: string, viewBox = "0 0 32 32") {
  return {
    uri: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${contents}</svg>`)}`,
  };
}

const paths = {
  package:
    '<path fill="#168BFF" stroke="none" d="m16 2 13 7-13 7L3 9Zm-13 9 12 7v13L3 24Zm14 7 12-7v13l-12 7Z"/><path stroke="white" stroke-width="1.5" d="m9 6 13 7v7"/>',
  building:
    '<path d="M7 28V9l9-6 9 6v19M3 28h26M12 8h8M12 13h2m4 0h2m-8 5h2m4 0h2m-8 5h2m4 0h2M15 28v-5h3v5"/>',
  business: '<path d="M5 13h22v15H5zM11 13V9h10v4M5 19h22M14 18v4h4v-4"/>',
  people:
    '<path d="M19 28H3v-4c0-5 16-5 16 0v4Zm-8-13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm11 2c5 0 8 2 8 6v5h-7M22 5a5 5 0 0 1 0 10"/>',
  person: '<circle cx="16" cy="9" r="5"/><path d="M6 28v-4c0-9 20-9 20 0v4Z"/>',
  pin: '<path d="M26 13c0 7-10 16-10 16S6 20 6 13a10 10 0 1 1 20 0Z"/><circle cx="16" cy="13" r="3" fill="white" stroke="none"/>',
  boxes:
    '<path d="M11 3h10v11H11zM3 18h11v11H3zM18 18h11v11H18zM15 3v5h3V3M7 18v5h3v-5m12 0v5h3v-5"/>',
  chevron: '<path d="m7 12 9 9 9-9"/>',
  arrow: '<path d="M5 16h23M19 7l9 9-9 9"/>',
  back: '<path d="M28 16H5m9-9-9 9 9 9"/>',
  plus: '<path d="M16 5v22M5 16h22"/>',
  check: '<path d="m7 16 6 6L25 9"/>',
} as const;

export type SetupIconName = keyof typeof paths;
const solidPaths: Partial<Record<SetupIconName, string>> = {
  building:
    '<path fill="COLOR" stroke="none" d="M7 28V8l9-6 9 6v20H7ZM3 18h3v10H3Zm23-4h3v14h-3Z"/><path stroke="white" stroke-width="1.6" d="M11 9h3m4 0h3m-10 5h3m4 0h3m-10 5h3m4 0h3m-7 9v-5h4v5"/>',
  business:
    '<rect x="5" y="10" width="22" height="18" rx="3" fill="COLOR" stroke="none"/><path fill="none" d="M12 10V7c0-3 8-3 8 0v3"/><rect x="14" y="16" width="4" height="6" rx="1" fill="white" stroke="none"/>',
  people:
    '<g stroke="none" fill="COLOR"><circle cx="12" cy="9" r="5"/><path d="M3 28v-3c0-10 18-10 18 0v3Z"/><circle cx="23" cy="10" r="4" fill-opacity=".6"/><path d="M23 19c5 0 7 3 7 7v2h-6v-3c0-3-1-5-3-6Z" fill-opacity=".6"/></g>',
  boxes:
    '<g fill="COLOR" stroke="none"><path d="M11 3h10v11H11zM3 18h11v11H3zM18 18h11v11H18z"/></g><path fill="none" stroke="white" stroke-width="1.5" d="M15 4v5h3V4M7 19v5h3v-5m12 0v5h3v-5"/>',
};
export function setupIcon(
  name: SetupIconName,
  color = "#008574",
  filled = false,
) {
  return svg(
    `<g stroke="${color}" stroke-width="2" fill="${filled ? color : "none"}" stroke-linecap="round" stroke-linejoin="round">${(filled ? solidPaths[name] || paths[name] : paths[name]).replaceAll("COLOR", color)}</g>`,
  );
}

export const buttonFill = svg(
  '<defs><linearGradient id="button" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#009D88"/><stop offset=".5" stop-color="#008574"/><stop offset="1" stop-color="#007F70"/></linearGradient></defs><rect width="400" height="80" rx="16" fill="url(#button)"/>',
  "0 0 400 80",
);

export const setupWaves = svg(
  `<path fill="#E7F8F3" d="M0 25C90 70 30 160 125 140S230 20 340 80 500 10 600 50v250H0Z"/><path fill="#C9EDE4" d="M0 85c85 0 112 190 242 150S430 0 600 100v200H0Z"/><path fill="#E0F3FC" d="M250 300C340 190 400 40 600 70v230Z"/><path fill="#00A586" fill-opacity=".5" d="M0 125c145 170 185 117 330 175H0Z"/>`,
  "0 0 600 300",
);

export const invitationTrim = svg(
  '<path fill="#FBFDFC" d="M0 20C100 10 260 10 393 60v30H0Z"/>',
  "0 0 393 60",
);

export const celebration = svg(
  `<defs><linearGradient id="disc" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#66DCA2"/><stop offset=".55" stop-color="#00A484"/><stop offset="1" stop-color="#006D65"/></linearGradient></defs>
<circle cx="67" cy="153" r="45" fill="#EFFBF7"/><circle cx="236" cy="83" r="49" fill="#F0FBF8"/><circle cx="235" cy="166" r="32" fill="#DCF8EF"/><circle cx="93" cy="81" r="23" fill="#E6FAF3"/>
<g fill="#FFBA08"><rect x="29" y="4" width="12" height="29" rx="2" transform="rotate(-28 29 4)"/><rect x="270" y="5" width="12" height="18" rx="2" transform="rotate(-40 270 5)"/><rect x="270" y="112" width="11" height="15" rx="2" transform="rotate(-35 270 112)"/><circle cx="243" cy="37" r="7"/><circle cx="77" cy="189" r="7"/><rect x="47" y="111" width="10" height="10" rx="1" transform="rotate(45 47 111)"/></g>
<g fill="#008BFF"><rect x="26" y="72" width="13" height="20" rx="2" transform="rotate(38 26 72)"/><rect x="269" y="66" width="12" height="15" rx="2" transform="rotate(-35 269 66)"/><rect x="289" y="170" width="12" height="28" rx="2" transform="rotate(33 289 170)"/></g>
<g fill="#00AC7A"><rect x="25" y="157" width="11" height="28" rx="2" transform="rotate(-30 25 157)"/><rect x="294" y="48" width="11" height="22" rx="2" transform="rotate(33 294 48)"/><rect x="171" y="13" width="4" height="20" rx="2"/><rect x="133" y="26" width="4" height="17" rx="2" transform="rotate(-30 133 26)"/><circle cx="204" cy="210" r="3"/></g><g fill="#FF8C00"><circle cx="82" cy="55" r="7"/><circle cx="271" cy="158" r="7"/></g>
<ellipse cx="169" cy="194" rx="54" ry="6" fill="#CFEBE2" fill-opacity=".6"/><circle cx="169" cy="124" r="78" fill="url(#disc)"/><path d="m133 125 23 24 51-54" fill="none" stroke="white" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>`,
  "0 0 335 225",
);
