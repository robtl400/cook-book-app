import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { user, register: authRegister } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  if (user) return <Navigate to="/feed" replace />;

  const onSubmit = async ({ email, username, display_name, password, confirm_password }) => {
    if (password !== confirm_password) {
      setError('confirm_password', { message: 'Passwords do not match.' });
      return;
    }
    try {
      await authRegister({ email, username, display_name, password });
      navigate('/feed');
    } catch (err) {
      setError('root', { message: err.message || 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-cream px-4 py-8">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-ink mb-6 text-center">Create your account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {errors.root.message}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full px-3 py-2 border border-warm-tan rounded-md bg-white text-ink focus:outline-none focus:border-burnt-orange"
              {...register('email', { required: 'Email is required.' })}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="w-full px-3 py-2 border border-warm-tan rounded-md bg-white text-ink focus:outline-none focus:border-burnt-orange"
              {...register('username', {
                required: 'Username is required.',
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores.',
                },
              })}
            />
            {errors.username && (
              <p className="text-xs text-red-600 mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1" htmlFor="display_name">
              Display name
            </label>
            <input
              id="display_name"
              type="text"
              autoComplete="name"
              className="w-full px-3 py-2 border border-warm-tan rounded-md bg-white text-ink focus:outline-none focus:border-burnt-orange"
              {...register('display_name', { required: 'Display name is required.' })}
            />
            {errors.display_name && (
              <p className="text-xs text-red-600 mt-1">{errors.display_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-warm-tan rounded-md bg-white text-ink focus:outline-none focus:border-burnt-orange"
              {...register('password', {
                required: 'Password is required.',
                minLength: { value: 8, message: 'Password must be at least 8 characters.' },
              })}
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1" htmlFor="confirm_password">
              Confirm password
            </label>
            <input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-warm-tan rounded-md bg-white text-ink focus:outline-none focus:border-burnt-orange"
              {...register('confirm_password', { required: 'Please confirm your password.' })}
            />
            {errors.confirm_password && (
              <p className="text-xs text-red-600 mt-1">{errors.confirm_password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-burnt-orange text-white font-semibold rounded-md hover:bg-burnt-orange-dark disabled:opacity-60 transition-colors"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-warm-brown">
          Already have an account?{' '}
          <Link to="/login" className="text-burnt-orange hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
