import type { Resume, ResumeFormValues, ResumePayload } from "../types/api";

import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import ResumeForm from "../components/ResumeForm";
import ResumeSectionsEditor from "../components/ResumeSectionsEditor";
import Button from "../components/Button";
import { useToast } from "../components/ToastProvider";
import { useCreateResumeMutation } from "../hooks/useResumeMutations";
import { useResumeSectionsData } from "../hooks/useResumeSectionsData";
import { getErrorMessage } from "../utils/error";
import { APP_PATHS, resumeDetailPath } from "../routes/paths";
import { INITIAL_RESUME_MARKDOWN } from "../constants/resume";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const EMPTY_VALUES: ResumeFormValues = {
  title: "",
  targetRole: "",
  targetCompany: "",
  templateId: "",
  markdown: "",
};

export default function NewResume() {
  const navigate = useNavigate();
  const toast = useToast();
  const createResumeMutation = useCreateResumeMutation();
  const [error, setError] = useState<string | null>(null);
  const [createdResume, setCreatedResume] = useState<Resume | null>(null);
  const sectionsQuery = useResumeSectionsData(createdResume?.id);
  const sections = sectionsQuery.data ?? [];

  const handleSubmit = async (values: ResumePayload): Promise<void> => {
    if (createResumeMutation.isPending) return;
    setError(null);

    try {
      const resume = await createResumeMutation.mutateAsync({
        ...values,
        markdown: INITIAL_RESUME_MARKDOWN,
      });
      setCreatedResume(resume);
      toast.success({
        title: "Step 1 complete",
        description: "Now add sections and save them to this resume.",
      });
    } catch (errorValue) {
      const message = getErrorMessage(errorValue);
      setError(message);
      toast.error({
        title: "Couldn't create resume",
        description: message,
      });
    }
  };

  return (
    <>
      <PageHeader backTo={APP_PATHS.home} backLabel="← Resumes" title="New resume" />
      {createdResume == null ? (
        <>
          <ResumeForm
            initialValues={EMPTY_VALUES}
            onSubmit={handleSubmit}
            submitLabel="Save resume and continue"
            submitLoadingLabel="Saving resume metadata…"
            cancelTo={APP_PATHS.home}
            cancelLabel="Cancel"
            error={error}
            loading={createResumeMutation.isPending}
            showMarkdownField={false}
          />
        </>
      ) : (
        <>
          <Card className="p-4 sm:p-5 mb-4 max-w-3xl">
            <p className="text-sm text-muted">
              Step 2 of 2: add sections. Each section is saved to the resume
              via the sections API one by one.
            </p>
            <p className="text-xs text-muted mt-2">
              Resume: <span className="font-medium text-gray-800">{createdResume.title}</span>
            </p>
          </Card>
          <ResumeSectionsEditor resumeId={createdResume.id} />
          <Card className="p-4 sm:p-5 mt-4 max-w-3xl">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <p className="text-sm text-muted">
                {sections.length === 0
                  ? "Save at least one section to continue."
                  : `${sections.length} section${sections.length > 1 ? "s" : ""} saved.`}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setCreatedResume(null)}
                  disabled={createResumeMutation.isPending}
                >
                  Back to Step 1
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate(resumeDetailPath(createdResume.id))}
                  disabled={sections.length === 0 || sectionsQuery.isPending}
                >
                  Continue to resume
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
