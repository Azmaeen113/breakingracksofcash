import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome, Admin!');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-dark p-4">
      <div className="admin-card w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">BR4C Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="admin-input pl-10"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="admin-input pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
