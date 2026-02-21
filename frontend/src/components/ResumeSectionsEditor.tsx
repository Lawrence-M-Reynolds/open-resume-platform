import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { ResumeSection, UpdateSectionPayload } from '../types/api';
import { STARTER_SECTIONS } from '../constants/resume';
import {
  useCreateSectionMutation,
  useDeleteSectionMutation,
  useReorderSectionsMutation,
  useRestoreSectionVersionMutation,
  useUpdateSectionMutation,
} from '../hooks/useResumeSectionMutations';
import { useResumeSectionsData, useSectionHistoryData } from '../hooks/useResumeSectionsData';
import { useToast } from './ToastProvider';
import { getErrorMessage } from '../utils/error';
import { formatDate } from '../utils/date';
import Button from './Button';
import Card from './Card';
import ErrorBanner from './ErrorBanner';

interface ResumeSectionsEditorProps {
  resumeId: string;
}

type MoveDirection = 'up' | 'down';

const inputClass =
  'w-full rounded border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

interface SectionItemProps {
  resumeId: string;
  section: ResumeSection;
  isFirst: boolean;
  isLast: boolean;
  isReordering: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  restoringVersionId: string | null;
  onMove: (sectionId: string, direction: MoveDirection) => Promise<void>;
  onSave: (sectionId: string, payload: UpdateSectionPayload) => Promise<void>;
  onDelete: (section: ResumeSection) => Promise<void>;
  onRestore: (sectionId: string, versionId: string) => Promise<void>;
}

