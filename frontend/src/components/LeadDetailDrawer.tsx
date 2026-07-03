import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { X, Send, Sparkles, Mail, MessageSquare, Clipboard, Check, Loader2, CheckSquare, Square, Calendar } from 'lucide-react';

interface Note {
  _id: string;
  content: string;
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
}

interface Lead {
  _id: string;
  name: string;
  value: number;
  stage: string;
  contactId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
  };
}

interface AISummary {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  recommendedNextSteps: string[];
}

interface AIEmail {
  subject: string;
  body: string;
}

interface LeadDetailDrawerProps {
  leadId: string | null;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ leadId, onClose, onLeadUpdated }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'summary' | 'email'>('details');
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);

  // Notes States
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Tasks States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // AI Summary States
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // AI Email States
  const [promptInstruction, setPromptInstruction] = useState('');
  const [aiEmail, setAiEmail] = useState<AIEmail | null>(null);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchLeadDetails = async () => {
    if (!leadId) return;
    try {
      setLoading(true);
      const res = await api.get(`/leads/${leadId}`);
      setLead(res.data.lead);
    } catch (err) {
      console.error('Failed to load lead details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    if (!leadId) return;
    try {
      const res = await api.get(`/notes?leadId=${leadId}`);
      setNotes(res.data.notes || []);
    } catch (err) {
      console.error('Failed to load notes.');
    }
  };

  const fetchTasks = async () => {
    if (!leadId) return;
    try {
      const res = await api.get(`/tasks?leadId=${leadId}`);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks.');
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails();
      fetchNotes();
      fetchTasks();
      // Reset tabs & AI values on active lead selection
      setActiveTab('details');
      setAiSummary(null);
      setAiEmail(null);
      setPromptInstruction('');
    } else {
      setLead(null);
      setNotes([]);
      setTasks([]);
    }
  }, [leadId]);

  const handleStageChange = async (newStage: string) => {
    if (!lead) return;
    try {
      // Optimistically update
      setLead({ ...lead, stage: newStage });
      await api.patch(`/leads/${lead._id}/stage`, { stage: newStage });
      onLeadUpdated();
    } catch (err) {
      fetchLeadDetails();
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !leadId) return;
    setIsSubmittingNote(true);
    try {
      await api.post('/notes', { content: newNote, leadId });
      setNewNote('');
      fetchNotes();
    } catch (err) {
      alert('Failed to submit note.');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDate || !leadId) return;
    setIsSubmittingTask(true);
    try {
      await api.post('/tasks', {
        title: newTaskTitle,
        dueDate: newTaskDate,
        leadId,
      });
      setNewTaskTitle('');
      setNewTaskDate('');
      fetchTasks();
    } catch (err) {
      alert('Failed to create task.');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
      );
      await api.put(`/tasks/${task._id}`, { status: newStatus });
    } catch (err) {
      fetchTasks();
    }
  };

  const handleGenerateSummary = async () => {
    if (!leadId) return;
    setGeneratingSummary(true);
    setSummaryError(null);
    try {
      const res = await api.get(`/ai/leads/${leadId}/summary`);
      setAiSummary(res.data.summary);
    } catch (err: any) {
      setSummaryError(err.response?.data?.message || 'Failed to generate summary.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!leadId || !promptInstruction.trim()) return;
    setGeneratingEmail(true);
    setEmailError(null);
    setAiEmail(null);
    try {
      const res = await api.post(`/ai/leads/${leadId}/email`, { promptInstruction });
      setAiEmail(res.data.email);
    } catch (err: any) {
      setEmailError(err.response?.data?.message || 'Failed to compose email draft.');
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!aiEmail) return;
    const textToCopy = `Subject: ${aiEmail.subject}\n\n${aiEmail.body}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {/* Backdrop overlay */}
      {leadId && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-full sm:w-[500px] border-l border-slate-900 bg-slate-950 shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col ${
          leadId ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
      {/* Drawer Header */}
      <div className="h-16 border-b border-slate-900 px-6 flex items-center justify-between">
        <div className="overflow-hidden">
          <h3 className="text-base font-bold text-slate-200 truncate">{lead?.name || 'Loading details...'}</h3>
          <p className="text-xs text-slate-500 truncate">{lead?.contactId?.company || ''}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-900 bg-slate-950/20 px-6">
        {[
          { id: 'details', label: 'Details', icon: MessageSquare },
          { id: 'summary', label: 'AI Summary', icon: Sparkles },
          { id: 'email', label: 'AI Emailer', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                isActive
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Drawer Canvas container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
          </div>
        ) : activeTab === 'details' ? (
          <div className="space-y-6">
            {/* Meta parameters grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-900/20 p-4 rounded-xl border border-slate-900">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Estimated Value</label>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">${lead?.value.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Deal Stage</label>
                <select
                  value={lead?.stage}
                  onChange={(e) => handleStageChange(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-3 text-xs text-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-clip-padding"
                >
                  {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map((stage) => (
                    <option key={stage} value={stage} className="bg-slate-950 text-slate-200">
                      {stage.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 border-t border-slate-900/60 pt-3">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Contact Information</label>
                <p className="text-sm font-semibold text-slate-200 mt-1">{lead?.contactId?.name}</p>
                <p className="text-xs text-slate-400">{lead?.contactId?.email} | {lead?.contactId?.phone || 'No Phone'}</p>
              </div>
            </div>

            {/* Associated Tasks sub-block */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Associated Tasks</h4>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-900 bg-slate-900/10 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleTaskStatus(task)}
                        className="text-slate-500 hover:text-indigo-400 cursor-pointer"
                      >
                        {task.status === 'completed' ? (
                          <CheckSquare className="h-4 w-4 text-indigo-500" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                      <span className={task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-300'}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Task simple inline form */}
              <form onSubmit={handleAddTask} className="flex gap-2 pt-1">
                <input
                  type="text"
                  required
                  placeholder="New task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="date"
                  required
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="w-28 rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-3 text-xs text-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-xs text-indigo-400 cursor-pointer"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Note logs section */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interaction Logs</h4>
              
              {/* Add note form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Record client outreach details..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmittingNote}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

              {/* Notes timeline items */}
              <div className="space-y-3">
                {notes.map((n) => (
                  <div key={n._id} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-1">
                    <p className="text-xs text-slate-300 leading-relaxed">{n.content}</p>
                    <span className="text-[10px] text-slate-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'summary' ? (
          <div className="space-y-6">
            {!aiSummary && !generatingSummary && (
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xl">
                  🔮
                </div>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                  Analyze client logs and generate an AI summary including sentiment, key takeaways, and next actions.
                </p>
                <button
                  onClick={handleGenerateSummary}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate AI Summary
                </button>
              </div>
            )}

            {generatingSummary && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                <p className="text-xs text-slate-400">Evaluating conversation history...</p>
              </div>
            )}

            {summaryError && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
                {summaryError}
              </div>
            )}

            {aiSummary && (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Executive summary block */}
                <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-900 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Executive Summary</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        aiSummary.sentiment === 'positive'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : aiSummary.sentiment === 'negative'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      Sentiment: {aiSummary.sentiment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{aiSummary.summary}</p>
                </div>

                {/* Key Points */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Details</h4>
                  <ul className="space-y-1.5">
                    {aiSummary.keyPoints.map((point, i) => (
                      <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action steps */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recommended Next Steps</h4>
                  <ul className="space-y-1.5">
                    {aiSummary.recommendedNextSteps.map((step, i) => (
                      <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">→</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Regenerate Trigger */}
                <button
                  onClick={handleGenerateSummary}
                  className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 pt-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  Refresh AI Summary
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Goal / Instruction
              </label>
              <textarea
                value={promptInstruction}
                onChange={(e) => setPromptInstruction(e.target.value)}
                rows={3}
                required
                className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
                placeholder="E.g., Write a brief, friendly follow-up email asking Jane if she has any questions on the proposal budget we sent yesterday."
              />
              <button
                onClick={handleGenerateEmail}
                disabled={generatingEmail || !promptInstruction.trim()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generatingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Composing Draft...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Compose Draft
                  </>
                )}
              </button>
            </div>

            {emailError && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
                {emailError}
              </div>
            )}

            {aiEmail && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Generated Email Draft</h4>
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-3 w-3" />
                        Copy Draft
                      </>
                    )}
                  </button>
                </div>

                <div className="glass-panel p-5 rounded-xl border border-slate-900 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Subject</span>
                    <p className="text-xs font-semibold text-slate-200 mt-1">{aiEmail.subject}</p>
                  </div>
                  <div className="border-t border-slate-900 pt-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Body</span>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap mt-1">{aiEmail.body}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};
