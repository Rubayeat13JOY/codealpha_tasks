import React, { useState } from 'react';
import { Mail, Lock, User, LogIn, ArrowRight } from 'lucide-react';

interface LoginRegisterProps {
  onSuccess: (token: string, user: { id: string; name: string; email: string }) => void;
}

export default function LoginRegister({ onSuccess }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = isLogin ? { email, password } : { name, email, password };
    const url = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      onSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center p-3.5 bg-white/5 rounded-xl border border-white/10 text-indigo-400 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.15)] animate-pulse">
          <LogIn size={26} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1.5 font-sans">
          {isLogin ? 'Sign In' : 'Create Free Account'}
        </h2>
        <p className="text-sm text-slate-400">
          {isLogin ? 'Access your collaborative workspace' : 'Get started in seconds'}
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 rounded-xl text-sm bg-red-500/10 border border-red-550/20 text-red-400 font-sans relative z-10">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        {!isLogin && (
          <div>
            <label className="block text-xs font-semibold text-slate-405 uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <User size={18} />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans backdrop-blur-sm"
                placeholder="Ex. Jane Doe"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-405 uppercase tracking-wider mb-1.5">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Mail size={18} />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans backdrop-blur-sm"
              placeholder="name@company.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-405 uppercase tracking-wider mb-1.5">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Lock size={18} />
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans backdrop-blur-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-indigo-650 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-indigo-500/30"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{isLogin ? 'Sign In' : 'Register Now'}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Toggler */}
      <div className="text-center mt-6 text-sm text-slate-400 relative z-10 font-sans border-t border-white/10 pt-4">
        {isLogin ? "Don't have an account?" : 'Already registered?'}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-indigo-400 hover:text-indigo-300 font-semibold ml-1.5 focus:outline-none cursor-pointer"
        >
          {isLogin ? 'Sign up for free' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}
