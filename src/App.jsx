import { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import './index.css';

function App() {
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('focus_authed') === 'true');

  const handleSuccess = () => {
    sessionStorage.setItem('focus_authed', 'true');
    setIsAuthed(true);
  };

  if (!isAuthed) {
    return <LoginScreen onSuccess={handleSuccess} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-zinc-500">Logged in — tracker UI comes next.</p>
    </div>
  );
}

export default App;
