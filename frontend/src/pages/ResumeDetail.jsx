import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getResume, generateDocx } from '../api/resumes.js';
import { formatDate } from '../utils/date.js';
import { downloadBlob } from '../utils/download.js';
import { slugify } from '../utils/slug.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import PageHeader from '../components/PageHeader.jsx';

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
        <PageHeader backTo="/" backLabel="← Resumes" />
        <LoadingSkeleton count={1} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader backTo="/" backLabel="← Resumes" />
        <ErrorBanner
          message={error}
          action={
            <Button to="/" variant="primary" className="inline-block">
              Back to list
            </Button>
          }
        />
      </div>
    );
  }

  const headerActions = (
    <>
      <Button
        variant="secondary"
        onClick={handleDownload}
        disabled={downloading}
      >
        {downloading ? 'Downloading…' : 'Download DOCX'}
      </Button>
      <Button to={`/resumes/${resume.id}/edit`} variant="primary">
        Edit
      </Button>
    </>
  );

  return (
    <div>
      <PageHeader
        backTo="/"
        backLabel="← Resumes"
        title={resume.title}
        actions={headerActions}
      />

      {downloadError && (
        <div className="mb-4">
          <ErrorBanner message={downloadError} compact />
        </div>
      )}

      <Card className="p-6 space-y-4 max-w-3xl">
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
      </Card>
    </div>
  );
}
