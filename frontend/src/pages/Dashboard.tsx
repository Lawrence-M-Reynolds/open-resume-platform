import { useEffect, useState } from "react";

import Button from "../components/Button";
import Card from "../components/Card";
import ErrorBanner from "../components/ErrorBanner";
import { Link } from "react-router-dom";
import LoadingSkeleton from "../components/LoadingSkeleton";
import type { Resume } from "../types/api";
import { formatDate } from "../utils/date";
import { getErrorMessage } from "../utils/error";
import { listResumes } from "../api/resumes";

export default function Dashboard() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await listResumes();
      setResumes(data);
    } catch (errorValue) {
      setError(getErrorMessage(errorValue));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Resumes
        </h1>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Resumes
        </h1>
        <ErrorBanner
          message={error}
          action={
            <Button variant="danger" onClick={load}>
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
          Resumes
        </h1>
        <Button to="/resumes/new" variant="primary">
          Create resume
        </Button>
      </div>
      {resumes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted mb-4">No resumes yet.</p>
          <Button to="/resumes/new" variant="primary">
            Create your first resume
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => (
            <Card
              key={resume.id}
              className="p-0 transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5 hover:border-primary-light"
            >
              <Link
                to={`/resumes/${resume.id}`}
                className="block p-5 no-underline text-inherit"
              >
                <div className="font-semibold text-gray-900">
                  {resume.title}
                </div>
                <div className="text-muted text-sm mt-1">
                  {resume.targetRole || "—"}
                </div>
                <div className="text-muted text-sm mt-1">
                  Updated {formatDate(resume.updatedAt)}
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
