import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-red-500">403 - Unauthorized</h1>
      <p className="mt-2">You do not have permission to view this page.</p>
      <Link to="/" className="mt-4 text-blue-600 underline">Back to Login</Link>
    </div>
  );
}