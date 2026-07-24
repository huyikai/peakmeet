import {
  contentErr,
  contentOk,
  validateGetByIdQuery,
  type ContentEnvelope,
} from '@peakmeet/shared';

declare const require: (id: string) => {
  init: (opts?: object) => void;
  database: () => {
    collection: (name: string) => {
      doc: (id: string) => { get: () => Promise<{ data: unknown }> };
    };
  };
};

const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

type ItemData = { item: Record<string, unknown> };

export async function main(
  event: Record<string, unknown> = {},
): Promise<ContentEnvelope<ItemData>> {
  try {
    const parsed = validateGetByIdQuery({
      collection: event.collection,
      id: event.id,
    });
    if (!parsed.ok) {
      return contentErr(parsed.code, parsed.message);
    }

    const { collection, id } = parsed.value;
    const res = await db.collection(collection).doc(id).get();
    const raw = res.data;
    const item = Array.isArray(raw) ? raw[0] : raw;
    if (!item || typeof item !== 'object') {
      return contentErr('NOT_FOUND', '未找到文档');
    }
    return contentOk({ item: item as Record<string, unknown> });
  } catch (e) {
    const message = e instanceof Error ? e.message : '内部错误';
    // CloudBase often throws when doc missing
    if (/not exist|does not exist|找不到|DOCUMENT_NOT_EXIST/i.test(message)) {
      return contentErr('NOT_FOUND', '未找到文档');
    }
    return contentErr('INTERNAL', message);
  }
}
