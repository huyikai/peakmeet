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

interface WechatCloud {
  init: (options: { env: string; traceUser?: boolean }) => void;
}

declare const wx: {
  cloud?: WechatCloud;
  navigateTo: (options: { url: string }) => void;
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
