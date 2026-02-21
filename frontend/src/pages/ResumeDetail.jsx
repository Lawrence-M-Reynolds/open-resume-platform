import { useParams } from 'react-router-dom';

export default function ResumeDetail() {
  const { id } = useParams();
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800">Resume</h1>
      <p className="text-muted mt-2">ID: {id}</p>
    </div>
  );
}
