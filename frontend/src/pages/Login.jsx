import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_USERS = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
  { id: 2, username: 'cashier1', password: 'cashier123', role: 'user', name: 'Cashier One' },
  { id: 3, username: 'cashier2', password: 'cashier123', role: 'user', name: 'Cashier Two' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { currentUser, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' ? '/admin' : '/user', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
      login(user);
      setLoginError('');
      navigate(user.role === 'admin' ? '/admin' : '/user', { replace: true });
    } else {
      setLoginError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl mb-4 shadow-lg shadow-violet-500/50">
              <ShoppingCart className="w-8 h-8 text-white" aria-hidden />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">BillMaster</h1>
            <p className="text-slate-400">Smart Billing for Modern Stores</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-username" className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>
            <div className="relative">
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition pr-12"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm" role="alert">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold py-3 rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/30"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-slate-400 text-sm mb-4">Don't have an account?</p>
            <button
              onClick={() => navigate('/register')}
              className="text-violet-400 hover:text-violet-300 font-medium text-sm transition-colors hover:underline"
            >
              Register as a new Cashier
            </button>
            <p className="mt-4 text-[10px] text-slate-500 font-medium tracking-tight">
              Powered by Forge India Connect
            </p>
          </div>
        </div>
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl" aria-hidden />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-2xl" aria-hidden />
      </div>
    </div>
  );
};

export default LoginPage;
