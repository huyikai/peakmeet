/** Miniprogram local placeholder for empty content covers. */
export const DEFAULT_CONTENT_COVER = '/assets/images/content-placeholder.png';

export function resolveContentCover(cover?: string | null): string {
  if (cover == null) return DEFAULT_CONTENT_COVER;
  const trimmed = cover.trim();
  if (trimmed === '') return DEFAULT_CONTENT_COVER;
  return trimmed;
}
