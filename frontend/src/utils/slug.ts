export function slugify(text: string, fallback = 'resume'): string {
  if (!text || typeof text !== 'string') return fallback;
  const slug = text.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-');
  return slug || fallback;
}
