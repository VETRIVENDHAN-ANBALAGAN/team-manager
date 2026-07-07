import React, { useState } from 'react';
import { 
  Building, 
  Search, 
  Plus, 
  Briefcase, 
  Mail, 
  User, 
  Calendar, 
  Tag, 
  TrendingUp, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Client, Project } from '../types';

interface ClientsViewProps {
  clients: Client[];
  onUpdateClients: (updated: Client[]) => void;
  projects: Project[];
  searchQuery: string;
}

export default function ClientsView({ 
  clients, 
  onUpdateClients, 
  projects, 
  searchQuery: externalSearchQuery 
}: ClientsViewProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'onboarding' | 'inactive'>('all');
  
  // Modals / Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [status, setStatus] = useState<'active' | 'onboarding' | 'inactive'>('active');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Combined search queries
  const activeSearch = (localSearch || externalSearchQuery).toLowerCase();

  // Filtered clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(activeSearch) ||
      client.industry.toLowerCase().includes(activeSearch) ||
      client.contactPerson.toLowerCase().includes(activeSearch) ||
      client.contactEmail.toLowerCase().includes(activeSearch);
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Reset form
  const resetForm = () => {
    setName('');
    setIndustry('');
    setStatus('active');
    setContactPerson('');
    setContactEmail('');
    setNotes('');
    setEditingClient(null);
  };

  // Open add modal
  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setIndustry(client.industry);
    setStatus(client.status);
    setContactPerson(client.contactPerson);
    setContactEmail(client.contactEmail);
    setNotes(client.notes || '');
    setShowAddModal(true);
  };

  // Save/Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !industry || !contactPerson || !contactEmail) {
      alert('Please fill in all required fields.');
      return;
    }

    if (editingClient) {
      // Update existing
      const updated = clients.map(c => 
        c.id === editingClient.id 
          ? { 
              ...c, 
              name, 
              industry, 
              status, 
              contactPerson, 
              contactEmail, 
              notes 
            } 
          : c
      );
      onUpdateClients(updated);
    } else {
      // Create new
      const newClient: Client = {
        id: `cli-${Date.now()}`,
        name,
        industry,
        status,
        projectCount: 0,
        onboardedAt: new Date().toISOString().split('T')[0],
        contactPerson,
        contactEmail,
        notes
      };
      onUpdateClients([newClient, ...clients]);
    }
    
    setShowAddModal(false);
    resetForm();
  };

  // Delete/Archive client
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this client? This will archive their current status.')) {
      const updated = clients.filter(c => c.id !== id);
      onUpdateClients(updated);
    }
  };

  // Calculate high-level metrics
  const totalClients = clients.length;
  const onboardingClients = clients.filter(c => c.status === 'onboarding').length;
  const activeClients = clients.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-6" id="clients-view-container">
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1">
            <Building className="w-3.5 h-3.5" /> Corporate Accounts
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Client Ledger &amp; Onboarding
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Secure workspace database to register corporate partners, verify onboarding cycles, and link active projects.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/10"
        >
          <Plus className="w-4 h-4" /> Register New Client
        </button>
      </div>

      {/* 2. HIGH-CONTRAST METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Registered */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Registered</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalClients}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Linked within master ledger</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <Building className="w-6 h-6" />
          </div>
        </div>

        {/* Onboarding Phase */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Onboarding</p>
            <p className="text-2xl font-black text-amber-500">{onboardingClients}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Deployments pending check-off</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Fully Active */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Fully Active Status</p>
            <p className="text-2xl font-black text-emerald-500">{activeClients}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Steady operational state</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Check className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. FILTERS & SEARCH CONTROL BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-100 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/60">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Filter clients by name, industry, or contact..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 shrink-0">Status:</span>
          {(['all', 'active', 'onboarding', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-md capitalize transition-all ${
                statusFilter === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 4. CLIENT CARDS GRID */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredClients.map((client) => {
            // Find linked projects for this client
            const clientProjects = projects.filter(
              p => p.client.toLowerCase() === client.name.toLowerCase()
            );

            return (
              <div 
                key={client.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-2xl shadow-sm transition-all duration-200 overflow-hidden group flex flex-col justify-between"
              >
                {/* Card Header Info */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-500 transition-colors">
                          {client.name}
                        </h2>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          client.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                            : client.status === 'onboarding' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' 
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/15'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-400" /> {client.industry}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(client)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                        title="Edit details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete accounts ledger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notes / description block */}
                  {client.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                      {client.notes}
                    </p>
                  )}

                  {/* Contacts block */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="space-y-1 bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" /> Primary Contact
                      </p>
                      <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{client.contactPerson}</p>
                    </div>
                    <div className="space-y-1 bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" /> Contact Email
                      </p>
                      <p className="font-bold text-slate-700 dark:text-slate-300 truncate text-blue-500 hover:underline cursor-pointer">
                        {client.contactEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer status link for Projects */}
                <div className="bg-slate-50 dark:bg-slate-950/50 px-5 py-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>Active Projects:</span>
                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-500/15">
                      {clientProjects.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Since {client.onboardedAt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 max-w-lg mx-auto">
          <Building className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">No clients match your filter</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Clear your search term or register a new corporate entity to establish connection workspaces.
          </p>
        </div>
      )}

      {/* 5. ADD & EDIT CLIENT DIALOG / MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-950 text-white p-5 border-b border-slate-850 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  {editingClient ? 'Edit Client Parameters' : 'Register New Client Account'}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                  Secure Accounts Database Registration
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Client Name */}
                <div className="col-span-2 space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Client Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corporation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                  />
                </div>

                {/* Industry */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Industry Domain *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fintech, Retail"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                  />
                </div>

                {/* Status Toggle */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Relationship Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                  >
                    <option value="active">Active Relationship</option>
                    <option value="onboarding">Under Onboarding</option>
                    <option value="inactive">Inactive / Archived</option>
                  </select>
                </div>

                {/* Contact Person */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Primary Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Contact Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@acme.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Notes */}
                <div className="col-span-2 space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Internal Account Notes &amp; Scope Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe custom onboarding scope, SLAs, or general contact instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow shadow-blue-500/10"
                >
                  {editingClient ? 'Save Changes' : 'Register Corporate Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
