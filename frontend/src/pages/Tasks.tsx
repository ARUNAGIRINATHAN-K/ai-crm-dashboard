import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Trash2, Calendar, CheckSquare, Square, Loader2, X } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  leadId?: {
    _id: string;
    name: string;
  } | null;
}

interface Lead {
  _id: string;
  name: string;
}

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [leadId, setLeadId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.tasks || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks.');
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads');
      setLeads(res.data.leads || []);
    } catch (err) {
      console.error('Failed to load leads list for task associations.');
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchTasks(), fetchLeads()]);
      setLoading(false);
    };
    initData();
  }, []);

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      // Optimistic Update
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
      );
      await api.put(`/tasks/${task._id}`, { status: newStatus });
    } catch (err) {
      // Revert on error
      fetchTasks();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  const handleOpenCreate = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setLeadId('');
    setFormError(null);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) {
      setFormError('Please specify task title and due date.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      await api.post('/tasks', {
        title,
        description,
        dueDate,
        leadId: leadId || undefined,
      });
      setIsOpen(false);
      fetchTasks();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return t.status !== 'completed';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 relative h-full">
      {/* Top Filter & Actions Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Toggle Buttons */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-900">
          {(['all', 'pending', 'completed'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 cursor-pointer ${
                filter === type
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {/* Main Checklist Frame */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-400">
          {error}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-900">
          <p className="text-slate-400 text-sm">No tasks found matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = new Date(task.dueDate) < new Date() && !isCompleted;
            return (
              <div
                key={task._id}
                className={`glass-panel p-4 rounded-xl border flex items-center justify-between gap-4 transition-all duration-200 ${
                  isCompleted ? 'opacity-60 border-slate-900 bg-slate-900/10' : 'border-slate-900 bg-slate-900/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Toggle Box */}
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className="mt-1 text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
                  >
                    {isCompleted ? (
                      <CheckSquare className="h-5 w-5 text-indigo-500" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <h4
                      className={`text-sm font-semibold text-slate-100 transition-all ${
                        isCompleted ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className={`text-xs text-slate-400 ${isCompleted ? 'line-through text-slate-600' : ''}`}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 items-center pt-1 text-[11px] font-medium text-slate-500">
                      <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-rose-400' : ''}`}>
                        <Calendar className="h-3 w-3" />
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      {task.leadId && (
                        <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/15">
                          Deal: {task.leadId.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(task._id)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-8 rounded-2xl border border-slate-900 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold tracking-tight text-white font-heading mb-6">Create New Task</h3>

            {formError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="Review client contract proposal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                  placeholder="Details about client specifications..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Link to Lead</label>
                  <select
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors bg-clip-padding"
                  >
                    <option value="" className="bg-slate-950">-- None --</option>
                    {leads.map((l) => (
                      <option key={l._id} value={l._id} className="bg-slate-950 text-slate-100">
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 border border-slate-800 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center min-w-24 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
