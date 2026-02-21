import { Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import NewResume from '../pages/NewResume';
import ResumeDetail from '../pages/ResumeDetail';
import EditResume from '../pages/EditResume';
import Templates from '../pages/Templates';
import { APP_PATHS } from './paths';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={APP_PATHS.home} element={<Dashboard />} />
        <Route path={APP_PATHS.resumeNew} element={<NewResume />} />
        <Route path={APP_PATHS.resumeDetailPattern} element={<ResumeDetail />} />
        <Route path={APP_PATHS.resumeEditPattern} element={<EditResume />} />
        <Route path={APP_PATHS.templates} element={<Templates />} />
      </Route>
    </Routes>
  );
}
