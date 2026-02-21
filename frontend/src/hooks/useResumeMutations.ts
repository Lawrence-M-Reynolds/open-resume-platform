import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createResume, updateResume } from '../api/resumes';
import { queryKeys } from '../query/keys';
import type { ResumePayload } from '../types/api';

export function useCreateResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResumePayload) => createResume(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.resumes });
    },
  });
}

export function useUpdateResumeMutation(resumeId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResumePayload) => {
      if (!resumeId) throw new Error('Missing resume id');
      return updateResume(resumeId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.resumes });
      if (!resumeId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.resumeDetail(resumeId),
      });
    },
  });
}
