import { useParams } from 'react-router-dom';

export default function UserProfilePage() {
  const { id } = useParams();
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-ink mb-2">User Profile</h1>
      <p className="text-warm-brown">Profile for user #{id} — coming soon.</p>
    </div>
  );
}
