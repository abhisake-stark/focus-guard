import { useState } from 'react';
import { formatHuman, DEFAULT_TARGET_HOURS } from '../utils/format';

function Dashboard({ sessions, targetHours, setTargetHours }) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(targetHours));

  const totalMs = sessions.reduce((sum, s) => sum + s.durationMs, 0);
  const targetMs = targetHours * 60 * 60 * 1000;
  const percentUsed = Math.min(100, Math.round((totalMs / targetMs) * 100));

  const byCategory = sessions.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + s.durationMs;
    return acc;
  }, {});
  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  const openGoalEditor = () => {
    setGoalInput(String(targetHours));
    setIsEditingGoal(true);
  };

  const saveGoal = (e) => {
    e.preventDefault();
    const n = parseFloat(goalInput);
    if (Number.isFinite(n) && n > 0 && n <= 24) {
      setTargetHours(n);
    }
    setIsEditingGoal(false);
  };

  return (
    <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Today's wasted time</p>
        {!isEditingGoal ? (
          <button onClick={openGoalEditor} className="text-xs text-brand-500">
            Goal: {targetHours}h
          </button>
        ) : (
          <form onSubmit={saveGoal} className="flex gap-1">
            <input
              type="number"
              step="0.5"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              autoFocus
              className="w-14 text-xs px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800"
            />
            <button type="submit" className="text-xs text-brand-500">
              Save
            </button>
          </form>
        )}
      </div>

      <p className="text-2xl font-semibold mb-2">{formatHuman(totalMs)}</p>

      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full ${percentUsed >= 100 ? 'bg-rose-400' : 'bg-brand-500'}`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      <p className="text-xs text-zinc-400 mb-3">By category</p>
      <ul className="space-y-1.5">
        {sortedCategories.length === 0 && (
          <p className="text-xs text-zinc-400">No sessions logged yet.</p>
        )}
        {sortedCategories.map(([category, ms]) => (
          <li key={category} className="flex justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">{category}</span>
            <span className="text-zinc-400">{formatHuman(ms)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
