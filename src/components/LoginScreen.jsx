import { useState } from 'react';

const AUTH_USERNAME = import.meta.env.VITE_AUTH_USERNAME;
const AUTH_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD;

function LoginScreen({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
      setError('');
      onSuccess();
    } else {
      setError('Incorrect username or password.');
    }
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
          <p className="text-xs text-zinc-400 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              className="w-full text-sm px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-zinc-700"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full text-sm px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-zinc-700"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm cursor-pointer transition-colors mt-2"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginScreen;
