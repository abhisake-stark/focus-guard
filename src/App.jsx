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
  const [dataLoading, setDataLoading] = useState(true);

  const [targetHours, setTargetHoursState] = useState(DEFAULT_TARGET_HOURS);
  const [activeTracker, setActiveTracker] = useState({
    isTracking: false,
    startTime: null,
    category: 'Social Media',
    note: '',
  });
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

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

  // Load tasks, sessions, and settings once logged in
  useEffect(() => {
    if (!session) return;

    const loadData = async () => {
      setDataLoading(true);

      const [tasksRes, sessionsRes, settingsRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('tracking_sessions').select('*').order('created_at', { ascending: false }),
        supabase.from('user_settings').select('*').eq('user_id', session.user.id).maybeSingle(),
      ]);

      if (tasksRes.data) setTasks(tasksRes.data);
      if (sessionsRes.data) {
        setSessions(
          sessionsRes.data.map((s) => ({
            id: s.id,
            category: s.category,
            note: s.note,
            durationMs: s.duration_ms,
          }))
        );
      }
      if (settingsRes.data) {
        setTargetHoursState(settingsRes.data.target_hours);
      } else {
        // First time login — create default settings row
        await supabase
          .from('user_settings')
          .insert({ user_id: session.user.id, target_hours: DEFAULT_TARGET_HOURS });
      }

      setDataLoading(false);
    };

    loadData();
  }, [session]);

  const handleSessionComplete = async (sess) => {
    if (!session) return;
    const { data, error } = await supabase
      .from('tracking_sessions')
      .insert({
        user_id: session.user.id,
        category: sess.category,
        note: sess.note,
        start_time: new Date(sess.startTime).toISOString(),
        end_time: new Date(sess.endTime).toISOString(),
        duration_ms: sess.durationMs,
      })
      .select()
      .single();

    if (error) {
      setErrorMsg('Failed to save tracking session. Please try again.');
      return;
    }
    setSessions((prev) => [
      { id: data.id, category: data.category, note: data.note, durationMs: data.duration_ms },
      ...prev,
    ]);
  };

  const handleAddTask = async (task) => {
    if (!session) return;
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: session.user.id,
        title: task.title,
        priority: task.priority,
        done: false,
      })
      .select()
      .single();

    if (error) {
      setErrorMsg('Failed to add task. Please try again.');
      return;
    }
    setTasks((prev) => [data, ...prev]);
  };

  const handleToggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const { error } = await supabase.from('tasks').update({ done: !task.done }).eq('id', id);
    if (error) {
      setErrorMsg('Failed to update task. Please try again.');
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleDeleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      setErrorMsg('Failed to delete task. Please try again.');
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const setTargetHours = async (hours) => {
    setTargetHoursState(hours);
    if (!session) return;
    await supabase.from('user_settings').upsert({ user_id: session.user.id, target_hours: hours });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTasks([]);
    setSessions([]);
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

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-zinc-400">Loading your data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 gap-2">
      <div className="w-full max-w-sm flex justify-between items-center mb-2">
        <p className="text-xs text-zinc-400">{session.user.email}</p>
        <button onClick={handleLogout} className="text-xs text-rose-400">
          Log out
        </button>
      </div>
      {errorMsg && (
        <div className="w-full max-w-sm px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-500 text-xs flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}>✕</button>
        </div>
      )}
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
