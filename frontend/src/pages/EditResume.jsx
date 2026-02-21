import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getResume, updateResume } from '../api/resumes.js';

const MIN_TITLE_LENGTH = 3;

export default function EditResume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingResume, setLoadingResume] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingResume(true);
    setError(null);
    getResume(id)
      .then((data) => {
        if (!cancelled) {
          setTitle(data.title ?? '');
          setTargetRole(data.targetRole ?? '');
          setTargetCompany(data.targetCompany ?? '');
          setTemplateId(data.templateId ?? '');
          setMarkdown(data.markdown ?? '');
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingResume(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const titleTrimmed = title.trim();
  const markdownTrimmed = markdown.trim();
  const titleValid = titleTrimmed.length >= MIN_TITLE_LENGTH;
  const markdownValid = markdownTrimmed.length > 0;
  const valid = titleValid && markdownValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    setError(null);
    try {
      await updateResume(id, {
        title: titleTrimmed,
        targetRole: targetRole.trim() || null,
        targetCompany: targetCompany.trim() || null,
        templateId: templateId.trim() || null,
        markdown: markdownTrimmed,
      });
      navigate(`/resumes/${id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingResume) {
    return (
      <div>
        <div className="mb-6">
          <Link
            to="/"
            className="text-muted hover:text-primary transition-colors duration-200 text-sm font-medium"
          >
            ← Resumes
          </Link>
        </div>
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div>
        <div className="mb-6">
          <Link
            to="/"
            className="text-muted hover:text-primary transition-colors duration-200 text-sm font-medium"
          >
            ← Resumes
          </Link>
        </div>
        <div className="bg-error/10 border border-error/30 text-error rounded-lg p-4">
          <p>{error}</p>
          <Link
            to="/"
            className="inline-block mt-3 px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary-dark transition-colors duration-200"
          >
            Back to list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          to={`/resumes/${id}`}
          className="text-muted hover:text-primary transition-colors duration-200 text-sm font-medium"
        >
          ← Back to resume
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800">Edit resume</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-lg border border-gray-200 shadow-sm p-6 space-y-4 max-w-2xl"
      >
        {error && (
          <div className="bg-error/10 border border-error/30 text-error rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
          <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700 mb-1">
            Target role
          </label>
          <input
            id="targetRole"
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. Senior Software Engineer"
          />
        </div>

        <div>
          <label htmlFor="targetCompany" className="block text-sm font-medium text-gray-700 mb-1">
            Target company
          </label>
          <input
            id="targetCompany"
            type="text"
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. Acme Inc"
          />
        </div>

        <div>
          <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-1">
            Template ID
          </label>
          <input
            id="templateId"
            type="text"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="default-template"
          />
        </div>

        <div>
          <label htmlFor="markdown" className="block text-sm font-medium text-gray-700 mb-1">
            Content (Markdown) *
          </label>
          <textarea
            id="markdown"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={12}
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm"
            placeholder="# Your resume in Markdown..."
            required
          />
          {markdown.length > 0 && !markdownValid && (
            <p className="text-error text-sm mt-1">Content is required</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!valid || loading}
            className="px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
          <Link
            to={`/resumes/${id}`}
            className="px-4 py-2 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
