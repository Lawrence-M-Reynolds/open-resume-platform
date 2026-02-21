import { describe, expect, it } from 'vitest';

import type { Template } from '../types/api';
import { getTemplateUseCase, matchesTemplateQuery } from './template';

const baseTemplate: Template = {
  id: 'default-template',
  name: 'General Template',
  description: null,
};

describe('getTemplateUseCase', () => {
  it('returns default guidance when template is missing', () => {
    expect(getTemplateUseCase(null)).toBe(
      'General-purpose template for most job applications.',
    );
  });

  it('returns a trimmed description when provided', () => {
    expect(
      getTemplateUseCase({
        ...baseTemplate,
        description: '  Built for consultancy and strategy roles.  ',
      }),
    ).toBe('Built for consultancy and strategy roles.');
  });

  it('infers formal guidance from template name keywords', () => {
    expect(
      getTemplateUseCase({
        ...baseTemplate,
        name: 'Banking - Conservative',
      }),
    ).toBe(
      'Best for formal industries where conservative formatting is preferred.',
    );
  });

  it('infers creative guidance from template name keywords', () => {
    expect(
      getTemplateUseCase({
        ...baseTemplate,
        name: 'Modern Creative',
      }),
    ).toBe(
      'Best for modern or creative roles that benefit from visual character.',
    );
  });

  it('infers leadership guidance from template name keywords', () => {
    expect(
      getTemplateUseCase({
        ...baseTemplate,
        name: 'Executive VP Profile',
      }),
    ).toBe('Best for leadership profiles focused on strategic impact.');
  });
});

describe('matchesTemplateQuery', () => {
  const template: Template = {
    id: 'fintech-template',
    name: 'FinTech Resume Template',
    description: 'Formal layout suited to banking and finance roles.',
  };

  it('returns true for an empty query', () => {
    expect(matchesTemplateQuery(template, '')).toBe(true);
    expect(matchesTemplateQuery(template, '   ')).toBe(true);
  });

  it('matches by name, description, and id case-insensitively', () => {
    expect(matchesTemplateQuery(template, 'fintech')).toBe(true);
    expect(matchesTemplateQuery(template, 'BANKING')).toBe(true);
    expect(matchesTemplateQuery(template, 'template')).toBe(true);
  });

  it('returns false when no field matches', () => {
    expect(matchesTemplateQuery(template, 'healthcare')).toBe(false);
  });
});
