import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/use-auth';
import { Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (login(username, pin)) {
      navigate('/dashboard');
    } else {
      setError('Invalid username or PIN');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1e5f74] rounded-full mb-4">
            <span className="text-white text-3xl">🚀</span>
          </div>
          <h1 className="text-3xl mb-1 text-[#1e5f74]">Launch Lab Bank</h1>
          <p className="text-[#4fb3c6] text-sm mb-2">Lead. Learn. Launch.</p>
          <p className="text-gray-600 text-sm">Bloomfield Hills Schools</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4fb3c6] focus:border-transparent bg-white"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">PIN</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4fb3c6] focus:border-transparent bg-white"
                placeholder="Enter your PIN"
                maxLength={4}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#1e5f74] text-white py-3 rounded-xl hover:bg-[#0d3d4d] transition-colors"
          >
            Log In
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-gray-600 mb-2">Demo Accounts:</p>
          <p className="text-xs text-gray-500">Student: emma.w / 1234</p>
          <p className="text-xs text-gray-500">Finance: finance / 5678</p>
          <p className="text-xs text-gray-500">Admin: admin / 9999</p>
        </div>
      </div>
    </div>
  );
}
