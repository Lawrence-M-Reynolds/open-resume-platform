import type { ChangeEvent } from 'react';
import { STARTER_SECTIONS } from '../constants/resume';
import Button from './Button';
import Card from './Card';
import ErrorBanner from './ErrorBanner';

export interface DraftResumeSection {
  id: string;
  title: string;
  markdown: string;
}

interface ResumeSectionsDraftEditorProps {
  sections: DraftResumeSection[];
  onChange: (sections: DraftResumeSection[]) => void;
  disabled?: boolean;
  error?: string | null;
  starterButtonLabel?: string;
}

const inputClass =
  'w-full rounded border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

function nextDraftSectionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `draft-section-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ResumeSectionsDraftEditor({
  sections,
  onChange,
  disabled = false,
  error = null,
  starterButtonLabel = 'Insert starter sections',
}: ResumeSectionsDraftEditorProps) {
  const addSection = () => {
    if (disabled) return;
    onChange([
      ...sections,
      {
        id: nextDraftSectionId(),
        title: '',
        markdown: '',
      },
    ]);
  };

  const updateSection = (
    sectionId: string,
    field: 'title' | 'markdown',
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (disabled) return;
    const value = event.target.value;
    onChange(
      sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );
  };

  const removeSection = (sectionId: string) => {
    if (disabled) return;
    onChange(sections.filter((section) => section.id !== sectionId));
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (disabled) return;
    const index = sections.findIndex((section) => section.id === sectionId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const next = [...sections];
    const [section] = next.splice(index, 1);
    next.splice(targetIndex, 0, section);
    onChange(next);
  };

  const insertStarterSections = () => {
    if (disabled) return;
    if (sections.length > 0) {
      const confirmed = window.confirm(
        'Replace current sections with starter sections?'
      );
      if (!confirmed) return;
    }

    onChange(
      STARTER_SECTIONS.map((section) => ({
        id: nextDraftSectionId(),
        title: section.title,
        markdown: section.markdown,
      }))
    );
  };

  return (
    <Card className="p-5 sm:p-6 space-y-4 max-w-3xl mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
          <p className="text-sm text-muted mt-1">
            Add multiple sections and reorder them. This order is used for DOCX
            generation and snapshots.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={insertStarterSections}
            disabled={disabled}
          >
            {starterButtonLabel}
          </Button>
          <Button variant="secondary" onClick={addSection} disabled={disabled}>
            Add section
          </Button>
        </div>
      </div>

      {error && <ErrorBanner message={error} compact />}

      {sections.length === 0 ? (
        <p className="text-sm text-muted">
          No sections yet. Add your first section to start a structured resume.
        </p>
      ) : (
        <ul className="space-y-3">
          {sections.map((section, index) => (
            <li key={section.id} className="rounded border border-gray-200 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Section {index + 1}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => moveSection(section.id, 'up')}
                    disabled={disabled || index === 0}
                  >
                    Move up
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => moveSection(section.id, 'down')}
                    disabled={disabled || index === sections.length - 1}
                  >
                    Move down
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => removeSection(section.id)}
                    disabled={disabled}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div>
                <label htmlFor={`new-section-title-${section.id}`} className={labelClass}>
                  Section title *
                </label>
                <input
                  id={`new-section-title-${section.id}`}
                  type="text"
                  value={section.title}
                  onChange={(event) => updateSection(section.id, 'title', event)}
                  className={inputClass}
                  placeholder="e.g. Profile, Experience, Education"
                  disabled={disabled}
                />
              </div>

              <div>
                <label htmlFor={`new-section-markdown-${section.id}`} className={labelClass}>
                  Section content (Markdown)
                </label>
                <textarea
                  id={`new-section-markdown-${section.id}`}
                  value={section.markdown}
                  onChange={(event) => updateSection(section.id, 'markdown', event)}
                  rows={6}
                  className={`${inputClass} font-mono sm:text-sm`}
                  placeholder="Write markdown content for this section..."
                  disabled={disabled}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
