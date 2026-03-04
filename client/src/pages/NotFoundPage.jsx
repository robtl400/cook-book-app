import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-surface px-4 text-center">
      <h1 className="text-6xl font-bold text-border mb-4">404</h1>
      <p className="text-xl text-text mb-2">Page not found</p>
      <p className="text-text-muted mb-8">This recipe seems to have gone missing.</p>
      <Link
        to="/"
        className="px-5 py-2 bg-cta text-white font-medium rounded-sm hover:bg-cta-dark transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
