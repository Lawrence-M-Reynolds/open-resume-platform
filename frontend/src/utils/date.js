/**
 * Format an ISO date string for display (e.g. "Jan 15, 2025").
 * @param {string | null | undefined} isoString
 * @returns {string}
 */
export function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
