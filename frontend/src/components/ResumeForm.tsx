import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { ResumeFormValues, ResumePayload } from '../types/api';
import { MIN_TITLE_LENGTH, STARTER_MARKDOWN } from '../constants/resume';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';
import Button from './Button';
import Card from './Card';
import ErrorBanner from './ErrorBanner';

const inputClass =
  'w-full rounded border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

interface ResumeFormProps {
  initialValues: ResumeFormValues;
  onSubmit: (values: ResumePayload) => Promise<void>;
  submitLabel: string;
  submitLoadingLabel: string;
  cancelTo: string;
  cancelLabel?: string;
  error?: string | null;
  loading?: boolean;
  statusMessage?: string | null;
  showMarkdownStarter?: boolean;
  warnOnUnsavedChanges?: boolean;
  unsavedChangesMessage?: string;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function ResumeForm({
  initialValues,
  onSubmit,
  submitLabel,
  submitLoadingLabel,
  cancelTo,
  cancelLabel = 'Cancel',
  error = null,
  loading = false,
  statusMessage = null,
  showMarkdownStarter = false,
  warnOnUnsavedChanges = false,
  unsavedChangesMessage,
  onDirtyChange,
}: ResumeFormProps) {
  const [title, setTitle] = useState(initialValues.title ?? '');
  const [targetRole, setTargetRole] = useState(initialValues.targetRole ?? '');
  const [targetCompany, setTargetCompany] = useState(initialValues.targetCompany ?? '');
  const [templateId, setTemplateId] = useState(initialValues.templateId ?? '');
  const [markdown, setMarkdown] = useState(initialValues.markdown ?? '');

  useEffect(() => {
    setTitle(initialValues.title ?? '');
    setTargetRole(initialValues.targetRole ?? '');
    setTargetCompany(initialValues.targetCompany ?? '');
    setTemplateId(initialValues.templateId ?? '');
    setMarkdown(initialValues.markdown ?? '');
  }, [
    initialValues.title,
    initialValues.targetRole,
    initialValues.targetCompany,
    initialValues.templateId,
    initialValues.markdown,
  ]);

  const titleTrimmed = title.trim();
  const markdownTrimmed = markdown.trim();
  const titleValid = titleTrimmed.length >= MIN_TITLE_LENGTH;
  const markdownValid = markdownTrimmed.length > 0;
  const valid = titleValid && markdownValid;
  const isDirty =
    title !== (initialValues.title ?? '') ||
    targetRole !== (initialValues.targetRole ?? '') ||
    targetCompany !== (initialValues.targetCompany ?? '') ||
    templateId !== (initialValues.templateId ?? '') ||
    markdown !== (initialValues.markdown ?? '');

  useUnsavedChangesWarning(
    warnOnUnsavedChanges && isDirty && !loading,
    unsavedChangesMessage
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid || loading) return;
    await onSubmit({
      title: titleTrimmed,
      targetRole: targetRole.trim() || null,
      targetCompany: targetCompany.trim() || null,
      templateId: templateId.trim() || null,
      markdown: markdownTrimmed,
    });
  };

  const handleInsertStarterMarkdown = () => {
    if (loading) return;
    setMarkdown(STARTER_MARKDOWN);
  };

  return (
    <Card className="p-5 sm:p-6 space-y-4 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {loading ? submitLoadingLabel : ""}
        </p>
        {error && <ErrorBanner message={error} compact />}

        <div>
          <label htmlFor="resume-form-title" className={labelClass}>
            Title *
          </label>
          <p className="text-xs text-muted mb-2">
            Required. Use a short internal name so this resume is easy to find.
          </p>
          <input
            id="resume-form-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="e.g. Senior Developer"
            required
          />
          {title.length > 0 && !titleValid && (
            <p className="text-error text-sm mt-1">
              Title must be at least {MIN_TITLE_LENGTH} characters
            </p>
          )}
        </div>

        <div>
          <label htmlFor="resume-form-targetRole" className={labelClass}>
            Target role
          </label>
          <p className="text-xs text-muted mb-2">
            Optional. Helps tailor language for a specific position.
          </p>
          <input
            id="resume-form-targetRole"
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className={inputClass}
            placeholder="e.g. Senior Software Engineer"
          />
        </div>

        <div>
          <label htmlFor="resume-form-targetCompany" className={labelClass}>
            Target company
          </label>
          <p className="text-xs text-muted mb-2">
            Optional. Add the company to personalize this version.
          </p>
          <input
            id="resume-form-targetCompany"
            type="text"
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            className={inputClass}
            placeholder="e.g. Acme Inc"
          />
        </div>

        <div>
          <label htmlFor="resume-form-templateId" className={labelClass}>
            Template ID
          </label>
          <p className="text-xs text-muted mb-2">
            Optional. Leave blank to choose a template later before generation.
          </p>
          <input
            id="resume-form-templateId"
            type="text"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className={inputClass}
            placeholder="default-template"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <label htmlFor="resume-form-markdown" className={labelClass}>
              Content (Markdown) *
            </label>
            {showMarkdownStarter && (
              <button
                type="button"
                onClick={handleInsertStarterMarkdown}
                className="text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200"
              >
                Insert starter markdown
              </button>
            )}
          </div>
          <p className="text-xs text-muted mb-2">
            Required. Use headings such as Summary, Experience, Skills, and
            Education.
          </p>
          <textarea
            id="resume-form-markdown"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={12}
            className={`${inputClass} font-mono sm:text-sm`}
            placeholder="# Your resume in Markdown..."
            required
          />
          {markdown.length > 0 && !markdownValid && (
            <p className="text-error text-sm mt-1">Content is required</p>
          )}
        </div>

        <div className="pt-2 space-y-2">
          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={!valid || loading}
              className="w-full sm:w-auto"
            >
              {loading ? submitLoadingLabel : submitLabel}
            </Button>
            <Button to={cancelTo} variant="secondary" className="w-full sm:w-auto">
              {cancelLabel}
            </Button>
          </div>
          {statusMessage && (
            <p
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="text-sm font-medium text-primary"
            >
              ✓ {statusMessage}
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
