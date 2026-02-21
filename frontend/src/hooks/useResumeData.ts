import { useQuery } from '@tanstack/react-query';
import { getResume } from '../api/resumes';
import { queryKeys } from '../query/keys';

export function useResumeData(resumeId?: string) {
  const enabled = resumeId != null && resumeId !== '';

  return useQuery({
    queryKey: queryKeys.resumeDetail(resumeId ?? ''),
    queryFn: async () => {
      const id = resumeId;
      if (!id) throw new Error('Missing resume id');
      return getResume(id);
    },
    enabled,
  });
}
