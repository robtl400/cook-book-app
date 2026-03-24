import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  if (user) return <Navigate to="/feed" replace />;

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
      navigate('/feed');
    } catch (err) {
      setError('root', { message: err.message || 'Invalid email or password.' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-surface px-4">
      <div className="w-full max-w-sm bg-surface-auth rounded p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-[var(--color-text-on-light)] mb-6 text-center">Log in to CookBook</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {errors.root.message}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-on-light)] mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full px-3 py-2 border border-[var(--color-border-light)] rounded bg-surface-auth text-[var(--color-text-on-light)] focus:outline-none focus:border-cta"
              {...register('email', { required: 'Email is required.' })}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-on-light)] mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-[var(--color-border-light)] rounded bg-surface-auth text-[var(--color-text-on-light)] focus:outline-none focus:border-cta"
              {...register('password', { required: 'Password is required.' })}
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-cta text-white font-semibold rounded-sm hover:bg-cta-dark disabled:opacity-60 transition-colors"
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-[var(--color-text-on-light-muted)]">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-cta hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
