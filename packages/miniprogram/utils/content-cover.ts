import { resolveContentCover } from './shared/index';

export { resolveContentCover };

export function contentCoverSrc(cover?: string | null): string {
  return resolveContentCover(cover);
}
