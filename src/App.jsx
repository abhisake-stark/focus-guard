import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LoginScreen from './components/LoginScreen';
import Tracker from './components/Tracker';
import TaskList from './components/TaskList';
import Dashboard from './components/Dashboard';
import { DEFAULT_TARGET_HOURS } from './utils/format';
import './index.css';

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [targetHours, setTargetHours] = useState(() => {
    const raw = localStorage.getItem('focus_target_hours');
    const n = raw ? Number(raw) : DEFAULT_TARGET_HOURS;
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_TARGET_HOURS;
  });
  const [activeTracker, setActiveTracker] = useState({
    isTracking: false,
    startTime: null,
    category: 'Social Media',
    note: '',
  });
  const [sessions, setSessions] = useState(() => {
    const raw = localStorage.getItem('focus_sessions');
    return raw ? JSON.parse(raw) : [];
  });
  const [tasks, setTasks] = useState(() => {
    const raw = localStorage.getItem('focus_tasks');
    return raw ? JSON.parse(raw) : [];
  });

  // Listen for Supabase auth state (login, logout, token refresh)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('focus_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('focus_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('focus_target_hours', String(targetHours));
  }, [targetHours]);

  const handleSessionComplete = (session) => {
    setSessions((prev) => [session, ...prev]);
  };

  const handleAddTask = (task) => setTasks((prev) => [task, ...prev]);
  const handleToggleTask = (id) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const handleDeleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 gap-2">
      <div className="w-full max-w-sm flex justify-between items-center mb-2">
        <p className="text-xs text-zinc-400">{session.user.email}</p>
        <button onClick={handleLogout} className="text-xs text-rose-400">
          Log out
        </button>
      </div>
      <Dashboard sessions={sessions} targetHours={targetHours} setTargetHours={setTargetHours} />
      <Tracker
        activeTracker={activeTracker}
        setActiveTracker={setActiveTracker}
        onSessionComplete={handleSessionComplete}
      />
      <TaskList
        tasks={tasks}
        onAddTask={handleAddTask}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
}

export default App;
