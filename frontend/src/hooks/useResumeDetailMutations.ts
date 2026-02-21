import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVersion, generateDocx } from '../api/resumes';
import type {
  CreateVersionPayload,
  GenerateDocxOptions,
  ResumeVersion,
} from '../types/api';
import { queryKeys } from '../query/keys';

export function useCreateResumeVersionMutation(resumeId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateVersionPayload) => {
      if (!resumeId) throw new Error('Missing resume id');
      return createVersion(resumeId, payload);
    },
    onSuccess: (createdVersion) => {
      if (!resumeId) return;

      queryClient.setQueryData(
        queryKeys.resumeVersions(resumeId),
        (current: ResumeVersion[] | undefined) => {
          if (!current) return [createdVersion];
          const exists = current.some((item) => item.id === createdVersion.id);
          if (exists) {
            return current.map((item) =>
              item.id === createdVersion.id ? createdVersion : item
            );
          }
          return [createdVersion, ...current];
        }
      );

      void queryClient.invalidateQueries({
        queryKey: queryKeys.resumeVersions(resumeId),
        refetchType: 'active',
      });
    },
  });
}

export function useGenerateResumeDocxMutation(resumeId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: GenerateDocxOptions) => {
      if (!resumeId) throw new Error('Missing resume id');
      return generateDocx(resumeId, options);
    },
    onSuccess: () => {
      if (!resumeId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.resumeDocuments(resumeId),
        refetchType: 'active',
      });
    },
  });
}
