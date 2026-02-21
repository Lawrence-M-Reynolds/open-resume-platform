import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-xl font-semibold text-primary hover:text-primary-dark transition-colors duration-200"
          >
            Open Resume
          </Link>
          <nav>
            <Link
              to="/"
              className="text-muted hover:text-primary transition-colors duration-200 font-medium"
            >
              Resumes
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
