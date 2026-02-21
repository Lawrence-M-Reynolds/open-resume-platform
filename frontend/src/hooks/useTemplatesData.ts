import { useQuery } from '@tanstack/react-query';
import { listTemplates } from '../api/templates';
import { queryKeys } from '../query/keys';

export function useTemplatesData() {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: listTemplates,
  });
}
