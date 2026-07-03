import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { LeadDetailDrawer } from '../components/LeadDetailDrawer';
import {
  Plus,
  Loader2,
  X,
  DollarSign,
  User,
  AlertCircle,
  Search,
  Download,
  LayoutGrid,
  List,
  ChevronUp,
  ChevronDown,
  Trash2,
} from 'lucide-react';

interface Contact {
  _id: string;
  name: string;
  company: string;
}

interface Lead {
  _id: string;
  name: string;
  value: number;
  stage: string;
  contactId: Contact;
  createdAt: string;
}

const STAGES = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
];

export const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Toggle states
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sorting
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Drawer & Selection State
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('new');
  const [contactId, setContactId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads', {
        params: {
          search: searchQuery || undefined,
          stage: filterStage || undefined,
        },
      });
      setLeads(res.data.leads || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch leads.');
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts');
      setContacts(res.data.contacts || []);
    } catch (err) {
      console.error('Failed to load contacts directory.');
    }
  };

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLeads();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, filterStage]);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchContacts();
      setLoading(false);
    };
    initData();
  }, []);

  // HTML5 Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('leadId');
    if (!id) return;

    const leadToUpdate = leads.find((l) => l._id === id);
    if (!leadToUpdate || leadToUpdate.stage === targetStage) return;

    try {
      // Optimistic update
      setLeads((prev) =>
        prev.map((l) => (l._id === id ? { ...l, stage: targetStage } : l))
      );
      await api.patch(`/leads/${id}/stage`, { stage: targetStage });
    } catch (err) {
      // Revert on error
      fetchLeads();
    }
  };

  const handleOpenCreate = () => {
    setName('');
    setValue('');
    setStage('new');
    setContactId('');
    setFormError(null);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value || !contactId) {
      setFormError('Please enter deal name, value, and contact.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      await api.post('/leads', {
        name,
        value: Number(value),
        stage,
        contactId,
      });
      setIsOpen(false);
      fetchLeads();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create lead.');
    } finally {
      setIsSaving(false);
    }
  };

  // Checkbox management
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l._id));
    }
  };

  // Sorting
  const handleSort = (field: 'name' | 'value' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Bulk deletion
  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected deals?`)) {
      return;
    }
    try {
      setLoading(true);
      await api.post('/leads/bulk-delete', { ids: selectedIds });
      setSelectedIds([]);
      await fetchLeads();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete selected leads.');
    } finally {
      setLoading(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Deal Name', 'Deal Value ($)', 'Stage', 'Contact Person', 'Creation Date'];
    const rows = leads.map((l) => [
      l.name,
      l.value,
      l.stage,
      l.contactId?.name || 'N/A',
      new Date(l.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Local helper labels
  const colLabelMap = (sId: string) => {
    return STAGES.find((s) => s.id === sId)?.label || sId;
  };

  const getStageBadgeStyles = (sId: string) => {
    switch (sId) {
      case 'new':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/15';
      case 'contacted':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/15';
      case 'qualified':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/15';
      case 'proposal':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/15';
      case 'negotiation':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/15';
      case 'won':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15';
      case 'lost':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/15';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/15';
    }
  };

  // Sorting calculations
  const sortedLeads = [...leads].sort((a, b) => {
    let aVal: any = a[sortBy];
    let bVal: any = b[sortBy];

    if (sortBy === 'name') {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Group leads for Board view
  const leadsByStage = STAGES.reduce<Record<string, Lead[]>>((acc, s) => {
    acc[s.id] = leads.filter((l) => l.stage === s.id);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/10 border border-slate-900/40 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deals..."
              className="pl-10 block w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2 px-3.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="block rounded-xl border border-slate-800 bg-slate-950/40 py-2 px-3 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          >
            <option value="" className="bg-slate-950 text-slate-300">All Stages</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-950 text-slate-100">
                {s.label}
              </option>
            ))}
          </select>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-300 cursor-pointer transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>

        {/* View Mode Toggle & Add Button */}
        <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0">
          {/* Toggle buttons */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'board' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table Grid View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Deal
          </button>
        </div>
      </div>

      {/* Main Board/Table view container */}
      {loading && leads.length === 0 ? (
        <div className="flex justify-center items-center flex-1 h-64">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-400">
          {error}
        </div>
      ) : viewMode === 'table' ? (
        <div className="glass-panel rounded-2xl border border-slate-900 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-900/20 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={leads.length > 0 && selectedIds.length === leads.length}
                      onChange={handleToggleAll}
                      className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:text-slate-200 transition-colors">
                    <div className="flex items-center gap-1.5">
                      Deal Name
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 text-indigo-400" /> : <ChevronDown className="h-3 w-3 text-indigo-400" />
                      )}
                    </div>
                  </th>
                  <th onClick={() => handleSort('value')} className="p-4 cursor-pointer hover:text-slate-200 transition-colors">
                    <div className="flex items-center gap-1.5">
                      Value
                      {sortBy === 'value' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 text-indigo-400" /> : <ChevronDown className="h-3 w-3 text-indigo-400" />
                      )}
                    </div>
                  </th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Contact</th>
                  <th onClick={() => handleSort('createdAt')} className="p-4 cursor-pointer hover:text-slate-200 transition-colors">
                    <div className="flex items-center gap-1.5">
                      Created
                      {sortBy === 'createdAt' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 text-indigo-400" /> : <ChevronDown className="h-3 w-3 text-indigo-400" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 bg-slate-950/20 text-xs text-slate-300">
                {sortedLeads.map((lead) => {
                  const isSelected = selectedIds.includes(lead._id);
                  return (
                    <tr
                      key={lead._id}
                      onClick={() => setSelectedLeadId(lead._id)}
                      className={`hover:bg-slate-900/30 transition-colors cursor-pointer ${
                        isSelected ? 'bg-indigo-500/5' : ''
                      }`}
                    >
                      <td className="p-4 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(lead._id)}
                          className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 font-semibold text-slate-200 truncate max-w-[200px]">
                        {lead.name}
                      </td>
                      <td className="p-4 font-bold text-emerald-400">
                        ${lead.value.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStageBadgeStyles(lead.stage)}`}>
                          {colLabelMap(lead.stage)}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 truncate max-w-[150px]">
                        {lead.contactId?.name || <span className="text-slate-600 italic">No Link</span>}
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-medium italic">
                      No sales deals found matching search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bulk delete floating bar at bottom */}
          {selectedIds.length > 0 && (
            <div className="p-4 border-t border-slate-900 bg-slate-900/40 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400">
                {selectedIds.length} deal{selectedIds.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  Deselect All
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Bulk Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4 flex gap-4 select-none h-full items-start">
          {STAGES.map((col) => {
            const stageLeads = leadsByStage[col.id] || [];
            const colSum = stageLeads.reduce((sum, current) => sum + current.value, 0);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="w-72 flex-shrink-0 bg-slate-900/10 border border-slate-900/40 rounded-2xl flex flex-col max-h-[calc(100vh-210px)] overflow-hidden"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-slate-900 bg-slate-900/20 flex justify-between items-center flex-shrink-0">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{col.label}</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">${colSum.toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead._id)}
                      onClick={() => setSelectedLeadId(lead._id)}
                      className="glass-panel p-4 rounded-xl border border-slate-900 hover:border-slate-800 shadow-md transition-all cursor-grab active:cursor-grabbing hover:shadow-lg hover:shadow-indigo-500/5"
                    >
                      <h4 className="text-xs font-bold text-slate-200 truncate">{lead.name}</h4>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                          <DollarSign className="h-3 w-3" />
                          {lead.value.toLocaleString()}
                        </span>

                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 max-w-[120px] truncate">
                          <User className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{lead.contactId?.name || 'No Contact'}</span>
                        </span>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="h-24 border border-dashed border-slate-900 rounded-xl flex items-center justify-center text-[10px] text-slate-600 font-medium">
                      No deals here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide Drawer detail panel */}
      <LeadDetailDrawer
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onLeadUpdated={fetchLeads}
      />

      {/* Create Lead Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-8 rounded-2xl border border-slate-900 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold tracking-tight text-white font-heading mb-6">Create New Deal</h3>

            {formError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Deal / Lead Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="Enterprise License Agreement"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Estimated Value ($)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="12000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Pipeline Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors bg-clip-padding"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-950 text-slate-100">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Link Contact</label>
                <select
                  required
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors bg-clip-padding"
                >
                  <option value="" className="bg-slate-950">-- Select Contact --</option>
                  {contacts.map((c) => (
                    <option key={c._id} value={c._id} className="bg-slate-950 text-slate-100">
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
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
