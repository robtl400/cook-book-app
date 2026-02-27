import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';

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
    <div className={`${dim} rounded-full bg-warm-tan flex items-center justify-center font-bold text-warm-brown flex-shrink-0`}>
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
      onSave(res.data ?? res);
    } catch (err) {
      setError(err.message ?? 'Could not save changes.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ink">Edit Profile</h2>
          <button onClick={onClose} className="text-warm-brown hover:text-ink text-xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Display Name</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full border border-warm-tan rounded px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-burnt-orange"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              maxLength={300}
              className="w-full border border-warm-tan rounded px-3 py-2 text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-burnt-orange"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Profile Image URL</label>
            <input
              value={profileImageUrl}
              onChange={e => setProfileImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-warm-tan rounded px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-burnt-orange"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-warm-tan text-warm-brown rounded-lg text-sm hover:border-ink transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2 bg-burnt-orange text-white rounded-lg text-sm font-semibold hover:bg-burnt-orange-dark disabled:opacity-50 transition-colors"
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

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);

  const isOwn = currentUser && String(currentUser.id) === String(id);

  // Load profile + check follow status
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/users/${id}`);
        const p = res.data ?? res;
        setProfile(p);
        setFollowerCount(p.follower_count ?? 0);

        // Check if current user follows this profile
        if (currentUser && !isOwn) {
          try {
            const fRes = await api.get(`/users/${id}/followers`);
            const followers = fRes.data ?? fRes;
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
  }, [id, currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load posts tab
  useEffect(() => {
    if (activeTab !== 'posts') return;
    setPostsLoading(true);
    api.get(`/users/${id}/posts`)
      .then(res => setPosts(res.data ?? res))
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, [activeTab, id]);

  // Load boxes tab
  useEffect(() => {
    if (activeTab !== 'boxes') return;
    setBoxesLoading(true);
    api.get(`/users/${id}/boxes`)
      .then(res => setBoxes(res.data ?? res))
      .catch(() => setBoxes([]))
      .finally(() => setBoxesLoading(false));
  }, [activeTab, id]);

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
      } else {
        await api.post(`/users/${id}/follow`);
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
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-burnt-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-red-500">{error || 'Profile not found.'}</p>
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
            <h1 className="text-2xl font-bold text-ink">
              {profile.display_name || profile.username}
            </h1>
            {isOwn ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="text-sm px-3 py-1 border border-warm-tan text-warm-brown rounded-lg hover:border-ink transition-colors"
              >
                Edit Profile
              </button>
            ) : currentUser && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`text-sm px-4 py-1 rounded-lg font-medium transition-colors ${
                  isFollowing
                    ? 'bg-cream-dark text-warm-brown border border-warm-tan hover:bg-warm-tan'
                    : 'bg-burnt-orange text-white hover:bg-burnt-orange-dark'
                } disabled:opacity-50`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <p className="text-sm text-warm-brown mt-0.5">@{profile.username}</p>

          {profile.bio && (
            <p className="text-sm text-ink mt-2 leading-relaxed">{profile.bio}</p>
          )}

          {followError && <p className="text-red-500 text-xs mt-1">{followError}</p>}

          <div className="flex gap-4 mt-3 text-sm text-warm-brown">
            <span><strong className="text-ink">{profile.post_count ?? 0}</strong> Recipes</span>
            <span><strong className="text-ink">{followerCount}</strong> Followers</span>
            <span><strong className="text-ink">{profile.following_count ?? 0}</strong> Following</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-warm-tan mb-6">
        {['posts', 'boxes'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-burnt-orange text-burnt-orange'
                : 'border-transparent text-warm-brown hover:text-ink'
            }`}
          >
            {tab === 'posts' ? 'Recipes' : 'Recipe Boxes'}
          </button>
        ))}
      </div>

      {/* ── Posts tab ── */}
      {activeTab === 'posts' && (
        postsLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-4 border-burnt-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-warm-brown text-center py-12">No recipes yet.</p>
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
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-4 border-burnt-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : boxes.length === 0 ? (
          <p className="text-warm-brown text-center py-12">No recipe boxes yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {boxes.map(box => (
              <Link
                key={box.id}
                to={`/boxes/${box.id}`}
                className="block bg-white border border-warm-tan rounded-xl p-4 hover:shadow-md hover:border-burnt-orange/30 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-ink text-base">{box.name}</h3>
                  {box.is_default && (
                    <span className="text-xs px-2 py-0.5 bg-cream-dark text-warm-brown rounded-full flex-shrink-0">
                      Default
                    </span>
                  )}
                </div>
                {box.description && (
                  <p className="text-sm text-warm-brown mt-1 line-clamp-2">{box.description}</p>
                )}
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
          }}
        />
      )}
    </div>
  );
}
