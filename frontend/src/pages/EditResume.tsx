import type { ResumeFormValues, ResumePayload } from "../types/api";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../components/Button";
import ErrorBanner from "../components/ErrorBanner";
import PageHeader from "../components/PageHeader";
import { useResumeData } from "../hooks/useResumeData";
import { useUpdateResumeMutation } from "../hooks/useResumeMutations";
import ResumeForm from "../components/ResumeForm";
import { APP_PATHS, resumeDetailPath } from "../routes/paths";
import { getErrorMessage } from "../utils/error";

export default function EditResume() {
  const { id } = useParams();
  const hasResumeId = id != null && id !== "";
  const navigate = useNavigate();
  const resumeQuery = useResumeData(hasResumeId ? id : undefined);
  const updateResumeMutation = useUpdateResumeMutation(hasResumeId ? id : undefined);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const detailPath = id ? resumeDetailPath(id) : APP_PATHS.home;

  const handleSubmit = async (values: ResumePayload): Promise<void> => {
    if (!hasResumeId || !id) return;
    setSubmitError(null);
    try {
      await updateResumeMutation.mutateAsync(values);
      navigate(resumeDetailPath(id));
    } catch (errorValue) {
      setSubmitError(getErrorMessage(errorValue));
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
        submitLabel="Save"
        submitLoadingLabel="Saving…"
        cancelTo={detailPath}
        cancelLabel="Cancel"
        error={submitError}
        loading={updateResumeMutation.isPending}
      />
    </>
  );
}
