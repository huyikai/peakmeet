import type { ContentQueryCode } from './types';

export type ContentEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; code: ContentQueryCode; message: string };

export function contentOk<T>(data: T): ContentEnvelope<T> {
  return { ok: true, data };
}

export function contentErr(
  code: ContentQueryCode,
  message: string,
): ContentEnvelope<never> {
  return { ok: false, code, message };
}
