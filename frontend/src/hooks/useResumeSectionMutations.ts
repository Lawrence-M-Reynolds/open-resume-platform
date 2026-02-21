import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createSection,
  deleteSection,
  reorderSections,
  restoreSectionVersion,
  updateSection,
} from '../api/resumes';
import { queryKeys } from '../query/keys';
import type {
  CreateSectionPayload,
  ResumeSection,
  UpdateSectionPayload,
} from '../types/api';

function sortByOrder(sections: ResumeSection[]): ResumeSection[] {
  return [...sections].sort(
    (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
  );
}

function upsertSectionList(
  current: ResumeSection[] | undefined,
  section: ResumeSection
): ResumeSection[] {
  if (!current) return [section];

  const index = current.findIndex((item) => item.id === section.id);
  if (index === -1) return sortByOrder([...current, section]);

  const next = [...current];
  next[index] = section;
  return sortByOrder(next);
}

export function useCreateSectionMutation(resumeId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSectionPayload) => {
      if (!resumeId) throw new Error('Missing resume id');
      return createSection(resumeId, payload);
    },
    onMutate: async (payload) => {
      if (!resumeId) return { previousSections: undefined, tempSectionId: '' };
      const key = queryKeys.resumeSections(resumeId);
      const previousSections = queryClient.getQueryData<ResumeSection[]>(key);
      const tempSectionId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const nowIso = new Date().toISOString();
      const nextOrder =
        payload.order ??
        ((previousSections ?? []).reduce((max, section) => {
          const order = section.order ?? 0;
          return order > max ? order : max;
        }, 0) + 1);

      const optimisticSection: ResumeSection = {
        id: tempSectionId,
        resumeId,
        title: payload.title,
        markdown: payload.markdown,
        order: nextOrder,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      queryClient.setQueryData(
        key,
        (current: ResumeSection[] | undefined) =>
          upsertSectionList(current, optimisticSection)
      );

      return { previousSections, tempSectionId };
    },
    onError: (_error, _payload, context) => {
      if (!resumeId) return;
      if (!context?.previousSections) return;
      queryClient.setQueryData(
        queryKeys.resumeSections(resumeId),
        context.previousSections
      );
    },
    onSuccess: (createdSection, payload, context) => {
      if (!resumeId) return;
      const nowIso = new Date().toISOString();
      const mergedSection: ResumeSection = {
        id: createdSection.id || context?.tempSectionId || `temp-${nowIso}`,
        resumeId: createdSection.resumeId || resumeId,
        title:
          createdSection.title && createdSection.title.trim() !== ''
            ? createdSection.title
            : payload.title,
        markdown:
          createdSection.markdown != null ? createdSection.markdown : payload.markdown,
        order:
          typeof createdSection.order === 'number' && createdSection.order > 0
            ? createdSection.order
            : payload.order ?? 1,
        createdAt: createdSection.createdAt || nowIso,
        updatedAt: createdSection.updatedAt || nowIso,
      };

      queryClient.setQueryData(
        queryKeys.resumeSections(resumeId),
        (current: ResumeSection[] | undefined) => {
          const withoutTemp = (current ?? []).filter(
            (section) => section.id !== context?.tempSectionId
          );
          return upsertSectionList(withoutTemp, mergedSection);
        }
      );
    },
  });
}

export function useUpdateSectionMutation(resumeId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sectionId,
      payload,
    }: {
      sectionId: string;
      payload: UpdateSectionPayload;
    }) => {
      if (!resumeId) throw new Error('Missing resume id');
      return updateSection(resumeId, sectionId, payload);
    },
    onSuccess: (updatedSection, variables) => {
      if (!resumeId) return;
      const nowIso = new Date().toISOString();
      const mergedSection: ResumeSection = {
        id: updatedSection.id || variables.sectionId,
        resumeId: updatedSection.resumeId || resumeId,
        title:
          updatedSection.title && updatedSection.title.trim() !== ''
            ? updatedSection.title
            : variables.payload.title,
        markdown:
          updatedSection.markdown != null
            ? updatedSection.markdown
            : variables.payload.markdown,
        order:
          typeof updatedSection.order === 'number' && updatedSection.order > 0
            ? updatedSection.order
            : 1,
        createdAt: updatedSection.createdAt || nowIso,
        updatedAt: updatedSection.updatedAt || nowIso,
      };
      queryClient.setQueryData(
        queryKeys.resumeSections(resumeId),
        (current: ResumeSection[] | undefined) =>
          upsertSectionList(current, mergedSection)
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sectionHistory(resumeId, mergedSection.id),
        refetchType: 'active',
      });
    },
  });
}

export function useDeleteSectionMutation(resumeId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sectionId: string) => {
      if (!resumeId) throw new Error('Missing resume id');
      await deleteSection(resumeId, sectionId);
      return sectionId;
    },
    onSuccess: (deletedSectionId) => {
      if (!resumeId) return;
      queryClient.setQueryData(
        queryKeys.resumeSections(resumeId),
        (current: ResumeSection[] | undefined) =>
          current?.filter((item) => item.id !== deletedSectionId) ?? []
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sectionHistory(resumeId, deletedSectionId),
        refetchType: 'active',
      });
    },
  });
}

export function useReorderSectionsMutation(resumeId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sectionIds: string[]) => {
      if (!resumeId) throw new Error('Missing resume id');
      await reorderSections(resumeId, { sectionIds });
      return sectionIds;
    },
    onMutate: async (sectionIds) => {
      if (!resumeId) return { previousSections: undefined };
      const key = queryKeys.resumeSections(resumeId);
      const previousSections = queryClient.getQueryData<ResumeSection[]>(key);

      if (previousSections) {
        const orderMap = new Map(sectionIds.map((id, index) => [id, index + 1]));
        const reordered = previousSections.map((section) =>
          orderMap.has(section.id)
            ? { ...section, order: orderMap.get(section.id) ?? section.order }
            : section
        );
        queryClient.setQueryData(key, sortByOrder(reordered));
      }

      return { previousSections };
    },
    onError: (_error, _sectionIds, context) => {
      if (!resumeId) return;
      if (!context?.previousSections) return;
      queryClient.setQueryData(
        queryKeys.resumeSections(resumeId),
        context.previousSections
      );
    },
    onSettled: () => {
      if (!resumeId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.resumeSections(resumeId),
        refetchType: 'none',
      });
    },
  });
}

export function useRestoreSectionVersionMutation(resumeId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sectionId,
      versionId,
    }: {
      sectionId: string;
      versionId: string;
    }) => {
      if (!resumeId) throw new Error('Missing resume id');
      return restoreSectionVersion(resumeId, sectionId, versionId);
    },
    onSuccess: (restoredSection) => {
      if (!resumeId) return;
      queryClient.setQueryData(
        queryKeys.resumeSections(resumeId),
        (current: ResumeSection[] | undefined) =>
          upsertSectionList(current, restoredSection)
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sectionHistory(resumeId, restoredSection.id),
        refetchType: 'active',
      });
    },
  });
}
