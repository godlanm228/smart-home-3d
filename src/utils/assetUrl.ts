/** Prefixes public asset paths with Vite's BASE_URL so the app works both at
 *  the domain root (dev, Vercel/Cloudflare) and under a sub-path (GitHub Pages). */
export function assetUrl(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
