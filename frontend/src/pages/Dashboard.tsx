import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Users,
  CheckSquare,
  Sparkles,
  Loader2,
  X,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

interface KPI {
  totalLeads: number;
  totalPipelineValue: number;
  wonDealsValue: number;
  conversionRate: number;
  activeTasksCount: number;
}

interface StageDetail {
  _id: string;
  count: number;
  totalValue: number;
}

interface TrendDetail {
  _id: string; // YYYY-MM
  value: number;
  count: number;
}

interface Lead {
  _id: string;
  name: string;
  value: number;
  stage: string;
  createdAt: string;
  contactId?: {
    name: string;
    company: string;
  };
}

interface DashboardData {
  kpis: KPI;
  stageBreakdown: StageDetail[];
  dealsTrend: TrendDetail[];
  recentLeads: Lead[];
}

interface PipelineInsights {
  healthScore: number;
  summary: string;
  risks: string[];
  suggestions: string[];
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Insights Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insights, setInsights] = useState<PipelineInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      setData(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenInsights = async () => {
    setIsModalOpen(true);
    if (insights) return; // cache locally

    setLoadingInsights(true);
    setInsightsError(null);

    try {
      const res = await api.get('/ai/pipeline-insights');
      setInsights(res.data.insights);
    } catch (err: any) {
      setInsightsError(err.response?.data?.message || 'Failed to generate pipeline intelligence.');
    } finally {
      setLoadingInsights(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 justify-center items-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-400">
        {error || 'Unable to load CRM parameters.'}
      </div>
    );
  }

  const { kpis, stageBreakdown, dealsTrend, recentLeads } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900/60 to-indigo-950/20 border border-slate-900 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-heading">CRM Hub Summary</h2>
          <p className="text-xs text-slate-400 mt-1">Realtime pipeline status and action planning items.</p>
        </div>
        <button
          onClick={handleOpenInsights}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-sm font-semibold text-white shadow-xl shadow-indigo-600/10 transition-all duration-300 cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-cyan-300" />
          Aura AI Pipeline Insights
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Pipeline Value',
            value: `₹${kpis.totalPipelineValue.toLocaleString()}`,
            desc: 'Leads excluding lost deals',
            icon: TrendingUp,
            color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          },
          {
            title: 'Won Deals',
            value: `₹${kpis.wonDealsValue.toLocaleString()}`,
            desc: 'Total converted deal sizes',
            icon: TrendingUp,
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          },
          {
            title: 'Won Rate',
            value: `${kpis.conversionRate}%`,
            desc: 'Won vs Closed deals ratio',
            icon: Users,
            color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          },
          {
            title: 'Active Tasks',
            value: `${kpis.activeTasksCount}`,
            desc: 'Pending workflow reminders',
            icon: CheckSquare,
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-panel p-5 rounded-2xl border border-slate-900 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{card.title}</p>
                <h3 className="text-2xl font-extrabold text-white tracking-tight">{card.value}</h3>
                <p className="text-[10px] text-slate-400">{card.desc}</p>
              </div>
              <div className={`p-3 rounded-xl border ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Stage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Value Trend Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-900 flex flex-col h-80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Pipeline Growth Trend</h3>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dealsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="_id" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage Breakdown summary */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-900 flex flex-col h-80 overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Stage Distribution</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {stageBreakdown.map((stage) => (
              <div key={stage._id} className="p-3 bg-slate-900/30 border border-slate-900/60 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200 capitalize">{stage._id}</span>
                  <span className="text-[10px] text-slate-500 block">{stage.count} active deal{stage.count > 1 ? 's' : ''}</span>
                </div>
                <span className="font-bold text-slate-300">₹{stage.totalValue.toLocaleString()}</span>
              </div>
            ))}

            {stageBreakdown.length === 0 && (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No stages data mapped.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Leads list view */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Recent Deals</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-900/10 text-slate-500 font-semibold">
                <th className="pb-3 pr-4">Deal Name</th>
                <th className="pb-3 px-4">Contact</th>
                <th className="pb-3 px-4">Stage</th>
                <th className="pb-3 px-4">Date Added</th>
                <th className="pb-3 pl-4 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {recentLeads.map((lead) => (
                <tr key={lead._id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="py-3 pr-4 font-bold text-slate-200">{lead.name}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {lead.contactId?.name ? (
                      <div>
                        <p className="font-semibold">{lead.contactId.name}</p>
                        <p className="text-[10px] text-slate-500">{lead.contactId.company}</p>
                      </div>
                    ) : (
                      'No Contact'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/15 text-[10px] uppercase font-bold">
                      {lead.stage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pl-4 text-right font-extrabold text-emerald-400">₹{lead.value.toLocaleString()}</td>
                </tr>
              ))}

              {recentLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No active deals recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl glass-panel p-8 rounded-2xl border border-slate-900 shadow-2xl relative max-h-[85vh] overflow-y-auto flex flex-col">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-900 pb-4 mb-6">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white font-heading">Aura AI Pipeline Auditor</h3>
                <p className="text-xs text-slate-500">Automated deal velocity assessment and risk warning analysis.</p>
              </div>
            </div>

            {loadingInsights ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 flex-1">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                <p className="text-xs text-slate-400">Evaluating CRM data patterns...</p>
              </div>
            ) : insightsError ? (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
                {insightsError}
              </div>
            ) : insights ? (
              <div className="space-y-6 flex-1 text-xs">
                {/* Score and summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-900/30 p-4 rounded-xl border border-slate-900">
                  <div className="text-center sm:border-r border-slate-900/60 py-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Health Score</span>
                    <span
                      className={`text-5xl font-extrabold tracking-tight mt-1.5 block ${
                        insights.healthScore >= 75
                          ? 'text-emerald-400'
                          : insights.healthScore >= 45
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {insights.healthScore}
                    </span>
                  </div>
                  <div className="sm:col-span-2 py-1 px-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Executive Summary</span>
                    <p className="text-slate-300 leading-relaxed font-medium">{insights.summary}</p>
                  </div>
                </div>

                {/* Risks details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4" />
                    Identified Risk Factors
                  </h4>
                  <ul className="space-y-2">
                    {insights.risks.map((risk, i) => (
                      <li key={i} className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl text-slate-300 leading-relaxed flex items-start gap-2.5">
                        <span className="text-rose-500 font-bold mt-0.5">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUpRight className="h-4 w-4" />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-2">
                    {insights.suggestions.map((sug, i) => (
                      <li key={i} className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl text-slate-300 leading-relaxed flex items-start gap-2.5">
                        <span className="text-indigo-400 font-bold mt-0.5">•</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end border-t border-slate-900 pt-6 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
