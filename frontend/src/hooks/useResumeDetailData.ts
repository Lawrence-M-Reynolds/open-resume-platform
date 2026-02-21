import { useQuery } from '@tanstack/react-query';
import { listTemplates } from '../api/templates';
import { getResume, listDocuments, listVersions } from '../api/resumes';
import { queryKeys } from '../query/keys';

export function useResumeDetailData(resumeId?: string) {
  const enabled = resumeId != null && resumeId !== '';

  const resumeQuery = useQuery({
    queryKey: queryKeys.resumeDetail(resumeId ?? ''),
    queryFn: async () => {
      const id = resumeId;
      if (!id) throw new Error('Missing resume id');
      return getResume(id);
    },
    enabled,
  });

  const versionsQuery = useQuery({
    queryKey: queryKeys.resumeVersions(resumeId ?? ''),
    queryFn: async () => {
      const id = resumeId;
      if (!id) return [];
      return listVersions(id);
    },
    enabled,
  });

  const documentsQuery = useQuery({
    queryKey: queryKeys.resumeDocuments(resumeId ?? ''),
    queryFn: async () => {
      const id = resumeId;
      if (!id) return [];
      return listDocuments(id);
    },
    enabled,
  });

  const templatesQuery = useQuery({
    queryKey: queryKeys.templates,
    queryFn: listTemplates,
    staleTime: 5 * 60_000,
  });

  return {
    resumeQuery,
    versionsQuery,
    documentsQuery,
    templatesQuery,
  };
}
