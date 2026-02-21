export const MIN_TITLE_LENGTH = 3;

export interface StarterSectionTemplate {
  title: string;
  markdown: string;
}

export const STARTER_SECTIONS: StarterSectionTemplate[] = [
  {
    title: 'Summary',
    markdown: 'Write a 2-3 sentence overview focused on role fit.',
  },
  {
    title: 'Experience',
    markdown: [
      '### Company Name - Role Title (2021-Present)',
      '- Delivered measurable impact with clear outcomes.',
    ].join('\n'),
  },
  {
    title: 'Skills',
    markdown: ['- Skill 1', '- Skill 2'].join('\n'),
  },
  {
    title: 'Education',
    markdown: '### School Name - Degree',
  },
];

export const STARTER_MARKDOWN = STARTER_SECTIONS.map(
  (section) => `# ${section.title}\n${section.markdown}`
).join('\n\n');

export const INITIAL_RESUME_MARKDOWN = [
  '## Draft',
  '',
  'Add sections in the next step to build this resume.',
].join('\n');
