function svg(contents: string, viewBox = "0 0 32 32") {
  return {
    uri: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${contents}</svg>`)}`,
  };
}

const paths = {
  plus: '<path d="M16 5v22M5 16h22"/>',
  minus: '<path d="M5 16h22"/>',
  arrow: '<path d="M5 16h22m-8-8 8 8-8 8"/>',
  up: '<path d="m8 24 16-16M10 8h14v14"/>',
  chevron: '<path d="m10 6 10 10-10 10"/>',
  down: '<path d="m8 12 8 8 8-8"/>',
  box: '<path d="m16 3 12 6-12 6L4 9Zm-12 6v15l12 6 12-6V9M16 15v15M10 6l12 6v7"/>',
  home: '<path d="m2 15 14-12 14 12h-5v15h-7V19h-5v11H6V15Z" fill="currentColor" stroke="none"/>',
  scan: '<path d="M12 4H5v8m15-8h7v8M5 20v8h7m15-8v8h-7M9 16h14"/>',
  barcode:
    '<path d="M5 8v16m4-19v22m5-19v16m4-19v22m5-19v16m4-19v22"/><path d="M3 4v3m26-3v3M3 25v3m26-3v3"/>',
  receipt: '<path d="M8 3h13l6 6v21H8ZM20 3v8h7M12 16h10m-10 5h10m-10 5h6"/>',
  activity: '<path d="M9 3h12l5 6v21H7V5Zm11 0v8h6M13 16h7m-7 8h7m-4-11v14"/>',
  clock: '<circle cx="16" cy="16" r="12"/><path d="M16 8v9l6 4"/>',
  warning: '<path d="m16 4 13 24H3Z"/><path d="M16 12v7m0 4h.01"/>',
  check: '<path d="m7 16 6 6L26 8"/>',
  movements: '<path d="M5 11h22l-6-6M27 21H5l6 6"/>',
  card: '<rect x="3" y="7" width="26" height="19" rx="3"/><path d="M3 13h26M8 19h7"/>',
  bell: '<path d="M7 13c0-12 18-12 18 0v9l3 3H4l3-3Zm6 15c0 4 6 4 6 0M16 2v2"/>',
  menu: '<path d="M4 7h24M4 16h24M4 25h24"/>',
  wifi: '<path d="M3 12c8-8 18-8 26 0M8 17c5-5 11-5 16 0m-11 5c2-2 4-2 6 0"/><circle cx="16" cy="27" r="1"/>',
  people:
    '<circle cx="12" cy="9" r="5"/><path d="M3 28v-4c0-8 18-8 18 0v4Z"/><path d="M23 5c6 0 6 9 0 9m2 5c6 1 5 5 5 9h-5"/>',
  truck:
    '<path d="M2 7h17v16H2Zm17 6h7l4 5v5H19Z"/><circle cx="8" cy="25" r="4"/><circle cx="25" cy="25" r="4"/>',
  bars: '<path d="M6 28V15m10 13V5m10 23V12" stroke-width="5"/>',
  search: '<circle cx="13" cy="13" r="9"/><path d="m20 20 9 9"/>',
  close: '<path d="m7 7 18 18M25 7 7 25"/>',
  pin: '<path d="M25 13c0 7-9 16-9 16S7 20 7 13a9 9 0 1 1 18 0Z"/><circle cx="16" cy="12" r="3"/>',
} as const;
export type DashboardIcon = keyof typeof paths;

export function dashboardIcon(name: DashboardIcon, color = "#008574") {
  return svg(
    `<g fill="none" color="${color}" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths[name].replaceAll("currentColor", color)}</g>`,
  );
}

export function tileFill(color: string) {
  return svg(
    `<defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${color}"/><stop offset=".52" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity=".8"/></linearGradient></defs><rect x="1" y="1" width="62" height="62" rx="13" fill="url(#g)"/><path d="M5 5h54v54H5Z" fill="white" fill-opacity=".045"/>`,
    "0 0 64 64",
  );
}

export const organizationArtwork = svg(
  '<defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#E3DFD7"/><stop offset="1" stop-color="#B4A58C"/></linearGradient></defs><rect width="80" height="80" rx="12" fill="url(#g)"/><path d="M11 60 40 43l29 16-29 17Z" fill="#AD854B"/><path d="M13 56V24l20-8v36Zm21-4V16l23 8v31Z" fill="#8B623C"/><path d="M18 26v21l12-5V21Z" fill="#C7C4AC"/><path d="m37 22 15 5v20l-15-4Z" fill="#47675E"/><path d="m8 57 24-12 20 9-24 13Z" fill="#C69A5B"/><path d="M8 57v15l20 7V67Zm20 10 24-13v16L28 79Z" fill="#A17C45"/><path d="m45 57 18-8 11 5-18 9Z" fill="#D3AA72"/><path d="M45 57v14l11 6V63Zm11 6 18-9v15l-18 8Z" fill="#8F683E"/>',
  "0 0 80 80",
);

export function ringChart(
  parts: { value: number; color: string }[],
  total: number,
  progress = false,
) {
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const arcs = parts
    .map((part) => {
      const length =
        total > 0 ? (Math.max(0, part.value) / total) * circumference : 0;
      const arc = `<circle cx="55" cy="55" r="${radius}" fill="none" stroke="${part.color}" stroke-width="${progress ? 12 : 14}" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}" ${progress ? 'stroke-linecap="round"' : ""}/>`;
      offset += length;
      return arc;
    })
    .join("");
  return svg(
    `<circle cx="55" cy="55" r="43" fill="none" stroke="#D5DEEC" stroke-width="${progress ? 12 : 14}"/><g transform="rotate(-90 55 55)">${arcs}</g>`,
    "0 0 110 110",
  );
}
