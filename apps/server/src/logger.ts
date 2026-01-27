const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  log: (...args: unknown[]) => { if (isDev) console.log(...args); },
  error: (...args: unknown[]) => { console.error(...args); },
  warn: (...args: unknown[]) => { console.warn(...args); },
};
