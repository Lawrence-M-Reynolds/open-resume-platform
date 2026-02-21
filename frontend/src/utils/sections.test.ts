import { describe, expect, it } from 'vitest';
import { assembleSectionsMarkdown } from './sections';

describe('assembleSectionsMarkdown', () => {
  it('creates heading + body per section and joins them in order', () => {
    const markdown = assembleSectionsMarkdown([
      { title: 'Profile', markdown: 'Summary text' },
      { title: 'Experience', markdown: '- Built things' },
    ]);

    expect(markdown).toBe(
      '## Profile\n\nSummary text\n\n## Experience\n\n- Built things'
    );
  });

  it('uses only heading when a section body is blank', () => {
    const markdown = assembleSectionsMarkdown([
      { title: 'Skills', markdown: '   ' },
    ]);

    expect(markdown).toBe('## Skills');
  });

  it('uses only body when a section title is blank', () => {
    const markdown = assembleSectionsMarkdown([
      { title: '  ', markdown: 'Body only' },
    ]);

    expect(markdown).toBe('Body only');
  });

  it('trims title and markdown before assembly', () => {
    const markdown = assembleSectionsMarkdown([
      { title: '  Education ', markdown: ' Degree details  ' },
    ]);

    expect(markdown).toBe('## Education\n\nDegree details');
  });
});
