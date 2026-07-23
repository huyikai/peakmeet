export const EMPTY_TIP = '请完整填写后再计算';

export function parseRequiredNumber(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}
