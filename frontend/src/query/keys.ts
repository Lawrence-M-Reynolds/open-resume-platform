export const queryKeys = {
  templates: ['templates'] as const,
  resumes: ['resumes'] as const,
  resumeDetail: (id: string) => [...queryKeys.resumes, id] as const,
  resumeVersions: (id: string) => [...queryKeys.resumes, id, 'versions'] as const,
  resumeDocuments: (id: string) => [...queryKeys.resumes, id, 'documents'] as const,
};
