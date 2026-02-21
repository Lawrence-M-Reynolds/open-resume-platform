import { useQuery } from '@tanstack/react-query';
import { listSectionHistory, listSections } from '../api/resumes';
import { queryKeys } from '../query/keys';

export function useResumeSectionsData(resumeId?: string) {
  const enabled = resumeId != null && resumeId !== '';

  return useQuery({
    queryKey: queryKeys.resumeSections(resumeId ?? ''),
    queryFn: async () => {
      const id = resumeId;
      if (!id) return [];
      return listSections(id);
    },
    enabled,
  });
}

export function useSectionHistoryData(
  resumeId?: string,
  sectionId?: string,
  isEnabled = true
) {
  const enabled =
    isEnabled &&
    resumeId != null &&
    resumeId !== '' &&
    sectionId != null &&
    sectionId !== '';

  return useQuery({
    queryKey: queryKeys.sectionHistory(resumeId ?? '', sectionId ?? ''),
    queryFn: async () => {
      const rid = resumeId;
      const sid = sectionId;
      if (!rid || !sid) return [];
      return listSectionHistory(rid, sid);
    },
    enabled,
  });
}
