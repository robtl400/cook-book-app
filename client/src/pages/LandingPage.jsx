import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/feed" replace />;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-cream px-4 text-center">
      <h1 className="text-5xl font-bold text-ink mb-4">CookBook</h1>
      <p className="text-xl text-warm-brown mb-10 max-w-md">
        Share what you actually cook.
      </p>
      <div className="flex gap-4">
        <Link
          to="/register"
          className="px-6 py-3 bg-burnt-orange text-white font-semibold rounded-lg hover:bg-burnt-orange-dark transition-colors"
        >
          Get started
        </Link>
        <Link
          to="/login"
          className="px-6 py-3 border border-warm-tan text-ink font-semibold rounded-lg hover:border-burnt-orange hover:text-burnt-orange transition-colors"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
