const preloaders = new Map();
const cache = new Map();

export function initPreload(path, fn) {
  if (typeof fn === 'function') preloaders.set(path, fn);
}

export function preload(path) {
  if (cache.has(path)) return cache.get(path);

  const fn = preloaders.get(path);
  if (!fn) return;

  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      cache.set(path, result);
      result.catch(() => cache.delete(path));
      return result;
    }
    return result;
  } catch (error) {
    console.warn('Preload failed for:', path, error);
  }
}

if (typeof window !== 'undefined') {
  window.__routePreload = { preload, initPreload };
}
