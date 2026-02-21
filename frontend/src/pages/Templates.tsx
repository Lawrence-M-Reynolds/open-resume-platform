import { useState } from "react";
import type { FormEvent } from "react";

import Button from "../components/Button";
import Card from "../components/Card";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useTemplatesData } from "../hooks/useTemplatesData";
import {
  useCreateTemplateMutation,
  useDownloadTemplateMutation,
} from "../hooks/useTemplatesMutations";
import type { Template } from "../types/api";
import { downloadBlob } from "../utils/download";
import { getErrorMessage } from "../utils/error";

export default function Templates() {
  const templatesQuery = useTemplatesData();
  const createTemplateMutation = useCreateTemplateMutation();
  const downloadTemplateMutation = useDownloadTemplateMutation();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const templates = templatesQuery.data ?? [];
  const creating = createTemplateMutation.isPending;
  const downloading = downloadTemplateMutation.isPending;

  const closeAddModal = (): void => {
    if (creating) return;
    setShowAddModal(false);
    setCreateError(null);
    setName("");
    setDescription("");
  };

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
      closeAddModal();
    } catch (errorValue) {
      setCreateError(getErrorMessage(errorValue));
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
    } catch (errorValue) {
      setDownloadError(getErrorMessage(errorValue));
    } finally {
      setDownloadingId(null);
    }
  };

  if (templatesQuery.isPending) {
    return (
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Templates
        </h1>
        <LoadingSkeleton />
      </div>
    );
  }

  if (templatesQuery.isError) {
    return (
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Templates
        </h1>
        <ErrorBanner
          message={getErrorMessage(templatesQuery.error)}
          action={
            <Button
              variant="danger"
              onClick={() => {
                void templatesQuery.refetch();
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
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Templates
        </h1>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add template
        </Button>
      </div>
      {downloadError && (
        <div className="mb-4">
          <ErrorBanner message={downloadError} compact />
        </div>
      )}
      {templates.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted mb-4">No templates yet.</p>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add your first template
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-gray-900">{template.name}</div>
                  <div className="text-muted text-sm mt-1">
                    {template.description || "—"}
                  </div>
                  <div className="text-muted text-xs mt-1 font-mono">
                    {template.id}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleDownload(template)}
                  disabled={downloading}
                >
                  {downloadingId === template.id ? "Downloading…" : "Download"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4"
          onClick={closeAddModal}
        >
          <div
            className="bg-surface rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Add template
            </h3>
            <p className="text-muted text-sm mb-4">
              Create a template with a name and optional description. The ID is
              generated by the server.
            </p>
            <form onSubmit={handleAdd}>
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
                id="template-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary mb-4"
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
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary mb-4"
                placeholder="e.g. Formal layout for banking roles"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeAddModal}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={creating || !name.trim()}
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
