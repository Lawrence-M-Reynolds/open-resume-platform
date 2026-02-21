interface MarkdownSection {
  title: string;
  markdown: string;
}

export function assembleSectionsMarkdown(
  sections: MarkdownSection[]
): string {
  return sections
    .map((section) => {
      const title = section.title.trim();
      const body = section.markdown.trim();
      if (title === '') return body;
      if (body === '') return `## ${title}`;
      return `## ${title}\n\n${body}`;
    })
    .join('\n\n');
}
