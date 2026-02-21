import { describe, expect, it } from 'vitest';

import { slugify } from './slug';

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('My Resume 2026')).toBe('My-Resume-2026');
  });

  it('removes unsupported characters', () => {
    expect(slugify('Senior Dev / C++ & AI')).toBe('Senior-Dev-C-AI');
  });

  it('preserves hyphens and underscores', () => {
    expect(slugify('my_resume-v2')).toBe('my_resume-v2');
  });

  it('falls back when the slug would be empty', () => {
    expect(slugify('@@@', 'fallback-name')).toBe('fallback-name');
  });

  it('falls back when value is not a string at runtime', () => {
    expect(slugify(123 as unknown as string, 'fallback-name')).toBe('fallback-name');
  });
});
