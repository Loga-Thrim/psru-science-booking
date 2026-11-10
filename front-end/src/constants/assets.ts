/**
 * Where uploaded room images ("/uploads/...") are fetched from.
 *
 * Empty in the normal build: the page and the uploads share an origin. The
 * csstu build lives under a university userdir and cannot serve the droplet's
 * /uploads, so it routes them through its PHP proxy (VITE_UPLOADS_BASE).
 */
const UPLOADS_BASE: string = import.meta.env.VITE_UPLOADS_BASE ?? "";

export function assetUrl(url: string): string {
  return url.startsWith("/uploads/") ? UPLOADS_BASE + url : url;
}
