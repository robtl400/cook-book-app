import { useParams } from 'react-router-dom';

export default function PostDetailPage() {
  const { id } = useParams();
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-ink mb-2">Recipe Post</h1>
      <p className="text-warm-brown">Post detail for #{id} — coming soon.</p>
    </div>
  );
}
