import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import AttributionBadge from './AttributionBadge';
import SaveToBoxModal from './SaveToBoxModal';
import { useAuth } from '../context/AuthContext';

function ImagePlaceholder() {
  return (
    <div className="w-full h-full bg-warm-tan flex items-center justify-center">
      <span className="text-4xl opacity-40">🍽</span>
    </div>
  );
}

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageSrc = post.image_url || post.parsed_image_url;
  const author = post.user;

  function handleCardClick() {
    navigate(`/posts/${post.id}`);
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-white border border-warm-tan rounded-xl overflow-hidden cursor-pointer hover:shadow-md hover:border-burnt-orange/30 transition-all"
      >
        {/* Hero image */}
        <div className="relative h-48 bg-warm-tan overflow-hidden">
          {imageSrc && !imgError ? (
            <img
              src={imageSrc}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <ImagePlaceholder />
          )}
        </div>

        <div className="p-4">
          {/* Title + description */}
          <h2 className="font-semibold text-ink text-base leading-snug line-clamp-2 mb-1">
            {post.title}
          </h2>
          {post.description && (
            <p className="text-sm text-warm-brown line-clamp-2 mb-2">{post.description}</p>
          )}

          {/* Author row */}
          {author && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-burnt-orange/20 flex items-center justify-center shrink-0">
                {author.profile_image_url ? (
                  <img
                    src={author.profile_image_url}
                    alt={author.display_name || author.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-burnt-orange font-semibold">
                    {(author.display_name || author.username || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <Link
                to={`/users/${author.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-warm-brown hover:text-burnt-orange transition-colors font-medium"
              >
                {author.display_name || author.username}
              </Link>
              <StarRating value={post.self_rating} size="sm" />
            </div>
          )}

          {/* Attribution */}
          <AttributionBadge
            sourceType={post.source_type}
            sourceUrl={post.source_url}
            sourcePost={post.source_post}
            sourcePostId={post.source_post_id}
            sourceCredit={post.source_credit}
            inspoPost={post.inspo_post}
            inspoPostId={post.inspo_post_id}
            compact
          />

          {/* Metadata chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.cook_time_minutes && (
              <span className="text-xs px-2 py-0.5 bg-cream-dark text-warm-brown rounded-full">
                ⏱ {post.cook_time_minutes}m
              </span>
            )}
            {post.difficulty && (
              <span className="text-xs px-2 py-0.5 bg-cream-dark text-warm-brown rounded-full capitalize">
                {post.difficulty}
              </span>
            )}
            {post.servings && (
              <span className="text-xs px-2 py-0.5 bg-cream-dark text-warm-brown rounded-full">
                {post.servings} servings
              </span>
            )}
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warm-tan/60">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/posts/${post.id}/cook`);
              }}
              className="flex-1 text-xs font-medium py-1.5 px-3 bg-burnt-orange text-white rounded-md hover:bg-burnt-orange-dark transition-colors"
            >
              I Cooked This
            </button>
            {user && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSaveModal(true);
                }}
                className="text-xs font-medium py-1.5 px-3 border border-warm-tan text-warm-brown rounded-md hover:border-burnt-orange hover:text-burnt-orange transition-colors"
              >
                Save
              </button>
            )}
            <Link
              to={`/posts/${post.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-warm-brown/70 hover:text-burnt-orange transition-colors ml-auto"
            >
              <span>💬</span>
              <span>Comments</span>
            </Link>
          </div>
        </div>
      </div>

      {showSaveModal && (
        <SaveToBoxModal
          postId={post.id}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </>
  );
}
