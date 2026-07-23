declare const App: (options: Record<string, unknown>) => void;
declare const Component: (options: Record<string, unknown>) => void;
declare const getApp: <T = Record<string, unknown>>() => T;

type WechatPageInstance = {
  data: Record<string, unknown>;
  setData: (data: Record<string, unknown>) => void;
};

declare const Page: (options: Record<string, unknown> & ThisType<WechatPageInstance>) => void;

declare const wx: {
  navigateTo: (options: { url: string }) => void;
  [key: string]: unknown;
};

declare const console: {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};
