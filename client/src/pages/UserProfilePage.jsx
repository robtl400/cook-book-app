import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';
import Spinner from '../components/Spinner';

function Avatar({ user, size = 'lg' }) {
  const [imgError, setImgError] = useState(false);
  const dim = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-base';
  const initial = (user?.display_name || user?.username || '?')[0].toUpperCase();

  if (user?.profile_image_url && !imgError) {
    return (
      <img
        src={user.profile_image_url}
        alt={user.display_name || user.username}
        className={`${dim} rounded-full object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-surface-input flex items-center justify-center font-bold text-text-muted flex-shrink-0`}>
      {initial}
    </div>
  );
}

function EditProfileModal({ profile, onClose, onSave }) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [profileImageUrl, setProfileImageUrl] = useState(profile.profile_image_url ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setLoading(true);
    setError('');
    try {
      const res = await api.patch(`/users/${profile.id}`, {
        display_name: displayName || undefined,
        bio: bio || undefined,
        profile_image_url: profileImageUrl || undefined,
      });
      onSave(res);
    } catch (err) {
      setError(err.message ?? 'Could not save changes.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-raised rounded shadow-xl w-full max-w-md p-6 border border-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text">Edit Profile</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text text-xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Display Name</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full border border-border rounded px-3 py-2 text-sm text-text bg-surface-input focus:outline-none focus:ring-2 focus:ring-cta"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              maxLength={300}
              className="w-full border border-border rounded px-3 py-2 text-sm text-text bg-surface-input resize-none focus:outline-none focus:ring-2 focus:ring-cta"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Profile Image URL</label>
            <input
              value={profileImageUrl}
              onChange={e => setProfileImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-border rounded px-3 py-2 text-sm text-text bg-surface-input focus:outline-none focus:ring-2 focus:ring-cta"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-border text-text-muted rounded-sm text-sm hover:border-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2 bg-cta text-white rounded-sm text-sm font-semibold hover:bg-cta-dark disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [boxes, setBoxes] = useState([]);
  const [boxesLoading, setBoxesLoading] = useState(false);

  // For "View Recipe Box" link on other profiles
  const [recipeBoxId, setRecipeBoxId] = useState(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const isOwn = currentUser && String(currentUser.id) === String(id);

  // Load profile + check follow status
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const p = await api.get(`/users/${id}`);
        setProfile(p);
        setFollowerCount(p.follower_count ?? 0);

        // Check if current user follows this profile
        if (currentUser && !isOwn) {
          try {
            const followers = await api.get(`/users/${id}/followers`);
            setIsFollowing(followers.some(f => String(f.id) === String(currentUser.id)));
          } catch { /* ignore */ }
        }
      } catch (err) {
        setError(err.message ?? 'Could not load profile.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, currentUser?.id, retryCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load posts tab
  useEffect(() => {
    if (activeTab !== 'posts') return;
    setPostsLoading(true);
    api.get(`/users/${id}/posts`)
      .then(res => setPosts(res))
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, [activeTab, id]);

  // Load boxes tab
  useEffect(() => {
    if (activeTab !== 'boxes') return;
    setBoxesLoading(true);
    api.get(`/users/${id}/boxes`)
      .then(res => setBoxes(res ?? []))
      .catch(() => setBoxes([]))
      .finally(() => setBoxesLoading(false));
  }, [activeTab, id]);

  // Load Recipe Box ID for other profiles (for the "View Recipe Box" link)
  useEffect(() => {
    if (isOwn) return;
    api.get(`/users/${id}/boxes`)
      .then(res => {
        const allBoxes = res;
        const recipeBox = allBoxes.find(b => b.box_type === 'liked');
        if (recipeBox) setRecipeBoxId(recipeBox.id);
      })
      .catch(() => {});
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFollow() {
    if (!currentUser) return;
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowerCount(c => wasFollowing ? c - 1 : c + 1);
    setFollowLoading(true);
    setFollowError('');
    try {
      if (wasFollowing) {
        await api.delete(`/users/${id}/follow`);
        toast.success('Unfollowed.');
      } else {
        await api.post(`/users/${id}/follow`);
        toast.success(`Following ${profile?.display_name || profile?.username}!`);
      }
    } catch (err) {
      // Revert optimistic update
      setIsFollowing(wasFollowing);
      setFollowerCount(c => wasFollowing ? c + 1 : c - 1);
      setFollowError(err.message ?? 'Could not update follow status.');
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return <Spinner />;
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-red-400 mb-4">{error || 'Profile not found.'}</p>
        <button
          onClick={() => { setError(''); setRetryCount(c => c + 1); }}
          className="text-sm text-accent hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* ── Profile header ── */}
      <div className="flex gap-5 items-start mb-6">
        <Avatar user={profile} size="lg" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-text">
              {profile.display_name || profile.username}
            </h1>
            {isOwn ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="text-sm px-3 py-1 border border-border text-text-muted rounded-sm hover:border-text transition-colors"
              >
                Edit Profile
              </button>
            ) : currentUser && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`text-sm px-4 py-1 rounded-sm font-medium transition-colors ${
                  isFollowing
                    ? 'bg-surface-input text-text-muted border border-border hover:bg-border'
                    : 'bg-cta text-white hover:bg-cta-dark'
                } disabled:opacity-50`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <p className="text-sm text-text-muted mt-0.5">@{profile.username}</p>

          {profile.bio && (
            <p className="text-sm text-text mt-2 leading-relaxed">{profile.bio}</p>
          )}

          {followError && <p className="text-red-400 text-xs mt-1">{followError}</p>}

          <div className="flex gap-4 mt-3 text-sm text-text-muted">
            <span><strong className="text-text">{profile.post_count ?? 0}</strong> Recipes</span>
            <span><strong className="text-text">{followerCount}</strong> Followers</span>
            <span><strong className="text-text">{profile.following_count ?? 0}</strong> Following</span>
          </div>

          {/* Recipe Box link */}
          {isOwn ? (
            <Link
              to="/recipe-box"
              className="inline-flex items-center gap-1 text-sm text-accent hover:underline mt-3"
            >
              My Recipe Box →
            </Link>
          ) : recipeBoxId ? (
            <Link
              to={`/boxes/${recipeBoxId}`}
              className="inline-flex items-center gap-1 text-sm text-accent hover:underline mt-3"
            >
              View My Recipe Box →
            </Link>
          ) : null}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
            activeTab === 'posts'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          Recipes
        </button>
        <button
          onClick={() => setActiveTab('boxes')}
          className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
            activeTab === 'boxes'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          Recipe Boxes
        </button>
      </div>

      {/* ── Posts tab ── */}
      {activeTab === 'posts' && (
        postsLoading ? (
          <Spinner size="sm" />
        ) : posts.length === 0 ? (
          isOwn ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">📖</div>
              <h2 className="text-xl font-semibold text-text mb-2">Your cookbook is empty</h2>
              <p className="text-text-muted text-sm mb-6 max-w-xs">
                Share your first recipe to start building your collection.
              </p>
              <Link
                to="/posts/new"
                className="px-5 py-2 bg-cta text-white rounded-sm text-sm font-medium hover:opacity-90 transition-opacity"
              >
                + New Recipe
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🍳</div>
              <h2 className="text-xl font-semibold text-text mb-2">No recipes yet</h2>
              <p className="text-text-muted text-sm max-w-xs">
                {profile.display_name || profile.username} hasn&apos;t posted any recipes yet.
              </p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )
      )}

      {/* ── Boxes tab ── */}
      {activeTab === 'boxes' && (
        boxesLoading ? (
          <Spinner size="sm" />
        ) : boxes.length === 0 ? (
          <p className="text-text-muted text-center py-12">No public recipe boxes.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {boxes.map(box => (
              <Link
                key={box.id}
                to={`/boxes/${box.id}`}
                className="p-4 bg-surface-raised border border-border rounded hover:border-cta/40 transition-all"
              >
                <h3 className="font-semibold text-text">{box.name}</h3>
                <p className="text-sm text-text-muted mt-1">{box.post_count ?? 0} recipes</p>
              </Link>
            ))}
          </div>
        )
      )}

      {/* ── Edit profile modal ── */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={updated => {
            setProfile(prev => ({ ...prev, ...updated }));
            setShowEditModal(false);
            toast.success('Profile updated!');
          }}
        />
      )}
    </div>
  );
}
