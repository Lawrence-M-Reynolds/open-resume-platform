import { APP_PATHS, resumeEditPath } from "../routes/paths";
import type {
  GenerateDocxOptions,
  ResumeDocument,
  ResumeVersion,
} from "../types/api";
import { Link, useParams } from "react-router-dom";
import {
  useCreateResumeVersionMutation,
  useGenerateResumeDocxMutation,
} from "../hooks/useResumeDetailMutations";
import { useMemo, useState } from "react";

import Button from "../components/Button";
import Card from "../components/Card";
import CreateVariantModal from "../components/CreateVariantModal";
import ErrorBanner from "../components/ErrorBanner";
import type { FormEvent } from "react";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PageHeader from "../components/PageHeader";
import { downloadBlob } from "../utils/download";
import { fetchDocumentBlob } from "../api/resumes";
import { formatDate } from "../utils/date";
import { getErrorMessage } from "../utils/error";
import { slugify } from "../utils/slug";
import { getTemplateUseCase } from "../utils/template";
import { useResumeDetailData } from "../hooks/useResumeDetailData";
import { useToast } from "../components/ToastProvider";

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
  const [lastGeneration, setLastGeneration] = useState<{
    options: GenerateDocxOptions;
    sourceLabel: string;
    templateLabel: string;
  } | null>(null);
  const [regeneratingLast, setRegeneratingLast] = useState(false);

  const resume = resumeQuery.data ?? null;
  const versions = versionsQuery.data ?? [];
  const documents = documentsQuery.data ?? [];
  const templates = templatesQuery.data ?? [];

  const loadingVersions = versionsQuery.isPending;
  const loadingDocuments = documentsQuery.isPending;
  const loadingTemplates = templatesQuery.isPending;
  const creatingVariant = createVariantMutation.isPending;
  const generatingDocx = generateDocxMutation.isPending;
  const downloadingCurrent =
    generatingDocx && downloadingVersionId == null && !regeneratingLast;
  const asyncAnnouncement = generatingDocx
    ? "Generating DOCX."
    : downloadingDocumentId != null
      ? "Downloading generated document."
      : creatingVariant
        ? "Creating client variant."
        : loadingDocuments
          ? "Loading generated files."
          : loadingVersions
            ? "Loading client variants."
            : "";
  const templatesById = useMemo(
    () => new Map(templates.map((template) => [template.id, template])),
    [templates],
  );
  const versionsById = useMemo(
    () => new Map(versions.map((version) => [version.id, version])),
    [versions],
  );

  const resolveTemplateLabel = (templateId?: string | null): string | null => {
    if (!templateId) return null;
    return templatesById.get(templateId)?.name ?? templateId;
  };

  const getSourceLabel = (versionId?: string): string => {
    if (!versionId) return "Current resume";
    const version = versionsById.get(versionId);
    if (!version) return "Client variant";
    return version.label
      ? `Variant v${version.versionNo} - ${version.label}`
      : `Variant v${version.versionNo}`;
  };

  const getTemplateSelectionLabel = (templateId?: string): string => {
    const templateLabel = resolveTemplateLabel(templateId);
    if (!templateLabel) return "Resume / variant default template";
    return templateLabel;
  };

  const resolveDocumentTemplateHint = (
    document: ResumeDocument,
  ): string | null => {
    if (document.templateName && document.templateName !== "") {
      return document.templateName;
    }
    if (document.templateId && document.templateId !== "") {
      return resolveTemplateLabel(document.templateId) ?? document.templateId;
    }
    if (!document.versionId && resume?.templateId) {
      const resumeTemplateLabel = resolveTemplateLabel(resume.templateId);
      return resumeTemplateLabel
        ? `${resumeTemplateLabel} (resume default)`
        : `${resume.templateId} (resume default)`;
    }
    return null;
  };

  const inferredLastGeneration = useMemo(() => {
    if (documents.length === 0) return null;

    const latestDocument = documents.reduce((latest, current) =>
      new Date(current.generatedAt).getTime() >
      new Date(latest.generatedAt).getTime()
        ? current
        : latest,
    );

    const options: GenerateDocxOptions = {};
    if (latestDocument.versionId) {
      options.versionId = latestDocument.versionId;
    }
    if (latestDocument.templateId) {
      options.templateId = latestDocument.templateId;
    }

    return {
      options,
      sourceLabel: getSourceLabel(latestDocument.versionId ?? undefined),
      templateLabel:
        resolveDocumentTemplateHint(latestDocument) ??
        "Resume / variant default template",
    };
  }, [documents, getSourceLabel, resolveDocumentTemplateHint]);

  const effectiveLastGeneration = lastGeneration ?? inferredLastGeneration;

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

  const generateAndDownload = async (
    options: GenerateDocxOptions,
    fileName: string,
    messages: { successTitle: string; errorTitle: string },
  ): Promise<void> => {
    if (!hasResumeId || !resume || generatingDocx) return;

    setDownloadError(null);
    try {
      const blob = await generateDocxMutation.mutateAsync(options);
      downloadBlob(blob, fileName);
      setLastGeneration({
        options: { ...options },
        sourceLabel: getSourceLabel(options.versionId),
        templateLabel: getTemplateSelectionLabel(options.templateId),
      });
      toast.success({
        title: messages.successTitle,
        description: `${fileName} was downloaded.`,
      });
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setDownloadError(message);
      toast.error({
        title: messages.errorTitle,
        description: message,
      });
    }
  };

  const handleDownload = async (): Promise<void> => {
    if (!resume) return;

    const options = buildGenerateOptions();
    const fileName = `${slugify(resume.title)}.docx`;
    await generateAndDownload(options, fileName, {
      successTitle: "DOCX generated",
      errorTitle: "DOCX generation failed",
    });
  };

  const handleDownloadVersion = async (
    version: ResumeVersion,
  ): Promise<void> => {
    if (!resume) return;

    setDownloadingVersionId(version.id);
    try {
      const options = buildGenerateOptions(version.id);
      const baseName = slugify(resume.title);
      const fileName = `${baseName}-v${version.versionNo}.docx`;
      await generateAndDownload(options, fileName, {
        successTitle: `Variant v${version.versionNo} generated`,
        errorTitle: "Variant DOCX generation failed",
      });
    } finally {
      setDownloadingVersionId(null);
    }
  };

  const handleRegenerateLast = async (): Promise<void> => {
    if (!resume || !effectiveLastGeneration || generatingDocx) return;

    setRegeneratingLast(true);
    try {
      const options: GenerateDocxOptions = {
        ...effectiveLastGeneration.options,
      };
      const baseName = slugify(resume.title);
      const version = options.versionId
        ? versionsById.get(options.versionId)
        : null;
      const fileName = version
        ? `${baseName}-v${version.versionNo}.docx`
        : options.versionId
          ? `${baseName}-variant.docx`
          : `${baseName}.docx`;

      await generateAndDownload(options, fileName, {
        successTitle: "DOCX regenerated",
        errorTitle: "DOCX regeneration failed",
      });
    } finally {
      setRegeneratingLast(false);
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

  const activeTemplateId = selectedTemplateId || resume.templateId || null;
  const activeTemplate = activeTemplateId
    ? templatesById.get(activeTemplateId) ?? null
    : null;
  const activeTemplateSource = selectedTemplateId
    ? "Selected for next generation"
    : resume.templateId
      ? "Using resume default template"
      : "No explicit template selected";
  const activeTemplateLabel = activeTemplate
    ? activeTemplate.name
    : activeTemplateId || "Resume / variant default template";
  const activeTemplateUseCase = getTemplateUseCase(activeTemplate);

  const headerActions = (
    <>
      <Button to={resumeEditPath(resume.id)} variant="secondary" className="w-full sm:w-auto">
        Edit Resume
      </Button>
      <Button
        variant="secondary"
        onClick={() => setShowCreateVariant(true)}
        className="w-full sm:w-auto"
      >
        Create Client Variant
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
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {asyncAnnouncement}
      </p>
      {downloadError && (
        <div className="mb-4">
          <ErrorBanner message={downloadError} compact />
        </div>
      )}
      <Card
        className="mb-6 p-5 sm:p-6 max-w-3xl border-primary-light"
        aria-busy={loadingTemplates || generatingDocx}
      >
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Generate DOCX
            </h2>
            <p className="text-sm text-muted mt-1">
              Follow the workflow: edit content, choose template, then generate
              DOCX.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Workflow
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <Link
                to={resumeEditPath(resume.id)}
                className="font-medium text-primary hover:text-primary-dark transition-colors duration-200"
              >
                1. Edit resume
              </Link>
              <span className="text-muted">-&gt;</span>
              <span className="font-medium text-gray-700">
                2. Choose template
              </span>
              <span className="text-muted">-&gt;</span>
              <span className="font-medium text-gray-700">
                3. Generate DOCX
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="template-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Step 1: Choose template
              </label>
              <select
                id="template-select"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                disabled={loadingTemplates}
                className="w-full rounded border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Use resume / version default</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-muted">
                {selectedTemplateId
                  ? `Template selected: ${getTemplateSelectionLabel(selectedTemplateId)}`
                  : "No template override selected. Resume or variant default template will be used."}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                variant="primary"
                onClick={handleDownload}
                disabled={generatingDocx}
                className="w-full sm:w-auto"
              >
                {downloadingCurrent ? "Generating…" : "Step 2: Generate DOCX"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleRegenerateLast}
                disabled={effectiveLastGeneration == null || generatingDocx}
                className="w-full sm:w-auto"
              >
                {regeneratingLast
                  ? "Regenerating…"
                  : "Regenerate Last Selection"}
              </Button>
            </div>
          </div>
          <div
            className={`rounded-lg border p-3 ${
              selectedTemplateId
                ? "border-primary-light bg-gray-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Selected Template State
            </p>
            <p className="text-sm font-medium text-gray-900 mt-2">
              <span className="break-words">{activeTemplateLabel}</span>
            </p>
            <p className="text-xs text-muted mt-1">{activeTemplateSource}</p>
            <p className="text-xs text-muted mt-1">
              Use case: {activeTemplateUseCase}
            </p>
            <div className="mt-2">
              <Link
                to={APP_PATHS.templates}
                className="text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200"
              >
                Manage templates
              </Link>
            </div>
          </div>
          {effectiveLastGeneration && (
            <p className="text-xs text-muted">
              Last generation: {effectiveLastGeneration.sourceLabel} |
              Template: {effectiveLastGeneration.templateLabel}
            </p>
          )}
        </div>
      </Card>
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
        <Card className="p-6" aria-busy={loadingVersions}>
          {loadingVersions ? (
            <p className="text-muted text-sm">Loading…</p>
          ) : versions.length === 0 ? (
            <p className="text-muted text-sm">
              No variants yet. Click &quot;Create Client Variant&quot; to save a
              snapshot for a client or opportunity.
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
                      ? "Generating…"
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
        <Card className="p-6" aria-busy={loadingDocuments}>
          {loadingDocuments ? (
            <p className="text-muted text-sm">Loading…</p>
          ) : documents.length === 0 ? (
            <p className="text-muted text-sm">
              No generated files yet. Choose a template above and click
              &quot;Step 2: Generate DOCX&quot;.
            </p>
          ) : (
            <ul className="space-y-3">
              {documents.map((document) => {
                const sourceLabel = getSourceLabel(
                  document.versionId ?? undefined,
                );
                const templateHint = resolveDocumentTemplateHint(document);

                return (
                  <li
                    key={document.id}
                    className="rounded border border-gray-200 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {sourceLabel}
                        </p>
                        <p className="text-xs text-muted mt-1">
                          Generated {formatDate(document.generatedAt)}
                        </p>
                        <p className="text-xs text-muted mt-1 font-mono">
                          Document {document.id.slice(0, 8)}
                        </p>
                        {templateHint && (
                          <p className="text-xs text-muted mt-1">
                            Template hint: {templateHint}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => handleDownloadDocument(document)}
                        disabled={downloadingDocumentId != null}
                        className="w-full sm:w-auto"
                      >
                        {downloadingDocumentId === document.id
                          ? "Downloading…"
                          : "Download"}
                      </Button>
                    </div>
                  </li>
                );
              })}
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
