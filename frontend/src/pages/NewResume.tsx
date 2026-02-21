import type { ResumeFormValues, ResumePayload } from "../types/api";

import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import ResumeForm from "../components/ResumeForm";
import { useToast } from "../components/ToastProvider";
import { useCreateResumeMutation } from "../hooks/useResumeMutations";
import { getErrorMessage } from "../utils/error";
import { APP_PATHS, resumeDetailPath } from "../routes/paths";
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

  const handleSubmit = async (values: ResumePayload): Promise<void> => {
    setError(null);
    try {
      const resume = await createResumeMutation.mutateAsync(values);
      toast.success({
        title: "Resume created",
        description: "Opening the new resume.",
      });
      navigate(resumeDetailPath(resume.id));
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
      <Card className="p-4 sm:p-5 mb-4 max-w-2xl">
        <p className="text-sm text-muted">
          Start with structured markdown sections. Template ID is optional, and
          you can choose or change the template later before generating DOCX.
        </p>
      </Card>
      <ResumeForm
        initialValues={EMPTY_VALUES}
        onSubmit={handleSubmit}
        submitLabel="Create resume"
        submitLoadingLabel="Creating…"
        cancelTo={APP_PATHS.home}
        cancelLabel="Cancel"
        error={error}
        loading={createResumeMutation.isPending}
        showMarkdownStarter
      />
    </>
  );
}
