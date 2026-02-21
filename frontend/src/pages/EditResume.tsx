import type { ResumeFormValues, ResumePayload } from "../types/api";
import { useState } from "react";
import { useParams } from "react-router-dom";

import Button from "../components/Button";
import ErrorBanner from "../components/ErrorBanner";
import PageHeader from "../components/PageHeader";
import { useResumeData } from "../hooks/useResumeData";
import { useUpdateResumeMutation } from "../hooks/useResumeMutations";
import { useToast } from "../components/ToastProvider";
import ResumeForm from "../components/ResumeForm";
import { APP_PATHS, resumeDetailPath } from "../routes/paths";
import { getErrorMessage } from "../utils/error";

export default function EditResume() {
  const { id } = useParams();
  const hasResumeId = id != null && id !== "";
  const toast = useToast();
  const resumeQuery = useResumeData(hasResumeId ? id : undefined);
  const updateResumeMutation = useUpdateResumeMutation(hasResumeId ? id : undefined);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const detailPath = id ? resumeDetailPath(id) : APP_PATHS.home;

  const handleSubmit = async (values: ResumePayload): Promise<void> => {
    if (!hasResumeId || !id) return;
    setSubmitError(null);
    setSaveStatus(null);
    try {
      await updateResumeMutation.mutateAsync(values);
      const savedAt = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setSaveStatus(`Saved at ${savedAt}`);
      toast.success({
        title: "Resume updated",
        description: "Your changes were saved.",
      });
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setSubmitError(message);
      toast.error({
        title: "Couldn't save resume",
        description: message,
      });
    }
  };

  if (!hasResumeId) {
    return (
      <>
        <PageHeader backTo={APP_PATHS.home} backLabel="← Resumes" />
        <ErrorBanner
          message="Missing resume id"
          action={
            <Button to={APP_PATHS.home} variant="primary" className="inline-block">
              Back to list
            </Button>
          }
        />
      </>
    );
  }

  if (resumeQuery.isPending) {
    return (
      <>
        <PageHeader backTo={APP_PATHS.home} backLabel="← Resumes" />
        <p className="text-muted">Loading…</p>
      </>
    );
  }

  if (resumeQuery.isError) {
    return (
      <>
        <PageHeader backTo={APP_PATHS.home} backLabel="← Resumes" />
        <ErrorBanner
          message={getErrorMessage(resumeQuery.error)}
          action={
            <Button to={APP_PATHS.home} variant="primary" className="inline-block">
              Back to list
            </Button>
          }
        />
      </>
    );
  }

  const resume = resumeQuery.data;
  const initialValues: ResumeFormValues = {
    title: resume?.title ?? "",
    targetRole: resume?.targetRole ?? "",
    targetCompany: resume?.targetCompany ?? "",
    templateId: resume?.templateId ?? "",
    markdown: resume?.markdown ?? "",
  };

  return (
    <>
      <PageHeader
        backTo={detailPath}
        backLabel="← Back to resume"
        title="Edit resume"
      />
      <ResumeForm
        key={id}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        submitLoadingLabel="Saving…"
        cancelTo={detailPath}
        cancelLabel="Back to resume"
        error={submitError}
        loading={updateResumeMutation.isPending}
        statusMessage={saveStatus}
        warnOnUnsavedChanges
        onDirtyChange={(isDirty) => {
          if (isDirty) setSaveStatus(null);
        }}
      />
    </>
  );
}
