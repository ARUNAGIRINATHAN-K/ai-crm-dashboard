import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  X,
  Heart,
  Mail,
  Phone,
  Briefcase,
  Tag,
  Star,
} from 'lucide-react';

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  isFavorite?: boolean;
  tags?: string[];
  createdAt: string;
}

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Detail Modal State
  const [detailContact, setDetailContact] = useState<Contact | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contacts');
      setContacts(res.data.contacts || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch contacts directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleOpenCreate = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setIsFavorite(false);
    setTagsInput('');
    setFormError(null);
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    setName(contact.name);
    setEmail(contact.email);
    setPhone(contact.phone || '');
    setCompany(contact.company || '');
    setIsFavorite(!!contact.isFavorite);
    setTagsInput(contact.tags ? contact.tags.join(', ') : '');
    setFormError(null);
    setSelectedId(contact._id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleToggleFavorite = async (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedVal = !contact.isFavorite;
    try {
      // Optimistic update
      setContacts((prev) =>
        prev.map((c) => (c._id === contact._id ? { ...c, isFavorite: updatedVal } : c))
      );
      await api.put(`/contacts/${contact._id}`, { isFavorite: updatedVal });
    } catch (err) {
      fetchContacts();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setFormError('Name and email are required fields.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      name,
      email,
      phone,
      company,
      isFavorite,
      tags: parsedTags,
    };

    try {
      if (isEditing && selectedId) {
        await api.put(`/contacts/${selectedId}`, payload);
      } else {
        await api.post('/contacts', payload);
      }
      setIsOpen(false);
      fetchContacts();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save contact account.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this contact from your directory?')) {
      return;
    }

    try {
      await api.delete(`/contacts/${id}`);
      fetchContacts();
      if (detailContact?._id === id) {
        setDetailContact(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete contact.');
    }
  };

  const handleCardClick = (contact: Contact) => {
    setDetailContact(contact);
  };

  // Local searching and filtering logics
  const filteredContacts = contacts.filter((c) => {
    const query = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.company && c.company.toLowerCase().includes(query)) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(query)));

    if (filterMode === 'favorites') {
      return matchesSearch && c.isFavorite;
    }
    return matchesSearch;
  });

  return (
    <div className="flex flex-col space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/10 border border-slate-900/40 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search bar */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts or tags..."
              className="pl-10 block w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2 px-3.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Favorites Filter */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 flex-shrink-0">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterMode === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('favorites')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors ${
                filterMode === 'favorites' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              Favorites
            </button>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      {/* Main Grid View */}
      {loading && contacts.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-400">
          {error}
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-900">
          <p className="text-slate-400 text-sm">No contacts found in this folder.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <div
              key={contact._id}
              onClick={() => handleCardClick(contact)}
              className="glass-panel p-5 rounded-2xl border border-slate-900 hover:border-slate-800 shadow-md transition-all cursor-pointer flex flex-col justify-between hover:shadow-indigo-500/5 group relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div className="max-w-[80%]">
                  <h3 className="text-sm font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                    {contact.name}
                  </h3>
                  {contact.company && (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium truncate">
                      <Briefcase className="h-3 w-3 flex-shrink-0 text-slate-600" />
                      {contact.company}
                    </div>
                  )}
                </div>

                {/* Favorites Toggle Icon button */}
                <button
                  onClick={(e) => handleToggleFavorite(contact, e)}
                  className="p-1 rounded-lg border border-slate-900 bg-slate-950/40 hover:bg-slate-900 transition-colors cursor-pointer text-amber-500"
                >
                  <Star
                    className={`h-4 w-4 ${
                      contact.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-500'
                    }`}
                  />
                </button>
              </div>

              {/* Tags block */}
              {contact.tags && contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {contact.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-bold border border-indigo-500/15 flex items-center gap-0.5"
                    >
                      <Tag className="h-2.5 w-2.5 text-indigo-500" />
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Card Body */}
              <div className="mt-4 pt-4 border-t border-slate-900/60 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="h-3.5 w-3.5 text-slate-600" />
                  <span className="truncate">{contact.email}</span>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-600" />
                    <span>{contact.phone}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => handleOpenEdit(contact, e)}
                  className="p-2 rounded-xl border border-slate-900 hover:border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                  title="Edit Contact"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => handleDelete(contact._id, e)}
                  className="p-2 rounded-xl border border-slate-900 hover:border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove Contact"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Details Dialog Modal */}
      {detailContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-900 shadow-2xl relative">
            <button
              onClick={() => setDetailContact(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold tracking-tight text-white font-heading mb-6 flex items-center gap-2">
              Contact Overview
              {detailContact.isFavorite && (
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              )}
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
                  {detailContact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100">{detailContact.name}</h4>
                  <p className="text-xs text-slate-400">{detailContact.company || 'Private Contact'}</p>
                </div>
              </div>

              {detailContact.tags && detailContact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-900/60">
                  {detailContact.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/15"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-slate-900/60 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span>{detailContact.email}</span>
                </div>
                {detailContact.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span>{detailContact.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  <span>{detailContact.company || 'Not Associated'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900/60 text-[10px] text-slate-500 flex justify-between">
                <span>Account Created:</span>
                <span>{new Date(detailContact.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-8 rounded-2xl border border-slate-900 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold tracking-tight text-white font-heading mb-6">
              {isEditing ? 'Edit Contact Details' : 'New Contact Account'}
            </h3>

            {formError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="Jane Smith"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="jane.smith@company.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="customer, priority, lead"
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="isFavorite"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                />
                <label htmlFor="isFavorite" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
                  Add to Favorites Directory
                </label>
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
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
