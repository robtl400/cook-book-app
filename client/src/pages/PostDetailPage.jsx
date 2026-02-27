import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import AttributionBadge from '../components/AttributionBadge';
import CommentSection from '../components/CommentSection';
import SaveToBoxModal from '../components/SaveToBoxModal';

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-burnt-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function DifficultyBadge({ difficulty }) {
  const colors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  };
  const cls = colors[difficulty?.toLowerCase()] ?? 'bg-cream-dark text-warm-brown';
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${cls}`}>
      {difficulty}
    </span>
  );
}

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get(`/posts/${id}`)
      .then((data) => setPost(data.data ?? data))
      .catch((err) => setError(err.message || 'Post not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/posts/${id}`);
      navigate(-1);
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (loading) return <Spinner />;

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-warm-brown text-lg">{error || 'Post not found.'}</p>
        <Link to="/" className="mt-4 inline-block text-burnt-orange hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === post.user_id;
  const imageSrc = imgError ? null : (post.image_url || post.parsed_image_url);
  const ingredients = [...(post.ingredients ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const steps = [...(post.steps ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero image */}
        {imageSrc ? (
          <div className="rounded-xl overflow-hidden mb-6 h-64 sm:h-80 bg-warm-tan">
            <img
              src={imageSrc}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="rounded-xl mb-6 h-48 bg-warm-tan flex items-center justify-center">
            <span className="text-6xl opacity-30">🍽</span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold text-ink mb-3">{post.title}</h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <StarRating value={post.self_rating} />
          {post.cook_time_minutes && (
            <span className="text-sm text-warm-brown">⏱ {post.cook_time_minutes} min</span>
          )}
          {post.servings && (
            <span className="text-sm text-warm-brown">🍴 {post.servings} servings</span>
          )}
          {post.difficulty && <DifficultyBadge difficulty={post.difficulty} />}
          {post.user && (
            <Link
              to={`/users/${post.user_id}`}
              className="ml-auto flex items-center gap-1.5 text-sm text-warm-brown hover:text-burnt-orange transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-burnt-orange/20 flex items-center justify-center shrink-0 text-xs text-burnt-orange font-semibold">
                {post.user.profile_image_url ? (
                  <img
                    src={post.user.profile_image_url}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  (post.user.display_name || post.user.username || '?')[0].toUpperCase()
                )}
              </div>
              <span className="font-medium">{post.user.display_name || post.user.username}</span>
            </Link>
          )}
        </div>

        {/* Attribution */}
        <AttributionBadge
          sourceType={post.source_type}
          sourceUrl={post.source_url}
          sourcePost={post.source_post}
          sourcePostId={post.source_post_id}
          sourceCredit={post.source_credit}
          inspoPost={post.inspo_post}
          inspoPostId={post.inspo_post_id}
        />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-3 py-1 bg-cream-dark text-warm-brown rounded-full capitalize"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {post.description && (
          <p className="mt-5 text-ink leading-relaxed">{post.description}</p>
        )}

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-ink mb-3">Ingredients</h2>
            <ul className="space-y-2">
              {ingredients.map((ing) => (
                <li key={ing.id} className="flex items-baseline gap-2 text-sm text-ink">
                  <span className="w-1.5 h-1.5 rounded-full bg-burnt-orange mt-1 shrink-0" />
                  <span>
                    {ing.quantity != null && <strong>{ing.quantity} </strong>}
                    {ing.unit && <span className="text-warm-brown">{ing.unit} </span>}
                    {ing.name}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-ink mb-3">Instructions</h2>
            <ol className="space-y-4">
              {steps.map((step, idx) => (
                <li key={step.id} className="flex gap-4">
                  <span className="flex-none w-7 h-7 rounded-full bg-burnt-orange text-white text-sm font-semibold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-ink leading-relaxed pt-1">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mt-10 pt-6 border-t border-warm-tan">
          <button
            onClick={() => navigate(`/posts/${id}/cook`)}
            className="px-5 py-2.5 bg-burnt-orange text-white font-semibold rounded-lg hover:bg-burnt-orange-dark transition-colors text-sm"
          >
            I Cooked This
          </button>
          {user && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-5 py-2.5 border border-warm-tan text-ink font-semibold rounded-lg hover:border-burnt-orange hover:text-burnt-orange transition-colors text-sm"
            >
              Save to Box
            </button>
          )}
          {isOwner && (
            <>
              <button
                onClick={() => navigate(`/posts/${id}/edit`)}
                className="px-5 py-2.5 border border-warm-tan text-ink font-semibold rounded-lg hover:border-burnt-orange hover:text-burnt-orange transition-colors text-sm"
              >
                Edit
              </button>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-warm-brown">Delete this recipe?</span>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-60 transition-colors"
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 text-sm text-warm-brown hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-5 py-2.5 border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>

        {/* Comments */}
        <CommentSection postId={id} postOwnerId={post.user_id} />
      </div>

      {showSaveModal && (
        <SaveToBoxModal postId={id} onClose={() => setShowSaveModal(false)} />
      )}
    </>
  );
}
