import { useState, useEffect } from 'react';
import { MIN_TITLE_LENGTH } from '../constants/resume.js';
import Button from './Button.jsx';
import Card from './Card.jsx';
import ErrorBanner from './ErrorBanner.jsx';

const inputClass =
  'w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

/**
 * Form for creating or editing a resume (title, targetRole, targetCompany, templateId, markdown).
 * Validates title (min length) and markdown (required). Calls onSubmit with trimmed payload.
 * @param {{ title: string, targetRole: string, targetCompany: string, templateId: string, markdown: string }} initialValues
 * @param {(values: { title: string, targetRole: string | null, targetCompany: string | null, templateId: string | null, markdown: string }) => Promise<void>} onSubmit
 * @param {string} submitLabel
 * @param {string} submitLoadingLabel
 * @param {string} cancelTo
 * @param {string} [cancelLabel='Cancel']
 * @param {string} [error] - Optional error message to show above form
 * @param {boolean} [loading=false] - Submit in progress (disables submit, shows submitLoadingLabel)
 */
export default function ResumeForm({
  initialValues,
  onSubmit,
  submitLabel,
  submitLoadingLabel,
  cancelTo,
  cancelLabel = 'Cancel',
  error = null,
  loading = false,
}) {
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

  const handleSubmit = async (e) => {
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

  return (
    <Card className="p-6 space-y-4 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBanner message={error} compact />}

      <div>
        <label htmlFor="resume-form-title" className={labelClass}>
          Title *
        </label>
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
        <label htmlFor="resume-form-markdown" className={labelClass}>
          Content (Markdown) *
        </label>
        <textarea
          id="resume-form-markdown"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          rows={12}
          className={`${inputClass} font-mono text-sm`}
          placeholder="# Your resume in Markdown..."
          required
        />
        {markdown.length > 0 && !markdownValid && (
          <p className="text-error text-sm mt-1">Content is required</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
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
      </form>
    </Card>
  );
}
