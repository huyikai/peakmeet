declare const App: (options: Record<string, unknown>) => void;
declare const Component: (options: Record<string, unknown>) => void;
declare const getApp: <T = Record<string, unknown>>() => T;

type WechatPageInstance = {
  data: Record<string, unknown>;
  setData: (data: Record<string, unknown>) => void;
};

declare const Page: <T extends Record<string, unknown>>(
  options: T & ThisType<WechatPageInstance & T>,
) => void;

interface WechatInnerAudioContext {
  src: string;
  obeyMuteSwitch: boolean;
  play: () => void;
  stop: () => void;
  destroy: () => void;
}

interface WechatCloudDbCollection {
  where: (cond: Record<string, unknown>) => WechatCloudDbQuery;
  doc: (id: string) => {
    remove: () => Promise<unknown>;
  };
  add: (opts: { data: Record<string, unknown> }) => Promise<unknown>;
  limit: (n: number) => WechatCloudDbQuery;
  get: () => Promise<{ data: unknown[] }>;
}

interface WechatCloudDbQuery {
  where: (cond: Record<string, unknown>) => WechatCloudDbQuery;
  limit: (n: number) => WechatCloudDbQuery;
  get: () => Promise<{ data: unknown[] }>;
}

interface WechatCloud {
  init: (options: { env: string; traceUser?: boolean }) => void;
  callFunction: (options: {
    name: string;
    data?: Record<string, unknown>;
  }) => Promise<{ result: unknown }>;
  database: () => {
    collection: (name: string) => WechatCloudDbCollection;
  };
}

type WechatTouchEvent = {
  currentTarget: { dataset: Record<string, unknown> };
  detail?: Record<string, unknown>;
};

type WechatInputEvent = {
  detail: { value?: string };
};

declare const wx: {
  cloud?: WechatCloud;
  navigateTo: (options: {
    url: string;
    fail?: () => void;
  }) => void;
  navigateBack: (options?: { fail?: () => void }) => void;
  switchTab: (options: { url: string }) => void;
  showToast: (options: { title: string; icon?: string }) => void;
  getStorageSync: (key: string) => unknown;
  setStorageSync: (key: string, value: unknown) => void;
  vibrateShort: (options?: { type?: string }) => void;
  createInnerAudioContext: () => WechatInnerAudioContext;
  [key: string]: unknown;
};

declare const console: {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

declare function setInterval(handler: () => void, timeout?: number): number;
declare function clearInterval(handle?: number): void;
