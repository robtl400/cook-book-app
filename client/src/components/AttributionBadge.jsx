import { Link } from 'react-router-dom';

/**
 * AttributionBadge — shows source and optional inspo for a recipe post.
 *
 * Props:
 *   sourceType: 'original' | 'external' | 'internal' | 'credit'
 *   sourceUrl: string | null      (for external)
 *   sourcePost: object | null     (nested RecipePostListSchema, for internal)
 *   sourcePostId: number | null   (fallback for internal when sourcePost not nested)
 *   sourceCredit: string | null   (for credit)
 *   inspoPost: object | null      (nested post with .user.username, for inspo display)
 *   inspoPostId: number | null    (fallback inspo id)
 *   compact: bool                 (smaller rendering for feed cards)
 */
export default function AttributionBadge({
  sourceType,
  sourceUrl,
  sourcePost,
  sourcePostId,
  sourceCredit,
  inspoPost,
  inspoPostId,
  compact = false,
}) {
  const textSize = compact ? 'text-xs' : 'text-sm';
  const baseClass = `inline-flex items-center gap-1 ${textSize} text-warm-brown`;

  function truncateUrl(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, '');
      return host.length > 30 ? host.slice(0, 30) + '…' : host;
    } catch {
      return url.length > 35 ? url.slice(0, 35) + '…' : url;
    }
  }

  let sourceNode = null;

  if (sourceType === 'original') {
    sourceNode = (
      <span className={`${baseClass} bg-cream-dark px-2 py-0.5 rounded-full font-medium`}>
        <span>✦</span>
        <span>Original Recipe</span>
      </span>
    );
  } else if (sourceType === 'external' && sourceUrl) {
    sourceNode = (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`${baseClass} hover:text-burnt-orange transition-colors`}
      >
        <span>↗</span>
        <span>{truncateUrl(sourceUrl)}</span>
      </a>
    );
  } else if (sourceType === 'internal') {
    const post = sourcePost;
    const postId = post?.id ?? sourcePostId;
    const postTitle = post?.title;
    sourceNode = postId ? (
      <Link
        to={`/posts/${postId}`}
        onClick={(e) => e.stopPropagation()}
        className={`${baseClass} hover:text-burnt-orange transition-colors`}
      >
        <span>↩</span>
        <span>Based on {postTitle ? `"${postTitle}"` : 'another recipe'}</span>
      </Link>
    ) : null;
  } else if (sourceType === 'credit' && sourceCredit) {
    sourceNode = (
      <span className={baseClass}>
        <span>📖</span>
        <span>{sourceCredit}</span>
      </span>
    );
  }

  let inspoNode = null;
  if (inspoPost) {
    inspoNode = (
      <Link
        to={`/posts/${inspoPost.id}`}
        onClick={(e) => e.stopPropagation()}
        className={`${baseClass} hover:text-burnt-orange transition-colors`}
      >
        <span>✦</span>
        <span>Inspired by {inspoPost.user?.username ?? 'another cook'}</span>
      </Link>
    );
  } else if (inspoPostId) {
    inspoNode = (
      <Link
        to={`/posts/${inspoPostId}`}
        onClick={(e) => e.stopPropagation()}
        className={`${baseClass} hover:text-burnt-orange transition-colors`}
      >
        <span>✦</span>
        <span>Inspired by another cook</span>
      </Link>
    );
  }

  if (!sourceNode && !inspoNode) return null;

  return (
    <div className={`flex flex-wrap gap-x-3 gap-y-1 ${compact ? 'mt-1' : 'mt-2'}`}>
      {sourceNode}
      {inspoNode}
    </div>
  );
}
