import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Tracker from './components/Tracker';
import TaskList from './components/TaskList';
import './index.css';

function App() {
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('focus_authed') === 'true');
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

  useEffect(() => {
    localStorage.setItem('focus_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('focus_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleSuccess = () => {
    sessionStorage.setItem('focus_authed', 'true');
    setIsAuthed(true);
  };

  const handleSessionComplete = (session) => {
    setSessions((prev) => [session, ...prev]);
  };

  const handleAddTask = (task) => setTasks((prev) => [task, ...prev]);
  const handleToggleTask = (id) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const handleDeleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  if (!isAuthed) {
    return <LoginScreen onSuccess={handleSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 gap-2">
      <Tracker
        activeTracker={activeTracker}
        setActiveTracker={setActiveTracker}
        onSessionComplete={handleSessionComplete}
      />
      <p className="text-xs text-zinc-400">{sessions.length} session(s) logged this run</p>
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
