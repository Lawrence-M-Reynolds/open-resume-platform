import { APP_PATHS, resumeEditPath } from "../routes/paths";
import type {
  GenerateDocxOptions,
  ResumeDocument,
  ResumeVersion,
} from "../types/api";
import {
  useCreateResumeVersionMutation,
  useGenerateResumeDocxMutation,
} from "../hooks/useResumeDetailMutations";

import Button from "../components/Button";
import Card from "../components/Card";
import CreateVariantModal from "../components/CreateVariantModal";
import ErrorBanner from "../components/ErrorBanner";
import type { FormEvent } from "react";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PageHeader from "../components/PageHeader";
import { useToast } from "../components/ToastProvider";
import { downloadBlob } from "../utils/download";
import { fetchDocumentBlob } from "../api/resumes";
import { formatDate } from "../utils/date";
import { getErrorMessage } from "../utils/error";
import { slugify } from "../utils/slug";
import { useParams } from "react-router-dom";
import { useResumeDetailData } from "../hooks/useResumeDetailData";
import { useState } from "react";

export default function ResumeDetail() {
  const { id } = useParams();
  const resumeId = id ?? "";
  const hasResumeId = resumeId !== "";
  const toast = useToast();

  const { resumeQuery, versionsQuery, documentsQuery, templatesQuery } =
    useResumeDetailData(hasResumeId ? resumeId : undefined);

  const createVariantMutation = useCreateResumeVersionMutation(
    hasResumeId ? resumeId : undefined,
  );
  const generateDocxMutation = useGenerateResumeDocxMutation(
    hasResumeId ? resumeId : undefined,
  );

  const [showCreateVariant, setShowCreateVariant] = useState(false);
  const [variantLabel, setVariantLabel] = useState("");
  const [variantError, setVariantError] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadingVersionId, setDownloadingVersionId] = useState<
    string | null
  >(null);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<
    string | null
  >(null);

  const resume = resumeQuery.data ?? null;
  const versions = versionsQuery.data ?? [];
  const documents = documentsQuery.data ?? [];
  const templates = templatesQuery.data ?? [];

  const loadingVersions = versionsQuery.isPending;
  const loadingDocuments = documentsQuery.isPending;
  const loadingTemplates = templatesQuery.isPending;
  const creatingVariant = createVariantMutation.isPending;
  const generatingDocx = generateDocxMutation.isPending;
  const downloadingCurrent = generatingDocx && downloadingVersionId == null;

  const closeCreateVariantModal = (): void => {
    if (creatingVariant) return;
    setShowCreateVariant(false);
    setVariantError(null);
    setVariantLabel("");
  };

  const handleCreateVariant = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!hasResumeId || creatingVariant) return;

    setVariantError(null);
    try {
      await createVariantMutation.mutateAsync({
        label: variantLabel.trim() || undefined,
      });
      toast.success({
        title: "Client variant created",
        description: "New snapshot added to variants.",
      });
      closeCreateVariantModal();
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setVariantError(message);
      toast.error({
        title: "Couldn't create client variant",
        description: message,
      });
    }
  };

  const buildGenerateOptions = (versionId?: string): GenerateDocxOptions => {
    const options: GenerateDocxOptions = {};
    if (versionId != null && versionId !== "") options.versionId = versionId;
    if (selectedTemplateId != null && selectedTemplateId !== "") {
      options.templateId = selectedTemplateId;
    }
    return options;
  };

  const handleDownload = async (): Promise<void> => {
    if (!hasResumeId || !resume || generatingDocx) return;

    setDownloadError(null);
    try {
      const blob = await generateDocxMutation.mutateAsync(
        buildGenerateOptions(),
      );
      const fileName = `${slugify(resume.title)}.docx`;
      downloadBlob(blob, fileName);
      toast.success({
        title: "DOCX generated",
        description: `${fileName} was downloaded.`,
      });
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setDownloadError(message);
      toast.error({
        title: "DOCX generation failed",
        description: message,
      });
    }
  };

  const handleDownloadVersion = async (
    version: ResumeVersion,
  ): Promise<void> => {
    if (!hasResumeId || !resume || generatingDocx) return;

    setDownloadingVersionId(version.id);
    setDownloadError(null);
    try {
      const blob = await generateDocxMutation.mutateAsync(
        buildGenerateOptions(version.id),
      );
      const baseName = slugify(resume.title);
      const fileName = `${baseName}-v${version.versionNo}.docx`;
      downloadBlob(blob, fileName);
      toast.success({
        title: `Version v${version.versionNo} generated`,
        description: `${fileName} was downloaded.`,
      });
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setDownloadError(message);
      toast.error({
        title: "Version DOCX generation failed",
        description: message,
      });
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
      toast.success({
        title: "File downloaded",
        description: `${fileName} was downloaded.`,
      });
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setDownloadError(message);
      toast.error({
        title: "File download failed",
        description: message,
      });
    } finally {
      setDownloadingDocumentId(null);
    }
  };

  if (!hasResumeId) {
    return (
      <div>
        <PageHeader backTo={APP_PATHS.home} backLabel="← Resumes" />
        <ErrorBanner
          message="Missing resume id"
          action={
            <Button
              to={APP_PATHS.home}
              variant="primary"
              className="inline-block"
            >
              Back to list
            </Button>
          }
        />
      </div>
    );
  }

  if (resumeQuery.isPending) {
    return (
      <div>
        <PageHeader backTo={APP_PATHS.home} backLabel="← Resumes" />
        <LoadingSkeleton count={1} />
      </div>
    );
  }

  if (resumeQuery.isError) {
    return (
      <div>
        <PageHeader backTo={APP_PATHS.home} backLabel="← Resumes" />
        <ErrorBanner
          message={getErrorMessage(resumeQuery.error)}
          action={
            <Button
              to={APP_PATHS.home}
              variant="primary"
              className="inline-block"
            >
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
            <Button
              to={APP_PATHS.home}
              variant="primary"
              className="inline-block"
            >
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
        disabled={generatingDocx}
      >
        {downloadingCurrent ? "Downloading…" : "Download DOCX"}
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
                    disabled={generatingDocx}
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
      <CreateVariantModal
        open={showCreateVariant}
        label={variantLabel}
        creating={creatingVariant}
        error={variantError}
        onLabelChange={setVariantLabel}
        onClose={closeCreateVariantModal}
        onSubmit={handleCreateVariant}
      />
    </>
  );
}
