export const queryKeys = {
  templates: ['templates'] as const,
  resumes: ['resumes'] as const,
  resumeDetail: (id: string) => [...queryKeys.resumes, id] as const,
  resumeSections: (id: string) => [...queryKeys.resumes, id, 'sections'] as const,
  sectionHistory: (resumeId: string, sectionId: string) =>
    [...queryKeys.resumes, resumeId, 'sections', sectionId, 'history'] as const,
  resumeVersions: (id: string) => [...queryKeys.resumes, id, 'versions'] as const,
  resumeDocuments: (id: string) => [...queryKeys.resumes, id, 'documents'] as const,
};
