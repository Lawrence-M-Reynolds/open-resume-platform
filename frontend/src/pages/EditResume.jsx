import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResume, updateResume } from '../api/resumes.js';
import Button from '../components/Button.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ResumeForm from '../components/ResumeForm.jsx';

export default function EditResume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState({
    title: '',
    targetRole: '',
    targetCompany: '',
    templateId: '',
    markdown: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingResume, setLoadingResume] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingResume(true);
    setError(null);
    getResume(id)
      .then((data) => {
        if (!cancelled) {
          setInitialValues({
            title: data.title ?? '',
            targetRole: data.targetRole ?? '',
            targetCompany: data.targetCompany ?? '',
            templateId: data.templateId ?? '',
            markdown: data.markdown ?? '',
          });
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingResume(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      await updateResume(id, values);
      navigate(`/resumes/${id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingResume) {
    return (
      <div>
        <PageHeader backTo="/" backLabel="← Resumes" />
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (error && !initialValues.title) {
    return (
      <div>
        <PageHeader backTo="/" backLabel="← Resumes" />
        <ErrorBanner
          message={error}
          action={
            <Button to="/" variant="primary" className="inline-block">
              Back to list
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        backTo={`/resumes/${id}`}
        backLabel="← Back to resume"
        title="Edit resume"
      />
      <ResumeForm
        key={id}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Save"
        submitLoadingLabel="Saving…"
        cancelTo={`/resumes/${id}`}
        cancelLabel="Cancel"
        error={error}
        loading={loading}
      />
    </div>
  );
}
