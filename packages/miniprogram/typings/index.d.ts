declare const App: (options: Record<string, unknown>) => void;
declare const Page: (options: Record<string, unknown>) => void;
declare const Component: (options: Record<string, unknown>) => void;
declare const getApp: <T = Record<string, unknown>>() => T;
declare const wx: {
  // Minimal stub for skeleton compile; expand when CloudBase is wired.
  [key: string]: unknown;
};
