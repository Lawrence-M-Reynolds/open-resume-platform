import type { ResumeFormValues, ResumePayload } from "../types/api";

import PageHeader from "../components/PageHeader";
import ResumeForm from "../components/ResumeForm";
import { createResume } from "../api/resumes";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: ResumePayload): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const resume = await createResume(values);
      navigate(resumeDetailPath(resume.id));
    } catch (errorValue) {
      setError(getErrorMessage(errorValue));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader backTo={APP_PATHS.home} backLabel="← Resumes" title="New resume" />
      <ResumeForm
        initialValues={EMPTY_VALUES}
        onSubmit={handleSubmit}
        submitLabel="Create resume"
        submitLoadingLabel="Creating…"
        cancelTo={APP_PATHS.home}
        cancelLabel="Cancel"
        error={error}
        loading={loading}
      />
    </>
  );
}
