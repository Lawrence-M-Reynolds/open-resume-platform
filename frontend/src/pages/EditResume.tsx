import type { ResumeFormValues, ResumePayload } from "../types/api";
import { getResume, updateResume } from "../api/resumes";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../components/Button";
import ErrorBanner from "../components/ErrorBanner";
import PageHeader from "../components/PageHeader";
import ResumeForm from "../components/ResumeForm";
import { APP_PATHS, resumeDetailPath } from "../routes/paths";
import { getErrorMessage } from "../utils/error";

export default function EditResume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState<ResumeFormValues>({
    title: "",
    targetRole: "",
    targetCompany: "",
    templateId: "",
    markdown: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingResume, setLoadingResume] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const detailPath = id ? resumeDetailPath(id) : APP_PATHS.home;

  useEffect(() => {
    if (!id) {
      setError("Missing resume id");
      setLoadingResume(false);
      return;
    }

    let cancelled = false;
    setLoadingResume(true);
    setError(null);
    getResume(id)
      .then((data) => {
        if (!cancelled) {
          setInitialValues({
            title: data.title ?? "",
            targetRole: data.targetRole ?? "",
            targetCompany: data.targetCompany ?? "",
            templateId: data.templateId ?? "",
            markdown: data.markdown ?? "",
          });
        }
      })
      .catch((errorValue: unknown) => {
        if (!cancelled) setError(getErrorMessage(errorValue));
      })
      .finally(() => {
        if (!cancelled) setLoadingResume(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (values: ResumePayload): Promise<void> => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      await updateResume(id, values);
      navigate(resumeDetailPath(id));
    } catch (errorValue) {
      setError(getErrorMessage(errorValue));
    } finally {
      setLoading(false);
    }
  };

  if (loadingResume) {
    return (
      <>
        <PageHeader backTo={APP_PATHS.home} backLabel="← Resumes" />
        <p className="text-muted">Loading…</p>
      </>
    );
  }

  if (error && !initialValues.title) {
    return (
      <>
        <PageHeader backTo={APP_PATHS.home} backLabel="← Resumes" />
        <ErrorBanner
          message={error}
          action={
            <Button to={APP_PATHS.home} variant="primary" className="inline-block">
              Back to list
            </Button>
          }
        />
      </>
    );
  }

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
        error={error}
        loading={loading}
      />
    </>
  );
}
