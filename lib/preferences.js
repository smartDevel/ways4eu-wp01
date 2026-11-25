export const COLOR_SCHEMES = [
  ["ocean", "Ocean"],
  ["midnight", "Midnight"],
  ["forest", "Forest"],
  ["sunset", "Sunset"],
];

export const PAGE_SIZES = [5, 10, 25, 50];

export function normalizePageSize(value) {
  const size = Number(value);
  return PAGE_SIZES.includes(size) ? size : 10;
}
