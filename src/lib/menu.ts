export function parseItemDescription(rawDesc: string | null): { cleanDescription: string; originalPrice: number | null } {
  if (!rawDesc) return { cleanDescription: "", originalPrice: null };
  const match = rawDesc.match(/\[ORIGINAL:([0-9.]+)\]/);
  if (match) {
    const origPrice = parseFloat(match[1]);
    const clean = rawDesc.replace(/\[ORIGINAL:[0-9.]+\]/, "").trim();
    return { cleanDescription: clean, originalPrice: origPrice };
  }
  return { cleanDescription: rawDesc, originalPrice: null };
}
