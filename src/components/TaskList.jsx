import { useState } from 'react';

function TaskList({ tasks, onAddTask, onToggleTask, onDeleteTask }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [filter, setFilter] = useState('all');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({ id: 't_' + Date.now(), title: title.trim(), priority, done: false });
    setTitle('');
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  return (
    <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm mt-4">
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 text-sm px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="text-sm px-2 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm"
        >
          Add
        </button>
      </form>

      <div className="flex gap-2 mb-3 text-xs">
        {['all', 'active', 'done'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full ${filter === f ? 'bg-brand-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800"
          >
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={task.done} onChange={() => onToggleTask(task.id)} />
              <span className={task.done ? 'line-through text-zinc-400' : ''}>{task.title}</span>
            </label>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="text-xs text-rose-400 hover:text-rose-500"
            >
              ✕
            </button>
          </li>
        ))}
        {filteredTasks.length === 0 && (
          <p className="text-xs text-zinc-400 text-center py-2">No tasks here.</p>
        )}
      </ul>
    </div>
  );
}

export default TaskList;
