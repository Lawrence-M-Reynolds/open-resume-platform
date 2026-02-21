import { useQuery } from '@tanstack/react-query';
import { listResumes } from '../api/resumes';
import { queryKeys } from '../query/keys';

export function useResumesData() {
  return useQuery({
    queryKey: queryKeys.resumes,
    queryFn: listResumes,
  });
}
