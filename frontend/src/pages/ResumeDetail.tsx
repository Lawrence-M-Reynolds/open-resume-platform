import type {
  GenerateDocxOptions,
  Resume,
  ResumeDocument,
  ResumeVersion,
  Template,
} from "../types/api";
import {
  createVersion,
  fetchDocumentBlob,
  generateDocx,
  getResume,
  listDocuments,
  listVersions,
} from "../api/resumes";
import { useEffect, useState } from "react";

import Button from "../components/Button";
import Card from "../components/Card";
import ErrorBanner from "../components/ErrorBanner";
import type { FormEvent } from "react";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PageHeader from "../components/PageHeader";
import { downloadBlob } from "../utils/download";
import { formatDate } from "../utils/date";
import { getErrorMessage } from "../utils/error";
import { listTemplates } from "../api/templates";
import { APP_PATHS, resumeEditPath } from "../routes/paths";
import { slugify } from "../utils/slug";
import { useParams } from "react-router-dom";

export default function ResumeDetail() {
  const { id } = useParams();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [showCreateVariant, setShowCreateVariant] = useState(false);
  const [variantLabel, setVariantLabel] = useState("");
  const [creatingVariant, setCreatingVariant] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [downloadingVersionId, setDownloadingVersionId] = useState<
    string | null
  >(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [documents, setDocuments] = useState<ResumeDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!id) {
      setError("Missing resume id");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    getResume(id)
      .then((data) => {
        if (!cancelled) setResume(data);
      })
      .catch((errorValue: unknown) => {
        if (!cancelled) setError(getErrorMessage(errorValue));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadVersions = (): void => {
    if (!id) {
      setVersions([]);
      return;
    }
    setLoadingVersions(true);
    listVersions(id)
      .then((data) => setVersions(data))
      .catch(() => setVersions([]))
      .finally(() => setLoadingVersions(false));
  };

  useEffect(() => {
    loadVersions();
  }, [id]);

  const loadDocuments = (): void => {
    if (!id) {
      setDocuments([]);
      return;
    }
    setLoadingDocuments(true);
    listDocuments(id)
      .then((data) => setDocuments(data))
      .catch(() => setDocuments([]))
      .finally(() => setLoadingDocuments(false));
  };

  useEffect(() => {
    loadDocuments();
  }, [id]);

  useEffect(() => {
    setLoadingTemplates(true);
    listTemplates()
      .then((data) => setTemplates(data))
      .catch(() => setTemplates([]))
      .finally(() => setLoadingTemplates(false));
  }, []);

  const handleCreateVariant = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!id) return;

    setCreatingVariant(true);
    setVariantError(null);
    try {
      await createVersion(id, { label: variantLabel.trim() || undefined });
      setShowCreateVariant(false);
      setVariantLabel("");
      loadVersions();
    } catch (errorValue) {
      setVariantError(getErrorMessage(errorValue));
    } finally {
      setCreatingVariant(false);
    }
  };

  const buildGenerateOptions = (versionId?: string): GenerateDocxOptions => {
    const opts: GenerateDocxOptions = {};
    if (versionId != null && versionId !== "") opts.versionId = versionId;
    if (selectedTemplateId != null && selectedTemplateId !== "") {
      opts.templateId = selectedTemplateId;
    }
    return opts;
  };

  const handleDownload = async (): Promise<void> => {
    if (!id || !resume) return;

    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await generateDocx(id, buildGenerateOptions());
      downloadBlob(blob, `${slugify(resume.title)}.docx`);
      loadDocuments();
    } catch (errorValue) {
      setDownloadError(getErrorMessage(errorValue));
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadVersion = async (
    version: ResumeVersion,
  ): Promise<void> => {
    if (!id || !resume) return;

    setDownloadingVersionId(version.id);
    setDownloadError(null);
    try {
      const blob = await generateDocx(id, buildGenerateOptions(version.id));
      const baseName = slugify(resume.title);
      const fileName = `${baseName}-v${version.versionNo}.docx`;
      downloadBlob(blob, fileName);
      loadDocuments();
    } catch (errorValue) {
      setDownloadError(getErrorMessage(errorValue));
    } finally {
      setDownloadingVersionId(null);
    }
  };

  const handleDownloadDocument = async (
    document: ResumeDocument,
  ): Promise<void> => {
    if (!resume) return;

    setDownloadingDocumentId(document.id);
    setDownloadError(null);
    try {
      const blob = await fetchDocumentBlob(document.downloadUrl);
      const baseName = slugify(resume.title);
      const fileName = `${baseName}-${document.id.slice(0, 8)}.docx`;
      downloadBlob(blob, fileName);
    } catch (errorValue) {
      setDownloadError(getErrorMessage(errorValue));
    } finally {
      setDownloadingDocumentId(null);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader backTo={APP_PATHS.home} backLabel="← Resumes" />
        <LoadingSkeleton count={1} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader backTo={APP_PATHS.home} backLabel="← Resumes" />
        <ErrorBanner
          message={error}
          action={
            <Button to={APP_PATHS.home} variant="primary" className="inline-block">
              Back to list
            </Button>
          }
        />
      </div>
    );
  }

  if (!resume) {
    return (
      <div>
        <PageHeader backTo={APP_PATHS.home} backLabel="← Resumes" />
        <ErrorBanner
          message="Resume not found"
          action={
            <Button to={APP_PATHS.home} variant="primary" className="inline-block">
              Back to list
            </Button>
          }
        />
      </div>
    );
  }

  const headerActions = (
    <>
      <Button variant="secondary" onClick={() => setShowCreateVariant(true)}>
        Create Client Variant
      </Button>
      <Button
        variant="secondary"
        onClick={handleDownload}
        disabled={downloading || downloadingVersionId != null}
      >
        {downloading ? "Downloading…" : "Download DOCX"}
      </Button>
      <Button to={resumeEditPath(resume.id)} variant="primary">
        Edit
      </Button>
    </>
  );

  return (
    <>
      <PageHeader
        backTo={APP_PATHS.home}
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
        <label
          htmlFor="template-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
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
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      <Card className="p-6 space-y-4 max-w-3xl">
        <div>
          <span className="text-sm font-medium text-gray-500">Target role</span>
          <p className="text-gray-900 mt-0.5">{resume.targetRole || "—"}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">
            Target company
          </span>
          <p className="text-gray-900 mt-0.5">{resume.targetCompany || "—"}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Template ID</span>
          <p className="text-gray-900 mt-0.5">{resume.templateId || "—"}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Updated</span>
          <p className="text-gray-900 mt-0.5">{formatDate(resume.updatedAt)}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">
            Content (Markdown)
          </span>
          <pre className="mt-2 p-4 bg-gray-50 rounded border border-gray-200 text-gray-900 text-sm font-mono whitespace-pre-wrap break-words overflow-x-auto min-w-0">
            {resume.markdown || "—"}
          </pre>
        </div>
      </Card>

      <div className="mt-8 max-w-3xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Client variants
          </h2>
          <Button
            variant="secondary"
            onClick={() => setShowCreateVariant(true)}
          >
            Create Client Variant
          </Button>
        </div>
        <Card className="p-6">
          {loadingVersions ? (
            <p className="text-muted text-sm">Loading…</p>
          ) : versions.length === 0 ? (
            <p className="text-muted text-sm">
              No variants yet. Create a snapshot for a specific client or
              opportunity.
            </p>
          ) : (
            <ul className="space-y-3">
              {versions.map((version) => (
                <li
                  key={version.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
                >
                  <span className="font-medium text-gray-900">
                    v{version.versionNo}
                  </span>
                  <span className="text-gray-600">{version.label || "—"}</span>
                  <span className="text-muted">
                    {formatDate(version.createdAt)}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => handleDownloadVersion(version)}
                    disabled={downloadingVersionId != null}
                  >
                    {downloadingVersionId === version.id
                      ? "Downloading…"
                      : "Generate DOCX"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-8 max-w-3xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Generated files
        </h2>
        <Card className="p-6">
          {loadingDocuments ? (
            <p className="text-muted text-sm">Loading…</p>
          ) : documents.length === 0 ? (
            <p className="text-muted text-sm">
              No generated files yet. Use &quot;Download DOCX&quot; or
              &quot;Generate DOCX&quot; on a variant to create one.
            </p>
          ) : (
            <ul className="space-y-3">
              {documents.map((document) => (
                <li
                  key={document.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
                >
                  <span className="text-muted">
                    {formatDate(document.generatedAt)}
                  </span>
                  <span className="text-gray-600">
                    {document.versionId ? "Version snapshot" : "Current resume"}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => handleDownloadDocument(document)}
                    disabled={downloadingDocumentId != null}
                  >
                    {downloadingDocumentId === document.id
                      ? "Downloading…"
                      : "Download"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {showCreateVariant && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !creatingVariant && setShowCreateVariant(false)}
        >
          <div
            className="bg-surface rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Create Client Variant
            </h3>
            <p className="text-muted text-sm mb-4">
              Snapshot the current resume. Optionally add a label (e.g.
              &quot;For Acme&quot;).
            </p>
            <form onSubmit={handleCreateVariant}>
              {variantError && (
                <div className="mb-3">
                  <ErrorBanner message={variantError} compact />
                </div>
              )}
              <label
                htmlFor="variant-label"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Label (optional)
              </label>
              <input
                id="variant-label"
                type="text"
                value={variantLabel}
                onChange={(e) => setVariantLabel(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary mb-4"
                placeholder="e.g. For Acme"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCreateVariant(false);
                    setVariantError(null);
                    setVariantLabel("");
                  }}
                  disabled={creatingVariant}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={creatingVariant}
                >
                  {creatingVariant ? "Creating…" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
