import { useState, useEffect } from 'react';
import { listResumes } from '../api/resumes.js';
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
        <div className="bg-error/10 border border-error/30 text-error rounded-lg p-4">
          <p>{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 px-4 py-2 bg-error text-white rounded font-medium hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Resumes</h1>
      <div className="space-y-4">
        {resumes.map((r) => (
          <div
            key={r.id}
            className="bg-surface rounded-lg border border-gray-200 p-5"
          >
            <div className="font-semibold text-gray-900">{r.title}</div>
            <div className="text-muted text-sm mt-1">
              {r.targetRole || '—'}
            </div>
            <div className="text-muted text-sm mt-1">
              Updated {formatDate(r.updatedAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
