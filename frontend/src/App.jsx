import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewResume from './pages/NewResume.jsx';
import ResumeDetail from './pages/ResumeDetail.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/resumes/new" element={<NewResume />} />
        <Route path="/resumes/:id" element={<ResumeDetail />} />
      </Route>
    </Routes>
  );
}
