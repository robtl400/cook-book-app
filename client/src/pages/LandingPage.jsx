import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [previewPosts, setPreviewPosts] = useState([]);

  useEffect(() => {
    api.get('/explore?sort=most_saved&limit=3')
      .then(data => setPreviewPosts((data.posts ?? []).slice(0, 3)))
      .catch(() => {});
  }, []);

  if (loading) return null;
  if (user) return <Navigate to="/feed" replace />;

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] bg-surface px-4 text-center pt-24 pb-16">
      <h1 className="text-5xl font-bold text-text mb-4">Cook<span className="text-accent">Book</span></h1>
      <p className="text-xl text-text-muted mb-10 max-w-md">
        Share what you actually cook.
      </p>
      <div className="flex gap-4">
        <Link
          to="/register"
          className="px-6 py-3 bg-cta text-white font-semibold rounded-sm hover:bg-cta-dark transition-colors"
        >
          Get started
        </Link>
        <Link
          to="/login"
          className="px-6 py-3 border border-border text-text font-semibold rounded-sm hover:border-cta hover:text-accent transition-colors"
        >
          Log in
        </Link>
      </div>

      {previewPosts.length > 0 && (
        <div className="mt-16 w-full max-w-5xl mx-auto px-4">
          <p className="text-sm text-text-dim text-center mb-6 uppercase tracking-wide">
            See what people are cooking
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {previewPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
