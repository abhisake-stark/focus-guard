import { useState, useEffect } from 'react';
import { formatDigital, playChime, CATEGORIES } from '../utils/format';

function Tracker({ activeTracker, setActiveTracker, onSessionComplete }) {
  const [liveElapsed, setLiveElapsed] = useState(0);

  useEffect(() => {
    if (!activeTracker.isTracking || !activeTracker.startTime) {
      setLiveElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setLiveElapsed(Math.max(0, Date.now() - activeTracker.startTime));
    }, 500);
    return () => clearInterval(interval);
  }, [activeTracker.isTracking, activeTracker.startTime]);

  const startTracking = () => {
    playChime('start');
    const st = Date.now();
    setActiveTracker((prev) => ({ ...prev, isTracking: true, startTime: st }));
  };

  const stopTracking = () => {
    playChime('stop');
    if (!activeTracker.startTime) return;
    const endTime = Date.now();
    const durationMs = endTime - activeTracker.startTime;
    const session = {
      id: 'w_' + Date.now(),
      startTime: activeTracker.startTime,
      endTime,
      durationMs,
      category: activeTracker.category,
      note: activeTracker.note,
    };
    onSessionComplete(session);
    setActiveTracker((prev) => ({ ...prev, isTracking: false, startTime: null }));
  };

  return (
    <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm">
      <p className="text-xs text-zinc-400 mb-2">Category</p>
      <select
        value={activeTracker.category}
        onChange={(e) => setActiveTracker((prev) => ({ ...prev, category: e.target.value }))}
        disabled={activeTracker.isTracking}
        className="w-full text-sm px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 mb-4"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="text-center text-3xl font-mono font-semibold mb-4">
        {formatDigital(liveElapsed)}
      </div>

      {!activeTracker.isTracking ? (
        <button
          onClick={startTracking}
          className="w-full py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm"
        >
          Start tracking
        </button>
      ) : (
        <button
          onClick={stopTracking}
          className="w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm"
        >
          Stop
        </button>
      )}
    </div>
  );
}

export default Tracker;
