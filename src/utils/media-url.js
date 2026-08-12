import { CONFIG } from 'src/config-global';

export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return url;

  const trimmed = url.trim();
  if (!trimmed.startsWith('/uploads/')) return trimmed;

  if (import.meta.env.DEV) return trimmed;

  const base = (CONFIG.site.serverUrl || '').replace(/\/$/, '');
  if (!base || base === '/api') return trimmed;
  return `${base}${trimmed}`;
};

export const resolveMediaUrls = (urls = []) =>
  (Array.isArray(urls) ? urls : [urls])
    .filter((url) => typeof url === 'string' && url.trim())
    .map((url) => resolveMediaUrl(url));
