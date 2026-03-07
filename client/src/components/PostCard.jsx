import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import AttributionBadge from './AttributionBadge';
import SaveToBoxModal from './SaveToBoxModal';
import { useAuth } from '../context/AuthContext';

function ImagePlaceholder() {
  return <div className="w-full h-full bg-gradient-to-br from-cta/15 to-surface-input" />;
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
        className="bg-surface-raised border border-border rounded overflow-hidden cursor-pointer hover:shadow-md hover:border-cta/30 transition-all flex flex-col"
      >
        {/* Hero image */}
        <div className="relative h-48 bg-surface-input overflow-hidden">
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

        <div className="p-4 flex flex-col flex-1">
          {/* Title + description */}
          <h2 className="font-semibold text-text text-base leading-snug line-clamp-2 mb-1">
            {post.title}
          </h2>
          {post.description && (
            <p className="text-sm text-text-muted line-clamp-2 mb-2">{post.description}</p>
          )}

          {/* Author row */}
          {author && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-cta/20 flex items-center justify-center shrink-0">
                {author.profile_image_url ? (
                  <img
                    src={author.profile_image_url}
                    alt={author.display_name || author.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-accent font-semibold">
                    {(author.display_name || author.username || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <Link
                to={`/users/${author.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-text-muted hover:text-accent transition-colors font-medium"
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
          <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
            {post.cook_time_minutes && (
              <span className="text-xs px-2 py-0.5 bg-surface-input text-text-muted rounded-full">
                ⏱ {post.cook_time_minutes}m
              </span>
            )}
            {post.difficulty && (
              <span className="text-xs px-2 py-0.5 bg-surface-input text-text-muted rounded-full capitalize">
                {post.difficulty}
              </span>
            )}
            {post.servings && (
              <span className="text-xs px-2 py-0.5 bg-surface-input text-text-muted rounded-full">
                {post.servings} servings
              </span>
            )}
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border/60">
            {user && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSaveModal(true);
                }}
                className="flex-1 text-xs font-medium py-1.5 px-3 bg-cta text-white rounded-sm hover:bg-cta-dark transition-colors"
              >
                Save to My Recipe Box
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/posts/${post.id}/cook`);
              }}
              className="text-xs font-medium py-1.5 px-3 border border-border text-accent rounded-sm hover:border-accent transition-colors"
            >
              I Cooked This!
            </button>
            <Link
              to={`/posts/${post.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-text-dim hover:text-accent transition-colors ml-auto"
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
