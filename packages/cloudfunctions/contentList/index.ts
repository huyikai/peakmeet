import {
  contentErr,
  contentOk,
  validateListQuery,
  type ContentEnvelope,
} from '@peakmeet/shared';

declare const require: (id: string) => {
  init: (opts?: object) => void;
  database: () => { collection: (name: string) => any };
};

const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

type ListData = { items: unknown[] };

export async function main(
  event: Record<string, unknown> = {},
): Promise<ContentEnvelope<ListData>> {
  try {
    const parsed = validateListQuery({
      collection: event.collection,
      limit: event.limit,
      skip: event.skip,
      filter: event.filter,
    });
    if (!parsed.ok) {
      return contentErr(parsed.code, parsed.message);
    }

    const { collection, limit, skip, filter } = parsed.value;
    let query: any = db.collection(collection);
    if (Object.keys(filter).length > 0) {
      query = query.where(filter);
    }

    const res = await query
      .orderBy('sortWeight', 'desc')
      .orderBy('_id', 'asc')
      .skip(skip)
      .limit(limit)
      .get();

    return contentOk({ items: res.data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : '内部错误';
    return contentErr('INTERNAL', message);
  }
}
