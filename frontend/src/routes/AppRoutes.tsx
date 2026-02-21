import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { APP_PATHS } from './paths';

const DashboardPage = lazy(() => import('../pages/Dashboard'));
const NewResumePage = lazy(() => import('../pages/NewResume'));
const ResumeDetailPage = lazy(() => import('../pages/ResumeDetail'));
const EditResumePage = lazy(() => import('../pages/EditResume'));
const TemplatesPage = lazy(() => import('../pages/Templates'));

function RouteFallback() {
  return <LoadingSkeleton count={1} />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path={APP_PATHS.home}
          element={
            <Suspense fallback={<RouteFallback />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path={APP_PATHS.resumeNew}
          element={
            <Suspense fallback={<RouteFallback />}>
              <NewResumePage />
            </Suspense>
          }
        />
        <Route
          path={APP_PATHS.resumeDetailPattern}
          element={
            <Suspense fallback={<RouteFallback />}>
              <ResumeDetailPage />
            </Suspense>
          }
        />
        <Route
          path={APP_PATHS.resumeEditPattern}
          element={
            <Suspense fallback={<RouteFallback />}>
              <EditResumePage />
            </Suspense>
          }
        />
        <Route
          path={APP_PATHS.templates}
          element={
            <Suspense fallback={<RouteFallback />}>
              <TemplatesPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
