/** Integer kcal via Math.round */
export function roundKcal(value: number): number {
  return Math.round(value);
}

/** One decimal place via Math.round(x * 10) / 10 */
export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
