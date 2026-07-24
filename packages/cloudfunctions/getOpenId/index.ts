type Envelope<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

declare const require: (id: string) => {
  init: (opts?: object) => void;
  getWXContext: () => { OPENID?: string };
};

const cloud = require('wx-server-sdk');
cloud.init();

export async function main(
  _event: Record<string, unknown> = {},
): Promise<Envelope<{ openid: string }>> {
  try {
    const openid = cloud.getWXContext().OPENID;
    if (!openid || typeof openid !== 'string') {
      return {
        ok: false,
        code: 'UNAUTHORIZED',
        message: '无法获取用户身份',
      };
    }
    return { ok: true, data: { openid } };
  } catch (e) {
    const message = e instanceof Error ? e.message : '内部错误';
    return { ok: false, code: 'INTERNAL', message };
  }
}
