import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import Button from "../components/Button";
import Card from "../components/Card";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useToast } from "../components/ToastProvider";
import { useTemplatesData } from "../hooks/useTemplatesData";
import {
  useCreateTemplateMutation,
  useDownloadTemplateMutation,
} from "../hooks/useTemplatesMutations";
import { useModalAccessibility } from "../hooks/useModalAccessibility";
import type { Template } from "../types/api";
import { downloadBlob } from "../utils/download";
import { getErrorMessage } from "../utils/error";
import { getTemplateUseCase, matchesTemplateQuery } from "../utils/template";

export default function Templates() {
  const toast = useToast();
  const templatesQuery = useTemplatesData();
  const createTemplateMutation = useCreateTemplateMutation();
  const downloadTemplateMutation = useDownloadTemplateMutation();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const templates = templatesQuery.data ?? [];
  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) => matchesTemplateQuery(template, searchQuery)),
    [templates, searchQuery],
  );
  const creating = createTemplateMutation.isPending;
  const downloading = downloadTemplateMutation.isPending;

  const handleRetry = async (): Promise<void> => {
    toast.info({
      title: "Retrying templates",
      description: "Fetching latest template list.",
    });
    const result = await templatesQuery.refetch();
    if (result.error) {
      toast.error({
        title: "Couldn't refresh templates",
        description: getErrorMessage(result.error),
      });
      return;
    }
    toast.success({
      title: "Templates refreshed",
      description: "Latest template data loaded.",
    });
  };

  const closeAddModal = (): void => {
    if (creating) return;
    setShowAddModal(false);
    setCreateError(null);
    setName("");
    setDescription("");
  };

  const { modalRef, initialFocusRef } = useModalAccessibility({
    open: showAddModal,
    allowClose: !creating,
    onClose: closeAddModal,
  });

  const handleAdd = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || creating) return;

    setCreateError(null);
    try {
      await createTemplateMutation.mutateAsync({
        name: trimmedName,
        description: description.trim() || undefined,
      });
      toast.success({
        title: "Template added",
        description: `"${trimmedName}" is now available for generation.`,
      });
      closeAddModal();
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setCreateError(message);
      toast.error({
        title: "Couldn't add template",
        description: message,
      });
    }
  };

  const handleDownload = async (template: Template): Promise<void> => {
    if (downloading) return;

    setDownloadingId(template.id);
    setDownloadError(null);
    try {
      const blob = await downloadTemplateMutation.mutateAsync(template.id);
      const filename =
        template.id === "default-template"
          ? "open-resume-template.docx"
          : `${template.id}.docx`;
      downloadBlob(blob, filename);
      toast.success({
        title: "Template download ready",
        description: `${filename} was downloaded.`,
      });
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setDownloadError(message);
      toast.error({
        title: "Template download failed",
        description: message,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const pageHeader = (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Templates
        </h1>
        <p className="text-sm text-muted mt-1">
          Templates control DOCX layout and styling.
        </p>
      </div>
      <Button
        variant="primary"
        onClick={() => setShowAddModal(true)}
        className="w-full sm:w-auto"
      >
        Add template
      </Button>
    </div>
  );

  if (templatesQuery.isPending) {
    return (
      <div>
        {pageHeader}
        <LoadingSkeleton />
      </div>
    );
  }

  if (templatesQuery.isError) {
    return (
      <div>
        {pageHeader}
        <ErrorBanner
          message={getErrorMessage(templatesQuery.error)}
          action={
            <Button
              variant="danger"
              onClick={() => {
                void handleRetry();
              }}
            >
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      {pageHeader}
      {downloadError && (
        <div className="mb-4">
          <ErrorBanner message={downloadError} compact />
        </div>
      )}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {creating
          ? "Saving template."
          : downloading
            ? "Downloading template."
            : ""}
      </p>
      {templates.length === 0 ? (
        <Card className="p-6 sm:p-8 text-center">
          <p className="text-muted mb-4">
            No templates yet. Add one now to control your generated DOCX style.
          </p>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add your first template
          </Button>
        </Card>
      ) : (
        <>
          <Card className="p-4 mb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full sm:max-w-md">
                <label
                  htmlFor="template-search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Search templates
                </label>
                <input
                  id="template-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, description, or ID"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="text-sm text-muted sm:text-right" aria-live="polite">
                Showing {filteredTemplates.length} of {templates.length} templates
              </div>
            </div>
          </Card>

          {filteredTemplates.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted mb-4">
                No templates match your search. Try a different term.
              </p>
              <Button
                variant="secondary"
                onClick={() => setSearchQuery("")}
                disabled={searchQuery.trim() === ""}
              >
                Clear search
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900">
                        {template.name}
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        Use case: {getTemplateUseCase(template)}
                      </p>
                      <div className="text-muted text-xs mt-2 font-mono break-all">
                        {template.id}
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => handleDownload(template)}
                      disabled={downloading}
                      className="w-full sm:w-auto"
                    >
                      {downloadingId === template.id ? "Downloading…" : "Download"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={closeAddModal}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-template-title"
            aria-describedby="add-template-description"
            className="bg-surface rounded-lg shadow-xl max-w-md w-full max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="add-template-title" className="text-lg font-semibold text-gray-800 mb-3">
              Add template
            </h3>
            <p id="add-template-description" className="text-muted text-sm mb-4">
              Create a template with a name and optional description. The ID is
              generated by the server.
            </p>
            <form onSubmit={handleAdd} aria-busy={creating}>
              <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {creating ? "Creating template." : ""}
              </p>
              {createError && (
                <div className="mb-3">
                  <ErrorBanner message={createError} compact />
                </div>
              )}
              <label
                htmlFor="template-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                ref={initialFocusRef}
                id="template-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary mb-4"
                placeholder="e.g. Banking – Conservative"
                required
              />
              <label
                htmlFor="template-desc"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description (optional)
              </label>
              <input
                id="template-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary mb-4"
                placeholder="e.g. Formal layout for banking roles"
              />
              <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeAddModal}
                  disabled={creating}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={creating || !name.trim()}
                  className="w-full sm:w-auto"
                >
                  {creating ? "Creating…" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