function SectionItem({
  resumeId,
  section,
  isFirst,
  isLast,
  isReordering,
  isUpdating,
  isDeleting,
  restoringVersionId,
  onMove,
  onSave,
  onDelete,
  onRestore,
}: SectionItemProps) {
  const toast = useToast();
  const initialTitle = section.title ?? '';
  const initialMarkdown = section.markdown ?? '';
  const [title, setTitle] = useState(initialTitle);
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [showHistory, setShowHistory] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(initialTitle);
    setMarkdown(initialMarkdown);
  }, [section.id, initialTitle, initialMarkdown]);

  const historyQuery = useSectionHistoryData(resumeId, section.id, showHistory);
  const history = historyQuery.data ?? [];

  const titleTrimmed = title.trim();
  const isDirty = title !== initialTitle || markdown !== initialMarkdown;
  const canSave = titleTrimmed.length > 0 && isDirty;
  const busy = isUpdating || isDeleting || isReordering || restoringVersionId != null;

  const handleSave = async () => {
    if (!canSave || busy) return;
    setItemError(null);
    try {
      await onSave(section.id, { title: titleTrimmed, markdown });
      toast.success({
        title: 'Section updated',
        description: `"${titleTrimmed}" was saved.`,
      });
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setItemError(message);
      toast.error({
        title: "Couldn't save section",
        description: message,
      });
    }
  };

  const handleDelete = async () => {
    if (busy) return;
    const confirmed = window.confirm(
      `Delete section "${initialTitle || 'Untitled section'}"? Its version history will no longer be editable from this resume.`
    );
    if (!confirmed) return;
    setItemError(null);
    try {
      await onDelete(section);
      toast.success({
        title: 'Section deleted',
        description: `"${initialTitle || 'Untitled section'}" was removed.`,
      });
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setItemError(message);
      toast.error({
        title: "Couldn't delete section",
        description: message,
      });
    }
  };

  const handleRestore = async (versionId: string, versionNo: number) => {
    if (busy || restoringVersionId != null) return;
    setItemError(null);
    try {
      await onRestore(section.id, versionId);
      toast.success({
        title: 'Section restored',
        description: `Restored to version ${versionNo}.`,
      });
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setItemError(message);
      toast.error({
        title: "Couldn't restore section",
        description: message,
      });
    }
  };

  return (
    <li className="rounded border border-gray-200 p-4 space-y-3 bg-white">
      {itemError && <ErrorBanner message={itemError} compact />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Section {section.order}
          </p>
          <p className="text-xs text-muted mt-1">
            Updated {formatDate(section.updatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => onMove(section.id, 'up')}
            disabled={isFirst || busy}
          >
            Move up
          </Button>
          <Button
            variant="secondary"
            onClick={() => onMove(section.id, 'down')}
            disabled={isLast || busy}
          >
            Move down
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={busy}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>

      <div>
        <label htmlFor={`section-title-${section.id}`} className={labelClass}>
          Title *
        </label>
        <input
          id={`section-title-${section.id}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="e.g. Experience"
          disabled={busy}
        />
      </div>

      <div>
        <label htmlFor={`section-markdown-${section.id}`} className={labelClass}>
          Content (Markdown)
        </label>
        <textarea
          id={`section-markdown-${section.id}`}
          rows={8}
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className={`${inputClass} font-mono sm:text-sm`}
          placeholder="Section markdown content..."
          disabled={busy}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!canSave || busy}
        >
          {isUpdating ? 'Saving…' : 'Save section'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowHistory((current) => !current)}
          disabled={isDeleting}
        >
          {showHistory ? 'Hide history' : 'Show history'}
        </Button>
      </div>

      {showHistory && (
        <div className="rounded border border-gray-200 bg-gray-50 p-3">
          <h4 className="text-sm font-medium text-gray-800">Version history</h4>
          {historyQuery.isPending ? (
            <p className="text-sm text-muted mt-2">Loading history…</p>
          ) : historyQuery.isError ? (
            <div className="mt-2">
              <ErrorBanner message={getErrorMessage(historyQuery.error)} compact />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted mt-2">No history entries yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {history.map((version) => (
                <li
                  key={version.id}
                  className="rounded border border-gray-200 bg-white p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      Version {version.versionNo}
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => handleRestore(version.id, version.versionNo)}
                      disabled={busy || restoringVersionId != null}
                    >
                      {restoringVersionId === version.id
                        ? 'Restoring…'
                        : 'Restore'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Saved {formatDate(version.createdAt)}
                  </p>
                  <pre className="mt-2 rounded border border-gray-200 bg-gray-50 p-2 text-xs font-mono whitespace-pre-wrap break-words">
                    {version.markdown || '—'}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

export default function ResumeSectionsEditor({ resumeId }: ResumeSectionsEditorProps) {
  const toast = useToast();
  const sectionsQuery = useResumeSectionsData(resumeId);
  const createSectionMutation = useCreateSectionMutation(resumeId);
  const updateSectionMutation = useUpdateSectionMutation(resumeId);
  const deleteSectionMutation = useDeleteSectionMutation(resumeId);
  const reorderSectionsMutation = useReorderSectionsMutation(resumeId);
  const restoreSectionVersionMutation = useRestoreSectionVersionMutation(resumeId);

  const [newTitle, setNewTitle] = useState('');
  const [newMarkdown, setNewMarkdown] = useState('');
  const [newOrder, setNewOrder] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [creatingStarterSections, setCreatingStarterSections] = useState(false);

  const sections = useMemo(
    () =>
      [...(sectionsQuery.data ?? [])].sort(
        (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
      ),
    [sectionsQuery.data]
  );

  const updatingSectionId =
    updateSectionMutation.isPending && updateSectionMutation.variables
      ? updateSectionMutation.variables.sectionId
      : null;
  const deletingSectionId =
    deleteSectionMutation.isPending && deleteSectionMutation.variables
      ? deleteSectionMutation.variables
      : null;
  const restoringSectionId =
    restoreSectionVersionMutation.isPending && restoreSectionVersionMutation.variables
      ? restoreSectionVersionMutation.variables.sectionId
      : null;
  const restoringVersionId =
    restoreSectionVersionMutation.isPending && restoreSectionVersionMutation.variables
      ? restoreSectionVersionMutation.variables.versionId
      : null;

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (createSectionMutation.isPending) return;

    const title = newTitle.trim();
    if (title.length === 0) {
      setCreateError('Section title is required');
      return;
    }

    setCreateError(null);
    try {
      const payload: {
        title: string;
        markdown: string;
        order?: number;
      } = {
        title,
        markdown: newMarkdown,
      };

      const parsedOrder = Number(newOrder);
      if (
        newOrder.trim() !== '' &&
        Number.isInteger(parsedOrder) &&
        parsedOrder > 0
      ) {
        payload.order = parsedOrder;
      }

      await createSectionMutation.mutateAsync(payload);
      setNewTitle('');
      setNewMarkdown('');
      setNewOrder('');
      toast.success({
        title: 'Section created',
        description: `"${title}" was added.`,
      });
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setCreateError(message);
      toast.error({
        title: "Couldn't create section",
        description: message,
      });
    }
  };

  const handleInsertStarterSections = async (): Promise<void> => {
    if (createSectionMutation.isPending || creatingStarterSections) return;
    if (sections.length > 0) {
      const confirmed = window.confirm('Append starter sections after existing sections?');
      if (!confirmed) return;
    }

    setCreateError(null);
    setCreatingStarterSections(true);
    try {
      for (let i = 0; i < STARTER_SECTIONS.length; i += 1) {
        const starterSection = STARTER_SECTIONS[i];
        await createSectionMutation.mutateAsync({
          title: starterSection.title,
          markdown: starterSection.markdown,
          order: sections.length + i + 1,
        });
      }
      toast.success({
        title: 'Starter sections inserted',
        description: 'You can edit or reorder them as needed.',
      });
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setCreateError(message);
      toast.error({
        title: "Couldn't insert starter sections",
        description: message,
      });
    } finally {
      setCreatingStarterSections(false);
    }
  };

  const handleMove = async (sectionId: string, direction: MoveDirection) => {
    if (reorderSectionsMutation.isPending) return;
    const index = sections.findIndex((item) => item.id === sectionId);
    if (index === -1) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;

    const reordered = [...sections];
    const [section] = reordered.splice(index, 1);
    reordered.splice(target, 0, section);

    const sectionIds = reordered.map((item) => item.id);
    setReorderError(null);
    try {
      await reorderSectionsMutation.mutateAsync(sectionIds);
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setReorderError(message);
      toast.error({
        title: "Couldn't reorder sections",
        description: message,
      });
    }
  };

  const handleSave = async (
    sectionId: string,
    payload: UpdateSectionPayload
  ): Promise<void> => {
    await updateSectionMutation.mutateAsync({ sectionId, payload });
  };

  const handleDelete = async (section: ResumeSection): Promise<void> => {
    await deleteSectionMutation.mutateAsync(section.id);
  };

  const handleRestore = async (
    sectionId: string,
    versionId: string
  ): Promise<void> => {
    await restoreSectionVersionMutation.mutateAsync({ sectionId, versionId });
  };

  return (
    <Card className="p-5 sm:p-6 space-y-4 max-w-3xl mt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
          <p className="text-sm text-muted mt-1">
            Ordered sections are now the source used for DOCX generation and new
            version snapshots. If no sections exist, fallback markdown is used.
          </p>
          <p className="text-xs text-muted mt-1">
            Section changes are saved with each section&apos;s
            &quot;Save section&quot; action.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleInsertStarterSections}
          disabled={createSectionMutation.isPending || creatingStarterSections}
        >
          {creatingStarterSections ? 'Inserting…' : 'Insert starter sections'}
        </Button>
      </div>

      {sectionsQuery.isError && (
        <ErrorBanner message={getErrorMessage(sectionsQuery.error)} compact />
      )}

      <form onSubmit={handleCreate} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="new-section-title" className={labelClass}>
              New section title *
            </label>
            <input
              id="new-section-title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={inputClass}
              placeholder="e.g. Profile"
              disabled={createSectionMutation.isPending}
            />
          </div>
          <div>
            <label htmlFor="new-section-order" className={labelClass}>
              Optional order
            </label>
            <input
              id="new-section-order"
              type="number"
              min={1}
              step={1}
              value={newOrder}
              onChange={(e) => setNewOrder(e.target.value)}
              className={inputClass}
              placeholder="Append"
              disabled={createSectionMutation.isPending}
            />
          </div>
        </div>
        <div>
          <label htmlFor="new-section-markdown" className={labelClass}>
            New section markdown
          </label>
          <textarea
            id="new-section-markdown"
            rows={6}
            value={newMarkdown}
            onChange={(e) => setNewMarkdown(e.target.value)}
            className={`${inputClass} font-mono sm:text-sm`}
            placeholder="Write markdown for this section..."
            disabled={createSectionMutation.isPending}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            variant="primary"
            disabled={createSectionMutation.isPending}
          >
            {createSectionMutation.isPending ? 'Adding…' : 'Add section'}
          </Button>
        </div>
      </form>

      {createError && <ErrorBanner message={createError} compact />}
      {reorderError && <ErrorBanner message={reorderError} compact />}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Ordered sections
        </h3>
        {sectionsQuery.isPending ? (
          <p className="text-sm text-muted">Loading sections…</p>
        ) : sections.length === 0 ? (
          <p className="text-sm text-muted">
            No sections yet. Add one above to start structured editing.
          </p>
        ) : (
          <ul className="space-y-3">
            {sections.map((section, index) => (
              <SectionItem
                key={section.id}
                resumeId={resumeId}
                section={section}
                isFirst={index === 0}
                isLast={index === sections.length - 1}
                isReordering={reorderSectionsMutation.isPending}
                isUpdating={updatingSectionId === section.id}
                isDeleting={deletingSectionId === section.id}
                restoringVersionId={
                  restoringSectionId === section.id ? restoringVersionId : null
                }
                onMove={handleMove}
                onSave={handleSave}
                onDelete={handleDelete}
                onRestore={handleRestore}
              />
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
