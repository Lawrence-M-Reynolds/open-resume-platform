import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTemplate, fetchTemplateBlob } from '../api/templates';
import { queryKeys } from '../query/keys';

interface CreateTemplateInput {
  name: string;
  description?: string;
}

export function useCreateTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTemplateInput) => createTemplate(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.templates });
    },
  });
}

export function useDownloadTemplateMutation() {
  return useMutation({
    mutationFn: (templateId: string) => fetchTemplateBlob(templateId),
  });
}
