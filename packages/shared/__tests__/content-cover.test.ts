import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CONTENT_COVER,
  resolveContentCover,
} from '../src/content/index';

describe('resolveContentCover', () => {
  it('returns default for null, undefined, blank', () => {
    expect(resolveContentCover(null)).toBe(DEFAULT_CONTENT_COVER);
    expect(resolveContentCover(undefined)).toBe(DEFAULT_CONTENT_COVER);
    expect(resolveContentCover('')).toBe(DEFAULT_CONTENT_COVER);
    expect(resolveContentCover('   ')).toBe(DEFAULT_CONTENT_COVER);
  });

  it('returns trimmed non-empty cover', () => {
    expect(resolveContentCover(' cloud://x ')).toBe('cloud://x');
  });

  it('default path is miniprogram asset', () => {
    expect(DEFAULT_CONTENT_COVER).toBe('/assets/images/content-placeholder.png');
  });
});
