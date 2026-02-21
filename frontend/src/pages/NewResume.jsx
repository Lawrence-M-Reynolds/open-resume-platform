import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createResume } from '../api/resumes.js';
import PageHeader from '../components/PageHeader.jsx';
import ResumeForm from '../components/ResumeForm.jsx';

const EMPTY_VALUES = {
  title: '',
  targetRole: '',
  targetCompany: '',
  templateId: '',
  markdown: '',
};

export default function NewResume() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const resume = await createResume(values);
      navigate(`/resumes/${resume.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader backTo="/" backLabel="← Resumes" title="New resume" />
      <ResumeForm
        initialValues={EMPTY_VALUES}
        onSubmit={handleSubmit}
        submitLabel="Create resume"
        submitLoadingLabel="Creating…"
        cancelTo="/"
        cancelLabel="Cancel"
        error={error}
        loading={loading}
      />
    </div>
  );
}
