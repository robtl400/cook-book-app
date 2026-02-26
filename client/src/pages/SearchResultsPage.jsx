import { useSearchParams } from 'react-router-dom';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-ink mb-2">Search Results</h1>
      {query && <p className="text-warm-brown">Results for &ldquo;{query}&rdquo; — coming soon.</p>}
    </div>
  );
}
