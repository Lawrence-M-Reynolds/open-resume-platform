import { describe, expect, it } from 'vitest';

import { formatDate } from './date';

describe('formatDate', () => {
  it('returns an em dash for nullish or empty values', () => {
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate(null)).toBe('—');
    expect(formatDate('')).toBe('—');
  });

  it('returns an em dash for invalid date strings', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('formats valid ISO dates', () => {
    const iso = '2024-01-15T12:00:00.000Z';
    const expected = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));

    expect(formatDate(iso)).toBe(expected);
  });
});
