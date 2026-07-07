import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Printer, 
  Share2, 
  Layers, 
  FileCheck,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';
import { IMSReport } from '../types';

interface ReportsViewProps {
  reports: IMSReport[];
  onAddReport: (report: Omit<IMSReport, 'id'>) => void;
  searchQuery: string;
}

export default function ReportsView({
  reports,
  onAddReport,
  searchQuery
}: ReportsViewProps) {
  const [reportSearch, setReportSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'Inventory' | 'Performance' | 'Financial' | 'Logistics'>('all');

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [type, setType] = useState<'Inventory' | 'Performance' | 'Financial' | 'Logistics'>('Inventory');
  const [status, setStatus] = useState<'Draft' | 'Approved' | 'Review'>('Draft');

  const query = (reportSearch || searchQuery).toLowerCase();
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(query) || r.author.toLowerCase().includes(query);
    const matchesType = selectedType === 'all' || r.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert("Please enter a valid report title.");
      return;
    }

    onAddReport({
      title,
      author,
      date: 'Today',
      type,
      status
    });

    setTitle('');
    setShowCreateModal(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">
            <Clock className="w-3 h-3" /> Review
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <AlertCircle className="w-3 h-3" /> Draft
          </span>
        );
      default:
        return null;
    }
  };

  const reportTypes = ['all', 'Inventory', 'Performance', 'Financial', 'Logistics'] as const;

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto animate-fade-in pb-12 font-sans select-none">
      
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200/60 dark:border-slate-900 pb-5">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Ledgers & Reports</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Verify system audits, financial logs, and inventory log metrics.</p>
        </div>
        <div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-950/20 active:scale-95 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" /> Compile New Report
          </button>
        </div>
      </section>

      {/* SEARCH AND FILTERS BAR */}
      <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm select-none">
        <div className="relative w-full sm:w-64 select-text">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text"
            value={reportSearch}
            onChange={(e) => setReportSearch(e.target.value)}
            placeholder="Search report titles..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
          />
        </div>

        <div className="flex items-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 text-xs font-bold">
          {reportTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedType === t 
                  ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Ledger Types' : t}
            </button>
          ))}
        </div>
      </div>

      {/* REPORTS LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReports.length > 0 ? (
          filteredReports.map((rep) => (
            <div 
              key={rep.id} 
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-lg dark:hover:shadow-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded">
                    {rep.type}
                  </span>
                  {getStatusBadge(rep.status)}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {rep.title}
                </h3>
                
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500 mt-4">
                  <p>Author: <span className="text-slate-700 dark:text-slate-300">{rep.author}</span></p>
                  <p>•</p>
                  <p>Date: <span className="text-slate-700 dark:text-slate-300">{rep.date}</span></p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-900 flex justify-between items-center">
                <button
                  onClick={() => alert(`Reviewing report details for: ${rep.title}. Content has been decrypted from local cache storage.`)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Decrypt & Read Report <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title="Print Report"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => alert("Mirroring state: Secure report link copied to clipboard.")}
                    className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title="Share Report"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-20 text-center text-slate-400 dark:text-slate-600">
            <FileCheck className="w-12 h-12 stroke-1 mx-auto mb-2" />
            <p className="text-sm font-bold">No ledgers or reports found</p>
            <p className="text-xs mt-1">Try resetting report filters or select Compile New Report.</p>
          </div>
        )}
      </div>

      {/* CREATE REPORT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-text animate-fade-in">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" /> Compile New Report
            </h3>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Report Title</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Inventory Compliance Audit"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Report Author</label>
                <input 
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Admin"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Audit Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                >
                  <option value="Inventory">Inventory Audit</option>
                  <option value="Performance">Performance Ledger</option>
                  <option value="Financial">Financial Statement</option>
                  <option value="Logistics">Logistics Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                >
                  <option value="Draft">Draft Mode</option>
                  <option value="Review">In Review</option>
                  <option value="Approved">Approved / Sealed</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Compile Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
