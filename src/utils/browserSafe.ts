/**
 * Safe browser API helpers to prevent "Breaking Browser Locker Behavior detected" errors
 * in sandboxed iframes (e.g. AI Studio development and evaluation environments).
 */

/**
 * Triggers printing safely without throwing if the browser or sandbox blocks window.print().
 */
export function safePrint(): boolean {
  try {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
      return true;
    }
  } catch (err) {
    console.warn('Printing was intercepted or restricted by the sandbox environment:', err);
  }
  return false;
}

/**
 * Opens a window safely without throwing if the browser or sandbox blocks window.open().
 */
export function safeOpenWindow(url: string, target = '_blank', features = ''): Window | null {
  try {
    if (typeof window !== 'undefined' && typeof window.open === 'function') {
      return window.open(url, target, features);
    }
  } catch (err) {
    console.warn('Window open was intercepted or restricted by the sandbox environment:', err);
  }
  return null;
}
