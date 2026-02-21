import Button from "../components/Button";
import Card from "../components/Card";
import ErrorBanner from "../components/ErrorBanner";
import { Link } from "react-router-dom";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useQueries } from "@tanstack/react-query";
import { useToast } from "../components/ToastProvider";
import { listSections } from "../api/resumes";
import { useResumesData } from "../hooks/useResumesData";
import { queryKeys } from "../query/keys";
import { APP_PATHS, resumeDetailPath } from "../routes/paths";
import { formatDate } from "../utils/date";
import { getErrorMessage } from "../utils/error";

export default function Dashboard() {
  const toast = useToast();
  const resumesQuery = useResumesData();
  const resumes = resumesQuery.data ?? [];
  const sectionsQueries = useQueries({
    queries: resumes.map((resume) => ({
      queryKey: queryKeys.resumeSections(resume.id),
      queryFn: () => listSections(resume.id),
      enabled: resumesQuery.isSuccess,
      staleTime: 60_000,
    })),
  });

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

  const pageHeader = (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Resumes
        </h1>
        <p className="text-sm text-muted mt-1">
          Create a resume, choose a template, and generate DOCX.
        </p>
      </div>
      <div className="flex w-full sm:w-auto flex-col sm:flex-row flex-wrap gap-2">
        <Button to={APP_PATHS.resumeNew} variant="primary" className="w-full sm:w-auto">
          Create resume
        </Button>
        <Button to={APP_PATHS.templates} variant="secondary" className="w-full sm:w-auto">
          Manage templates
        </Button>
      </div>
    </div>
  );

  if (resumesQuery.isPending) {
    return (
      <div>
        {pageHeader}
        <LoadingSkeleton />
      </div>
    );
  }

  if (resumesQuery.isError) {
    return (
      <div>
        {pageHeader}
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
      {pageHeader}
      {resumes.length === 0 ? (
        <Card className="p-6 sm:p-8 text-center">
          <p className="text-muted mb-4">
            No resumes yet. Create your first resume to start generating DOCX.
          </p>
          <Button to={APP_PATHS.resumeNew} variant="primary">
            Create your first resume
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume, index) => {
            const sectionQuery = sectionsQueries[index];
            const sectionCount = sectionQuery?.data?.length;
            const sectionsLabel = sectionQuery?.isPending
              ? "Sections loading…"
              : sectionQuery?.isError
                ? "Sections unavailable"
                : `Sections ${sectionCount ?? 0}`;

            return (
              <Card
                key={resume.id}
                className="p-0 transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5 hover:border-primary-light"
              >
                <Link
                  to={resumeDetailPath(resume.id)}
                  className="block p-5 no-underline text-inherit min-w-0"
                >
                  <div className="font-semibold text-gray-900 break-words">
                    {resume.title}
                  </div>
                  <div className="text-muted text-sm mt-1">
                    {resume.targetRole || "—"}
                  </div>
                  <div className="text-muted text-sm mt-1">{sectionsLabel}</div>
                  <div className="text-muted text-sm mt-1">
                    Updated {formatDate(resume.updatedAt)}
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
