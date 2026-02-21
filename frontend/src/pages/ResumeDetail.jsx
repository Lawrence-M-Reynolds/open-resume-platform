import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getResume, generateDocx, listVersions, createVersion } from '../api/resumes.js';
import { listTemplates } from '../api/templates.js';
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
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [showCreateVariant, setShowCreateVariant] = useState(false);
  const [variantLabel, setVariantLabel] = useState('');
  const [creatingVariant, setCreatingVariant] = useState(false);
  const [variantError, setVariantError] = useState(null);
  const [downloadingVersionId, setDownloadingVersionId] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);

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

  const loadVersions = () => {
    setLoadingVersions(true);
    listVersions(id)
      .then((data) => setVersions(data))
      .catch(() => setVersions([]))
      .finally(() => setLoadingVersions(false));
  };

  useEffect(() => {
    if (!resume) return;
    loadVersions();
  }, [resume?.id]);

  useEffect(() => {
    setLoadingTemplates(true);
    listTemplates()
      .then((data) => setTemplates(data))
      .catch(() => setTemplates([]))
      .finally(() => setLoadingTemplates(false));
  }, []);

  const handleCreateVariant = async (e) => {
    e.preventDefault();
    setCreatingVariant(true);
    setVariantError(null);
    try {
      await createVersion(id, { label: variantLabel.trim() || undefined });
      setShowCreateVariant(false);
      setVariantLabel('');
      loadVersions();
    } catch (e) {
      setVariantError(e.message);
    } finally {
      setCreatingVariant(false);
    }
  };

  const buildGenerateOptions = (versionId) => {
    const opts = {};
    if (versionId != null && versionId !== '') opts.versionId = versionId;
    if (selectedTemplateId != null && selectedTemplateId !== '') opts.templateId = selectedTemplateId;
    return opts;
  };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await generateDocx(id, buildGenerateOptions());
      downloadBlob(blob, `${slugify(resume.title)}.docx`);
    } catch (e) {
      setDownloadError(e.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadVersion = async (version) => {
    setDownloadingVersionId(version.id);
    setDownloadError(null);
    try {
      const blob = await generateDocx(id, buildGenerateOptions(version.id));
      const baseName = slugify(resume.title);
      const fileName = `${baseName}-v${version.versionNo}.docx`;
      downloadBlob(blob, fileName);
    } catch (e) {
      setDownloadError(e.message);
    } finally {
      setDownloadingVersionId(null);
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
        onClick={() => setShowCreateVariant(true)}
      >
        Create Client Variant
      </Button>
      <Button
        variant="secondary"
        onClick={handleDownload}
        disabled={downloading || downloadingVersionId != null}
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

      <div className="mb-4 max-w-3xl">
        <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-1">
          Template for DOCX generation
        </label>
        <select
          id="template-select"
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          disabled={loadingTemplates}
          className="rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-w-[200px]"
        >
          <option value="">Use resume / version default</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

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
          <pre className="mt-2 p-4 bg-gray-50 rounded border border-gray-200 text-gray-900 text-sm font-mono whitespace-pre-wrap break-words overflow-x-auto min-w-0">
            {resume.markdown || '—'}
          </pre>
        </div>
      </Card>

      <div className="mt-8 max-w-3xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Client variants</h2>
          <Button variant="secondary" onClick={() => setShowCreateVariant(true)}>
            Create Client Variant
          </Button>
        </div>
        <Card className="p-6">
          {loadingVersions ? (
            <p className="text-muted text-sm">Loading…</p>
          ) : versions.length === 0 ? (
            <p className="text-muted text-sm">No variants yet. Create a snapshot for a specific client or opportunity.</p>
          ) : (
            <ul className="space-y-3">
              {versions.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="font-medium text-gray-900">v{v.versionNo}</span>
                  <span className="text-gray-600">{v.label || '—'}</span>
                  <span className="text-muted">{formatDate(v.createdAt)}</span>
                  <Button
                    variant="secondary"
                    onClick={() => handleDownloadVersion(v)}
                    disabled={downloadingVersionId != null}
                  >
                    {downloadingVersionId === v.id ? 'Downloading…' : 'Generate DOCX'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {showCreateVariant && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4" onClick={() => !creatingVariant && setShowCreateVariant(false)}>
          <div className="bg-surface rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Create Client Variant</h3>
            <p className="text-muted text-sm mb-4">Snapshot the current resume. Optionally add a label (e.g. &quot;For Acme&quot;).</p>
            <form onSubmit={handleCreateVariant}>
              {variantError && (
                <div className="mb-3">
                  <ErrorBanner message={variantError} compact />
                </div>
              )}
              <label htmlFor="variant-label" className="block text-sm font-medium text-gray-700 mb-1">Label (optional)</label>
              <input
                id="variant-label"
                type="text"
                value={variantLabel}
                onChange={(e) => setVariantLabel(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary mb-4"
                placeholder="e.g. For Acme"
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => { setShowCreateVariant(false); setVariantError(null); setVariantLabel(''); }} disabled={creatingVariant}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={creatingVariant}>
                  {creatingVariant ? 'Creating…' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
