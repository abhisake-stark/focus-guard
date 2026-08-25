import { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import Tracker from './components/Tracker';
import './index.css';

function App() {
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('focus_authed') === 'true');
  const [activeTracker, setActiveTracker] = useState({
    isTracking: false,
    startTime: null,
    category: 'Social Media',
    note: '',
  });
  const [sessions, setSessions] = useState([]);

  const handleSuccess = () => {
    sessionStorage.setItem('focus_authed', 'true');
    setIsAuthed(true);
  };

  const handleSessionComplete = (session) => {
    setSessions((prev) => [session, ...prev]);
  };

  if (!isAuthed) {
    return <LoginScreen onSuccess={handleSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Tracker
        activeTracker={activeTracker}
        setActiveTracker={setActiveTracker}
        onSessionComplete={handleSessionComplete}
      />
      <p className="text-xs text-zinc-400">{sessions.length} session(s) logged this run</p>
    </div>
  );
}

export default App;
