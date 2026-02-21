export const APP_PATHS = {
  home: '/',
  templates: '/templates',
  resumeNew: '/resumes/new',
  resumeDetailPattern: '/resumes/:id',
  resumeEditPattern: '/resumes/:id/edit',
} as const;

export function resumeDetailPath(id: string): string {
  return `/resumes/${encodeURIComponent(id)}`;
}

export function resumeEditPath(id: string): string {
  return `${resumeDetailPath(id)}/edit`;
}
