import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-cream px-4 text-center">
      <h1 className="text-6xl font-bold text-warm-tan mb-4">404</h1>
      <p className="text-xl text-ink mb-2">Page not found</p>
      <p className="text-warm-brown mb-8">This recipe seems to have gone missing.</p>
      <Link
        to="/"
        className="px-5 py-2 bg-burnt-orange text-white font-medium rounded-md hover:bg-burnt-orange-dark transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
