import { useMemo } from 'react';
import { exportSessionsToCSV } from '../utils/format';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = [
  '#6b74d1',
  '#8b93e0',
  '#a5abe8',
  '#c2c7f0',
  '#dde0f7',
  '#efece6',
  '#d4ccc0',
  '#b8ada0',
];

function Insights({ sessions }) {
  const dailyData = useMemo(() => {
    const days = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(undefined, { weekday: 'short' });
      days[key] = 0;
    }

    sessions.forEach((s) => {
      if (!s.startTime) return;
      const d = new Date(s.startTime);
      const key = d.toLocaleDateString(undefined, { weekday: 'short' });
      if (key in days) {
        days[key] += s.durationMs / (1000 * 60);
      }
    });

    return Object.entries(days).map(([day, minutes]) => ({
      day,
      minutes: Math.round(minutes),
    }));
  }, [sessions]);

  const categoryData = useMemo(() => {
    const byCategory = sessions.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + s.durationMs / (1000 * 60);
      return acc;
    }, {});
    return Object.entries(byCategory)
      .map(([name, minutes]) => ({ name, value: Math.round(minutes) }))
      .filter((c) => c.value > 0);
  }, [sessions]);

  return (
    <div className="w-full max-w-sm space-y-4">
      <button
        onClick={() => exportSessionsToCSV(sessions)}
        disabled={sessions.length === 0}
        className="w-full py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-sm font-medium disabled:opacity-40"
      >
        Export as CSV
      </button>
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-4">
          Last 7 days (minutes wasted)
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyData}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="minutes" fill="#6b74d1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-4">
          Time by category
        </p>
        {categoryData.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-8">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={60}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default Insights;
