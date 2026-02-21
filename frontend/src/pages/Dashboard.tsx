import Button from "../components/Button";
import Card from "../components/Card";
import ErrorBanner from "../components/ErrorBanner";
import { Link } from "react-router-dom";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useToast } from "../components/ToastProvider";
import { useResumesData } from "../hooks/useResumesData";
import { APP_PATHS, resumeDetailPath } from "../routes/paths";
import { formatDate } from "../utils/date";
import { getErrorMessage } from "../utils/error";

export default function Dashboard() {
  const toast = useToast();
  const resumesQuery = useResumesData();
  const resumes = resumesQuery.data ?? [];

  const handleRetry = async (): Promise<void> => {
    toast.info({
      title: "Retrying resumes",
      description: "Fetching the latest resume list.",
    });
    const result = await resumesQuery.refetch();
    if (result.error) {
      toast.error({
        title: "Couldn't refresh resumes",
        description: getErrorMessage(result.error),
      });
      return;
    }
    toast.success({
      title: "Resumes refreshed",
      description: "Latest data loaded.",
    });
  };

  if (resumesQuery.isPending) {
    return (
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Resumes
        </h1>
        <LoadingSkeleton />
      </div>
    );
  }

  if (resumesQuery.isError) {
    return (
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Resumes
        </h1>
        <ErrorBanner
          message={getErrorMessage(resumesQuery.error)}
          action={
            <Button
              variant="danger"
              onClick={() => {
                void handleRetry();
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
          Resumes
        </h1>
        <Button to={APP_PATHS.resumeNew} variant="primary">
          Create resume
        </Button>
      </div>
      {resumes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted mb-4">No resumes yet.</p>
          <Button to={APP_PATHS.resumeNew} variant="primary">
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
                to={resumeDetailPath(resume.id)}
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
