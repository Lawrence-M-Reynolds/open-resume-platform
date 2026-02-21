import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createResume, updateResume } from '../api/resumes';
import { queryKeys } from '../query/keys';
import type { Resume, ResumePayload } from '../types/api';

function upsertResumeList(
  current: Resume[] | undefined,
  resume: Resume
): Resume[] {
  if (!current) return [resume];

  const index = current.findIndex((item) => item.id === resume.id);
  if (index === -1) return [resume, ...current];

  const next = [...current];
  next[index] = resume;
  return next;
}

export function useCreateResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResumePayload) => createResume(payload),
    onSuccess: (createdResume) => {
      queryClient.setQueryData(
        queryKeys.resumes,
        (current: Resume[] | undefined) =>
          upsertResumeList(current, createdResume)
      );
      queryClient.setQueryData(
        queryKeys.resumeDetail(createdResume.id),
        createdResume
      );

      void queryClient.invalidateQueries({
        queryKey: queryKeys.resumes,
        refetchType: 'active',
      });
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
    onSuccess: (updatedResume) => {
      queryClient.setQueryData(
        queryKeys.resumes,
        (current: Resume[] | undefined) =>
          upsertResumeList(current, updatedResume)
      );

      if (resumeId) {
        queryClient.setQueryData(
          queryKeys.resumeDetail(resumeId),
          updatedResume
        );
      }

      void queryClient.invalidateQueries({
        queryKey: queryKeys.resumes,
        refetchType: 'active',
      });

      if (!resumeId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.resumeDetail(resumeId),
        refetchType: 'active',
      });
    },
  });
}
