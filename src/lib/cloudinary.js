/**
 * Inject Cloudinary delivery transformations into an image URL so we serve
 * appropriately-sized, auto-formatted (WebP/AVIF), auto-compressed images
 * instead of the full-resolution original.
 *
 * - Non-Cloudinary URLs (or empty values) are returned unchanged.
 * - URLs that already contain a transformation right after /upload/ are left
 *   alone (avoids double-applying).
 *
 * @param {string} url   the original image URL
 * @param {object} opts  { w?: number, h?: number, q?: string|number }
 */
export function cldUrl(url, { w, h, q = 'auto' } = {}) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const [base, rest] = parts;
  // If a transformation segment is already present, don't add another.
  const firstSeg = rest.split('/')[0];
  if (/(^|,)(f_|q_|w_|h_|c_)/.test(firstSeg)) return url;

  const t = ['f_auto', `q_${q}`];
  if (w) t.push(`w_${w}`);
  if (h) t.push(`h_${h}`);
  t.push('c_limit'); // never upscale; preserve aspect ratio within bounds

  return `${base}/upload/${t.join(',')}/${rest}`;
}
