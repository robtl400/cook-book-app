import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function CommentItem({ comment, postOwnerId, onDelete, depth = 0 }) {
  const { user } = useAuth();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replies, setReplies] = useState(comment.replies ?? []);

  const canDelete =
    user && (user.id === comment.user_id || user.id === postOwnerId);

  async function handleReplySubmit(e) {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSubmittingReply(true);
    try {
      const data = await api.post(`/posts/${comment.post_id}/comments`, {
        body: replyBody.trim(),
        parent_id: comment.id,
      });
      const newReply = data.data ?? data;
      setReplies((prev) => [...prev, newReply]);
      setReplyBody('');
      setReplyOpen(false);
    } catch {
      // silent; user can retry
    } finally {
      setSubmittingReply(false);
    }
  }

  async function handleDeleteReply(replyId) {
    try {
      await api.delete(`/comments/${replyId}`);
      setReplies((prev) => prev.filter((r) => r.id !== replyId));
    } catch {
      // silent
    }
  }

  return (
    <div className={depth > 0 ? 'ml-6 border-l-2 border-warm-tan/50 pl-4' : ''}>
      <div className="py-3">
        <div className="flex items-center gap-2 mb-1">
          <Link
            to={`/users/${comment.user_id}`}
            className="text-sm font-medium text-ink hover:text-burnt-orange transition-colors"
          >
            {comment.user?.display_name || comment.user?.username || `User ${comment.user_id}`}
          </Link>
          <span className="text-xs text-warm-brown/60">{timeAgo(comment.created_at)}</span>
          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="ml-auto text-xs text-warm-brown/50 hover:text-red-500 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
        <p className="text-sm text-ink leading-relaxed">{comment.body}</p>
        {depth === 0 && user && (
          <button
            onClick={() => setReplyOpen((prev) => !prev)}
            className="mt-1 text-xs text-warm-brown/60 hover:text-burnt-orange transition-colors"
          >
            {replyOpen ? 'Cancel' : 'Reply'}
          </button>
        )}
      </div>

      {/* Reply form */}
      {replyOpen && (
        <form onSubmit={handleReplySubmit} className="mb-2 ml-0">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Write a reply…"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-warm-tan rounded-md bg-white text-ink focus:outline-none focus:border-burnt-orange resize-none"
          />
          <button
            type="submit"
            disabled={submittingReply || !replyBody.trim()}
            className="mt-1 px-4 py-1.5 text-xs bg-burnt-orange text-white rounded-md hover:bg-burnt-orange-dark disabled:opacity-60 transition-colors"
          >
            {submittingReply ? 'Posting…' : 'Post reply'}
          </button>
        </form>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mb-1">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postOwnerId={postOwnerId}
              onDelete={handleDeleteReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId, postOwnerId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBody, setNewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/posts/${postId}/comments`)
      .then((data) => setComments(data.data ?? data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newBody.trim()) return;
    setSubmitting(true);
    try {
      const data = await api.post(`/posts/${postId}/comments`, {
        body: newBody.trim(),
      });
      const comment = data.data ?? data;
      setComments((prev) => [comment, ...prev]);
      setNewBody('');
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId) {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      // silent
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-ink mb-4">
        Comments {comments.length > 0 && <span className="text-warm-brown font-normal text-base">({comments.length})</span>}
      </h2>

      {/* New comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Add a comment…"
            rows={3}
            className="w-full px-4 py-3 text-sm border border-warm-tan rounded-lg bg-white text-ink focus:outline-none focus:border-burnt-orange resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !newBody.trim()}
              className="px-5 py-2 text-sm bg-burnt-orange text-white rounded-md hover:bg-burnt-orange-dark disabled:opacity-60 transition-colors font-medium"
            >
              {submitting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-warm-brown mb-6">
          <Link to="/login" className="text-burnt-orange hover:underline font-medium">Log in</Link>{' '}
          to leave a comment.
        </p>
      )}

      {/* Comment list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-4 border-burnt-orange border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-warm-brown/70 text-center py-6">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="divide-y divide-warm-tan/40">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postOwnerId={postOwnerId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
