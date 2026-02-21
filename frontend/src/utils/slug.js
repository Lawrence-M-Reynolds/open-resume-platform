/**
 * Convert text to a URL/filesystem-safe slug (alphanumeric, hyphens, underscores).
 * @param {string} text
 * @param {string} [fallback='resume']
 * @returns {string}
 */
export function slugify(text, fallback = 'resume') {
  if (!text || typeof text !== 'string') return fallback;
  const slug = text.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-');
  return slug || fallback;
}
