import { useState, useEffect, useRef } from 'react';
import { playChime } from '../utils/format';

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

function Pomodoro() {
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_FOCUS_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleCycleEnd();
          return prev;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const notify = (title, body) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/vite.svg' });
    }
  };

  const handleCycleEnd = () => {
    playChime('stop');
    if (mode === 'focus') {
      notify('Focus session complete', `Time for a ${breakMinutes}-minute break.`);
      setMode('break');
      setSecondsLeft(breakMinutes * 60);
    } else {
      notify('Break over', 'Ready for another focus session?');
      setMode('focus');
      setSecondsLeft(focusMinutes * 60);
    }
    setIsRunning(false);
  };

  const toggleRunning = () => {
    if (!isRunning && permission !== 'granted' && typeof Notification !== 'undefined') {
      requestPermission();
    }
    setIsRunning((prev) => !prev);
  };

  const resetCycle = () => {
    setIsRunning(false);
    setMode('focus');
    setSecondsLeft(focusMinutes * 60);
  };

  const updateFocusMinutes = (value) => {
    const n = Math.max(1, Math.min(120, Number(value) || DEFAULT_FOCUS_MINUTES));
    setFocusMinutes(n);
    if (!isRunning && mode === 'focus') setSecondsLeft(n * 60);
  };

  const updateBreakMinutes = (value) => {
    const n = Math.max(1, Math.min(60, Number(value) || DEFAULT_BREAK_MINUTES));
    setBreakMinutes(n);
    if (!isRunning && mode === 'break') setSecondsLeft(n * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm mt-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          {mode === 'focus' ? 'Focus session' : 'Break'}
        </p>
        {permission === 'default' && (
          <button onClick={requestPermission} className="text-xs text-brand-500">
            Enable notifications
          </button>
        )}
        {permission === 'denied' && (
          <span className="text-xs text-rose-400">Notifications blocked</span>
        )}
      </div>

      {!isRunning && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="text-xs text-zinc-400">Focus (min)</label>
            <input
              type="number"
              min="1"
              max="120"
              value={focusMinutes}
              onChange={(e) => updateFocusMinutes(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 mt-1"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-zinc-400">Break (min)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={breakMinutes}
              onChange={(e) => updateBreakMinutes(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 mt-1"
            />
          </div>
        </div>
      )}

      <div className="text-center text-4xl font-mono font-semibold mb-5">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      <div className="flex gap-2">
        <button
          onClick={toggleRunning}
          className={`flex-1 py-3 rounded-2xl text-white font-medium text-sm ${
            mode === 'focus'
              ? 'bg-brand-500 hover:bg-brand-600'
              : 'bg-emerald-500 hover:bg-emerald-600'
          }`}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetCycle}
          className="px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-sm"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default Pomodoro;
