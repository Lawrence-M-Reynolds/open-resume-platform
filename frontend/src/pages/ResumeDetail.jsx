import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResume, generateDocx } from '../api/resumes.js';
import { formatDate } from '../utils/date.js';
import { downloadBlob } from '../utils/download.js';
import { slugify } from '../utils/slug.js';
import ErrorBanner from '../components/ErrorBanner.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

export default function ResumeDetail() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getResume(id)
      .then((data) => {
        if (!cancelled) setResume(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await generateDocx(id);
      downloadBlob(blob, `${slugify(resume.title)}.docx`);
    } catch (e) {
      setDownloadError(e.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
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
        <LoadingSkeleton count={1} />
      </div>
    );
  }

  if (error) {
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
        <ErrorBanner
          message={error}
          action={
            <Link
              to="/"
              className="inline-block px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary-dark transition-colors duration-200"
            >
              Back to list
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-muted hover:text-primary transition-colors duration-200 text-sm font-medium"
          >
            ← Resumes
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800">{resume.title}</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-2 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {downloading ? 'Downloading…' : 'Download DOCX'}
          </button>
          <Link
            to={`/resumes/${resume.id}/edit`}
            className="px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary-dark transition-colors duration-200"
          >
            Edit
          </Link>
        </div>
      </div>

      {downloadError && (
        <div className="mb-4">
          <ErrorBanner message={downloadError} compact />
        </div>
      )}

      <div className="bg-surface rounded-lg border border-gray-200 shadow-sm p-6 space-y-4 max-w-3xl">
        <div>
          <span className="text-sm font-medium text-gray-500">Target role</span>
          <p className="text-gray-900 mt-0.5">{resume.targetRole || '—'}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Target company</span>
          <p className="text-gray-900 mt-0.5">{resume.targetCompany || '—'}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Template ID</span>
          <p className="text-gray-900 mt-0.5">{resume.templateId || '—'}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Updated</span>
          <p className="text-gray-900 mt-0.5">{formatDate(resume.updatedAt)}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Content (Markdown)</span>
          <pre className="mt-2 p-4 bg-gray-50 rounded border border-gray-200 text-gray-900 text-sm font-mono whitespace-pre-wrap break-words">
            {resume.markdown || '—'}
          </pre>
        </div>
      </div>
    </div>
  );
}
