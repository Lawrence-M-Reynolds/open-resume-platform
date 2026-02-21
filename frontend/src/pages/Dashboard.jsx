import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listResumes } from '../api/resumes.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import { formatDate } from '../utils/date.js';

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listResumes();
      setResumes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Resumes
        </h1>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Resumes
        </h1>
        <ErrorBanner
          message={error}
          action={<Button variant="danger" onClick={load}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Resumes</h1>
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
        {resumes.map((r) => (
          <Card
            key={r.id}
            className="p-0 transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5 hover:border-primary-light"
          >
            <Link
              to={`/resumes/${r.id}`}
              className="block p-5 no-underline text-inherit"
            >
              <div className="font-semibold text-gray-900">{r.title}</div>
              <div className="text-muted text-sm mt-1">
                {r.targetRole || '—'}
              </div>
              <div className="text-muted text-sm mt-1">
                Updated {formatDate(r.updatedAt)}
              </div>
            </Link>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
