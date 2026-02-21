import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewResume from './pages/NewResume';
import ResumeDetail from './pages/ResumeDetail';
import EditResume from './pages/EditResume';
import Templates from './pages/Templates';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/resumes/new" element={<NewResume />} />
        <Route path="/resumes/:id" element={<ResumeDetail />} />
        <Route path="/resumes/:id/edit" element={<EditResume />} />
        <Route path="/templates" element={<Templates />} />
      </Route>
    </Routes>
  );
}
