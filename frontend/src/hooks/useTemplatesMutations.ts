import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTemplate, fetchTemplateBlob } from '../api/templates';
import { queryKeys } from '../query/keys';
import type { Template } from '../types/api';

interface CreateTemplateInput {
  name: string;
  description?: string;
}

function upsertTemplateList(
  current: Template[] | undefined,
  template: Template
): Template[] {
  if (!current) return [template];

  const index = current.findIndex((item) => item.id === template.id);
  if (index === -1) return [template, ...current];

  const next = [...current];
  next[index] = template;
  return next;
}

export function useCreateTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTemplateInput) => createTemplate(payload),
    onSuccess: (createdTemplate) => {
      queryClient.setQueryData(
        queryKeys.templates,
        (current: Template[] | undefined) =>
          upsertTemplateList(current, createdTemplate)
      );

      void queryClient.invalidateQueries({
        queryKey: queryKeys.templates,
        refetchType: 'active',
      });
    },
  });
}

export function useDownloadTemplateMutation() {
  return useMutation({
    mutationFn: (templateId: string) => fetchTemplateBlob(templateId),
  });
}
