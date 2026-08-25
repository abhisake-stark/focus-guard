import { useState } from 'react';
import { supabase } from '../lib/supabase';

function LoginScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    }
    // On success, Supabase fires an onAuthStateChange event —
    // App.jsx listens for that and updates isAuthed automatically.
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm p-8 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm shadow-zinc-200/60 dark:shadow-none">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white text-base shadow-sm mb-3">
            ◎
          </div>
          <h1 className="font-semibold text-zinc-700 dark:text-zinc-200 tracking-tight">
            FocusGuard
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              autoComplete="email"
              className="w-full text-sm px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-zinc-700"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full text-sm px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-zinc-700"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm cursor-pointer transition-colors mt-2 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="w-full text-center text-xs text-zinc-400 mt-4"
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

export default LoginScreen;
