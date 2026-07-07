import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  CheckSquare, 
  Square, 
  Users, 
  Target, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Trash2, 
  Search, 
  X,
  Layers,
  CheckCircle2,
  Filter,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { Project, TeamMember, ProjectTask, User } from '../types';
import { CLANS } from '../data';

interface ProjectsViewProps {
  currentUser: User | null;
  projects: Project[];
  onUpdateProjects: (updated: Project[]) => void;
  teamMembers: TeamMember[];
  onUpdateTeam: (updated: TeamMember[]) => void;
  searchQuery: string;
}

export default function ProjectsView({
  currentUser,
  projects,
  onUpdateProjects,
  teamMembers,
  onUpdateTeam,
  searchQuery
}: ProjectsViewProps) {
  // Tabs: 'portfolio' or 'clans'
  const [activeSubTab, setActiveSubTab] = useState<'portfolio' | 'clans'>('portfolio');
  
  // Filtering & Search
  const [projectSearch, setProjectSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clanFilter, setClanFilter] = useState<string>('all');

  // Isolation mode (defaults to user's assigned clan for regular team members / leaders)
  const [isolatedClanId, setIsolatedClanId] = useState<string | null>(null);
  const [showOnlyMyClan, setShowOnlyMyClan] = useState<boolean>(true);

  // Set default isolation based on user's clan to reduce distraction
  useEffect(() => {
    if (currentUser && currentUser.role !== 'Admin' && currentUser.clanId) {
      setIsolatedClanId(currentUser.clanId);
      setClanFilter(currentUser.clanId);
    } else {
      setIsolatedClanId(null);
      setClanFilter('all');
    }
  }, [currentUser]);

  // Selected Project for detail modal/view
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Modals state
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAssignClanModal, setShowAssignClanModal] = useState(false);

  // Form states for New Project
  const [newProjName, setNewProjName] = useState('');
  const [newProjClient, setNewProjClient] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjStartDate, setNewProjStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newProjStatus, setNewProjStatus] = useState<'active' | 'completed' | 'on-hold'>('active');
  const [newProjClanId, setNewProjClanId] = useState('vanguard');
  const [newProjTasksInput, setNewProjTasksInput] = useState('');

  // Form states for Assigning Member to Clan
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedClanId, setSelectedClanId] = useState('vanguard');

  // New sub-task input on an existing project
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  // Combine parent search query and local search
  const finalSearchQuery = (projectSearch || searchQuery).toLowerCase();

  // Determine active clan filter (incorporate isolated mode)
  const activeClanFilter = showOnlyMyClan && currentUser && currentUser.role !== 'Admin' && currentUser.clanId
    ? currentUser.clanId 
    : (isolatedClanId || clanFilter);

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(finalSearchQuery) || 
                          p.client.toLowerCase().includes(finalSearchQuery) ||
                          (p.description || '').toLowerCase().includes(finalSearchQuery);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesClan = activeClanFilter === 'all' || p.clanId === activeClanFilter;
    return matchesSearch && matchesStatus && matchesClan;
  });

  // Calculate stats
  const totalProjects = projects.length;
  const activeProjectsCount = projects.filter(p => p.status === 'active').length;
  const averageEfficiency = projects.length 
    ? Math.round(projects.reduce((sum, p) => sum + (p.efficiency || 0), 0) / projects.length) 
    : 0;

  // Handle toggle task chunk completion in a project
  const handleToggleProjectTask = (projectId: string, taskId: string) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        const subtasks = p.tasks || [];
        const updatedTasks = subtasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        
        // Calculate new efficiency based on subtask completion
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const totalCount = updatedTasks.length;
        const newEfficiency = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : p.efficiency;

        return {
          ...p,
          tasks: updatedTasks,
          efficiency: newEfficiency
        };
      }
      return p;
    });
    onUpdateProjects(updated);
  };

  // Add sub-task to existing project
  const handleAddSubTask = (projectId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTaskTitle.trim()) return;

    const updated = projects.map(p => {
      if (p.id === projectId) {
        const subtasks = p.tasks || [];
        const newChunk: ProjectTask = {
          id: `pt_${Date.now()}`,
          title: newSubTaskTitle.trim(),
          completed: false
        };
        const updatedTasks = [...subtasks, newChunk];
        
        // Recalculate efficiency
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const totalCount = updatedTasks.length;
        const newEfficiency = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : p.efficiency;

        return {
          ...p,
          tasks: updatedTasks,
          efficiency: newEfficiency
        };
      }
      return p;
    });

    onUpdateProjects(updated);
    setNewSubTaskTitle('');
  };

  // Delete sub-task
  const handleDeleteSubTask = (projectId: string, subTaskId: string) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        const subtasks = p.tasks || [];
        const updatedTasks = subtasks.filter(t => t.id !== subTaskId);
        
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const totalCount = updatedTasks.length;
        const newEfficiency = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

        return {
          ...p,
          tasks: updatedTasks,
          efficiency: newEfficiency
        };
      }
      return p;
    });
    onUpdateProjects(updated);
  };

  // Handle adding new Project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjClient.trim()) return;

    // Parse initial task chunks
    const parsedChunks: ProjectTask[] = newProjTasksInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map((t, idx) => ({
        id: `pt_${Date.now()}_${idx}`,
        title: t,
        completed: false
      }));

    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name: newProjName.trim(),
      client: newProjClient.trim(),
      description: newProjDesc.trim() || 'No description provided.',
      startDate: newProjStartDate,
      status: newProjStatus,
      efficiency: parsedChunks.length > 0 ? 0 : 80, // 0% if workflow is brand new with tasks, else default 80
      clanId: newProjClanId,
      tasks: parsedChunks
    };

    onUpdateProjects([newProj, ...projects]);

    // Reset Form
    setNewProjName('');
    setNewProjClient('');
    setNewProjDesc('');
    setNewProjStartDate(new Date().toISOString().split('T')[0]);
    setNewProjStatus('active');
    setNewProjClanId('vanguard');
    setNewProjTasksInput('');
    setShowAddProjectModal(false);
  };

  // Handle member assignment to Clan
  const handleAssignClan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    const updated = teamMembers.map(m => m.id === selectedMemberId ? { ...m, clanId: selectedClanId } : m);
    onUpdateTeam(updated);
    setShowAssignClanModal(false);
  };

  // Handle deleting a project entirely
  const handleDeleteProject = (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const updated = projects.filter(p => p.id !== projectId);
      onUpdateProjects(updated);
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
    }
  };

  const getClanBadge = (clanId?: string) => {
    const clan = CLANS.find(c => c.id === clanId);
    if (!clan) return <span className="text-slate-500 text-[10px] uppercase font-bold">No Clan</span>;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${clan.bg} ${clan.text} border ${clan.border}`}>
        {clan.name}
      </span>
    );
  };

  const getClanBorderColor = (clanId?: string) => {
    switch (clanId) {
      case 'vanguard': return 'border-l-indigo-500 dark:border-l-indigo-400';
      case 'synapse': return 'border-l-amber-500 dark:border-l-amber-400';
      case 'sentinel': return 'border-l-emerald-500 dark:border-l-emerald-400';
      case 'forge': return 'border-l-rose-500 dark:border-l-rose-400';
      default: return 'border-l-slate-400 dark:border-l-slate-600';
    }
  };

  const getClanIndicatorBg = (clanId?: string) => {
    switch (clanId) {
      case 'vanguard': return 'bg-indigo-500';
      case 'synapse': return 'bg-amber-500';
      case 'sentinel': return 'bg-emerald-500';
      case 'forge': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  // Master lists of clans for the Connected Workspace banner
  const isRegularUser = currentUser && currentUser.role !== 'Admin';
  const assignedClanInfo = CLANS.find(c => c.id === currentUser?.clanId);

  return (
    <div className="space-y-6" id="projects-view-container">
      
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/15">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
              Operational Workspace Cards
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Streamlined projects view using prominent workspace containers to eliminate clutter and improve tactical concentration.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAssignClanModal(true)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition duration-150 cursor-pointer shadow-sm"
          >
            <Users className="w-4 h-4 text-slate-400" /> Assign Team Clan
          </button>
          
          <button
            onClick={() => setShowAddProjectModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition duration-150 cursor-pointer shadow-lg shadow-blue-500/15"
          >
            <Plus className="w-4 h-4" /> Create Project
          </button>
        </div>
      </div>

      {/* 2. ROLE-BASED ACCESS CONTROL (RBAC) WORKLOAD FOCUS TOOLBAR */}
      {isRegularUser && assignedClanInfo && (
        <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${assignedClanInfo.bg} border ${assignedClanInfo.border} flex items-center justify-center shrink-0`}>
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Connected Workspace Mode</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-500 uppercase">Focused</span>
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white">
                Workspace filtered to your clan: <span className={`${assignedClanInfo.text} font-black underline decoration-2`}>{assignedClanInfo.name}</span>
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => setShowOnlyMyClan(!showOnlyMyClan)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                showOnlyMyClan 
                  ? 'bg-blue-600 text-white border-transparent shadow' 
                  : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {showOnlyMyClan ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>My Clan Only</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show All Clans (Connected View)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. CONNECTED WORKSPACE INSIGHTS PANEL (MINIMAL AND CLEAN FOR REGULAR USERS, ROBUST FOR ADMINS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Master Portfolios */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">Master Portfolios</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{totalProjects} Total</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Across entire workspace</p>
          </div>
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/15 rounded-xl flex items-center justify-center text-blue-500">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Active Focus Workloads */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">Active Workloads</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{activeProjectsCount} Ongoing</h3>
            <p className="text-[10px] text-emerald-500 font-bold">● Shipping and active</p>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/15 rounded-xl flex items-center justify-center text-emerald-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Global Competency Ratio */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">Overall Accuracy</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{averageEfficiency}% Avg</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Based on verified tasks</p>
          </div>
          <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/15 rounded-xl flex items-center justify-center text-indigo-500">
            <Target className="w-5 h-5" />
          </div>
        </div>

        {/* Connected Roster Health */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">Connected Roster</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{teamMembers.length} Operators</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Distributed in {CLANS.length} Clans</p>
          </div>
          <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/15 rounded-xl flex items-center justify-center text-purple-500">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. SUB TABS (Portfolio Card Workspace vs Clan Roster Mapping) */}
      <div className="flex border-b border-slate-200 dark:border-slate-850 gap-1 shrink-0">
        <button
          onClick={() => { setActiveSubTab('portfolio'); }}
          className={`px-4 py-2.5 text-xs font-extrabold tracking-tight uppercase transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'portfolio' 
              ? 'border-blue-600 text-slate-950 dark:text-white font-black' 
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Workspace Cards ({filteredProjects.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('clans')}
          className={`px-4 py-2.5 text-xs font-extrabold tracking-tight uppercase transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'clans' 
              ? 'border-blue-600 text-slate-950 dark:text-white font-black' 
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clan Workspaces Overview</span>
        </button>
      </div>

      {/* 5. MAIN SUBTAB CONTENT */}
      {activeSubTab === 'portfolio' ? (
        <div className="space-y-6">
          
          {/* SEARCH & REFINEMENTS BAR */}
          <div className="bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Search workspaces by name, client description..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="w-full md:w-auto flex flex-wrap gap-3 items-center justify-end">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" /> Filter options:
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Project Statuses</option>
                <option value="active">Active Projects</option>
                <option value="completed">Completed Projects</option>
                <option value="on-hold">On-hold Projects</option>
              </select>

              {/* Show clan selector if user is admin, else it is locked or hidden for focus */}
              {(!currentUser || currentUser.role === 'Admin') ? (
                <select
                  value={clanFilter}
                  onChange={(e) => setClanFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All Clan Sectors</option>
                  {CLANS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-1.5 bg-slate-200 dark:bg-slate-850 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold">
                  Locked: {CLANS.find(c => c.id === currentUser.clanId)?.name || 'No Clan'}
                </div>
              )}

              {(projectSearch || statusFilter !== 'all' || clanFilter !== 'all' || isolatedClanId) && (
                <button
                  onClick={() => {
                    setProjectSearch('');
                    setStatusFilter('all');
                    if (!currentUser || currentUser.role === 'Admin') {
                      setClanFilter('all');
                      setIsolatedClanId(null);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs transition font-semibold cursor-pointer"
                >
                  Reset Layout
                </button>
              )}
            </div>
          </div>

          {/* LARGE, DISTINCTIVE, HIGH-CONTRAST WORKSPACE CARDS GRID */}
          {filteredProjects.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 max-w-md mx-auto">
              <Layers className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">No Active Workspaces Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You do not have any operational projects assigned in this category. Register a new portfolio to launch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredProjects.map(proj => {
                const totalTasks = proj.tasks?.length || 0;
                const completedTasks = proj.tasks?.filter(t => t.completed).length || 0;
                const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : proj.efficiency;
                
                return (
                  <div 
                    key={proj.id} 
                    className={`bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl flex flex-col justify-between transition-all duration-200 group relative border-l-8 ${getClanBorderColor(proj.clanId)} shadow-md hover:shadow-lg`}
                  >
                    {/* Top Accent Pill Header */}
                    <div className="p-6 pb-4 space-y-4">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {getClanBadge(proj.clanId)}
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            proj.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15' :
                            proj.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/15' :
                            'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                          }`}>
                            {proj.status}
                          </span>
                        </div>

                        {/* Delete project button */}
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                          title="Delete Project Portfolio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Workspace details */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight leading-tight group-hover:text-blue-500 transition duration-150">
                            {proj.name}
                          </h3>
                          {/* Circular percentage progress indicator */}
                          <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-800 font-black text-xs text-slate-700 dark:text-slate-300">
                            {progressPct}%
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest mb-3">
                          Client: <span className="text-blue-600 dark:text-blue-400">{proj.client}</span>
                        </p>
                        
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                          {proj.description || 'No system parameters provided.'}
                        </p>
                      </div>

                      {/* Task chunks completion status */}
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-[11px] font-bold">
                          <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wide">Workspace Milestone Completion</span>
                          <span className="text-slate-900 dark:text-slate-200 font-black">{completedTasks} / {totalTasks} Chunks</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-850">
                          <div 
                            className={`h-full transition-all duration-300 ${getClanIndicatorBg(proj.clanId)}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Interactive Task chunks */}
                      {totalTasks > 0 && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                          <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">Milestone Task Check-Off</p>
                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {proj.tasks?.map(task => (
                              <div 
                                key={task.id} 
                                className="flex items-start gap-2.5 text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/20 dark:hover:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-850/80 transition group/item"
                              >
                                <button
                                  onClick={() => handleToggleProjectTask(proj.id, task.id)}
                                  className="mt-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer shrink-0"
                                >
                                  {task.completed ? (
                                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 fill-emerald-500/10" />
                                  ) : (
                                    <Square className="w-4.5 h-4.5" />
                                  )}
                                </button>
                                <span className={`flex-grow leading-tight font-semibold ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {task.title}
                                </span>
                                <button
                                  onClick={() => handleDeleteSubTask(proj.id, task.id)}
                                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition cursor-pointer shrink-0"
                                  title="Remove task chunk"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fast Sub-task Append */}
                      <form 
                        onSubmit={(e) => handleAddSubTask(proj.id, e)} 
                        className="pt-2.5 flex gap-2"
                      >
                        <input
                          type="text"
                          placeholder="Create milestone task..."
                          value={selectedProjectId === proj.id ? newSubTaskTitle : ''}
                          onFocus={() => setSelectedProjectId(proj.id)}
                          onChange={(e) => {
                            setSelectedProjectId(proj.id);
                            setNewSubTaskTitle(e.target.value);
                          }}
                          className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 placeholder-slate-400 dark:placeholder-slate-600"
                        />
                        <button
                          type="submit"
                          className="px-3 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl transition duration-150 cursor-pointer text-xs font-bold"
                        >
                          Add
                        </button>
                      </form>
                    </div>

                    {/* Card Footer Meta Info */}
                    <div className="bg-slate-50 dark:bg-slate-950/60 px-6 py-4.5 border-t border-slate-100 dark:border-slate-850 rounded-b-2xl flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" /> Launched: {proj.startDate}
                      </span>
                      <span className="flex items-center gap-1.5 font-extrabold text-slate-800 dark:text-slate-200">
                        <Clock className="w-4 h-4 text-slate-400" /> {totalTasks > 0 ? `${completedTasks}/${totalTasks} complete` : 'Active'}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : (
        /* Clans tab */
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Clan-Based Operational Segregation:</strong> Clans enable segregated tactical workloads. By clicking 
              "Isolate Workload" on any Clan card below, the central operations views will narrow to only reveal that specific 
              Clan's ongoing projects and pending tasks. This ensures team members stream focus without cross-domain noise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CLANS.map(clan => {
              const clanMembers = teamMembers.filter(m => m.clanId === clan.id);
              const clanProjects = projects.filter(p => p.clanId === clan.id);

              return (
                <div 
                  key={clan.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between transition-all border-l-4"
                  style={{ borderLeftColor: getClanIndicatorBg(clan.id) }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${clan.bg} ${clan.text} border ${clan.border}`}>
                        {clan.name}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Clan Segment</span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-semibold italic">
                      "{clan.description}"
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-100 dark:border-slate-850 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-extrabold">Active Portfolios</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{clanProjects.length}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-100 dark:border-slate-850 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-extrabold">Roster Size</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{clanMembers.length} Members</p>
                      </div>
                    </div>

                    {/* Team Members assigned to this Clan */}
                    <div className="space-y-2 mb-6">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Assigned Team Members
                      </h4>
                      {clanMembers.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-600 italic">No operators currently assigned. Assign using the top button.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {clanMembers.map(member => (
                            <div 
                              key={member.id} 
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300"
                            >
                              {member.avatarUrl ? (
                                <img src={member.avatarUrl} alt={member.name} className="w-4 h-4 rounded-full object-cover" />
                              ) : (
                                <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-[8px] font-bold">
                                  {member.initials || '??'}
                                </span>
                              )}
                              <span className="font-bold">{member.name}</span>
                              <span className="text-[9px] text-slate-400">({member.role})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                    <button
                      onClick={() => setIsolatedClanId(clan.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition duration-150 cursor-pointer border ${
                        isolatedClanId === clan.id 
                          ? 'bg-blue-600 text-white border-transparent' 
                          : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border-blue-500/20'
                      }`}
                    >
                      {isolatedClanId === clan.id ? '✓ Currently Isolating' : 'Isolate Workload'}
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedClanId(clan.id);
                        setShowAssignClanModal(true);
                      }}
                      className="px-3.5 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      title="Add Member to Clan"
                    >
                      + Add Operator
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. ADD PORTFOLIO / PROJECT MODAL */}
      {/* ==================================================== */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-text animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowAddProjectModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" /> Create Operational Project
            </h3>
            <p className="text-xs text-slate-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              Register a new operational workload portfolio with custom details and assigned clan.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Project Name</label>
                  <input 
                    type="text"
                    required
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    placeholder="e.g. Beta Warehouse Rollout"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Client Name / Sponsor</label>
                  <input 
                    type="text"
                    required
                    value={newProjClient}
                    onChange={(e) => setNewProjClient(e.target.value)}
                    placeholder="e.g. Acme Logistics Group"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description / Mission Brief</label>
                <textarea 
                  rows={3}
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Summarize the core target and system parameters..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Start Date</label>
                  <input 
                    type="date"
                    required
                    value={newProjStartDate}
                    onChange={(e) => setNewProjStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Assigned Clan Domain</label>
                  <select
                    value={newProjClanId}
                    onChange={(e) => setNewProjClanId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                  >
                    {CLANS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Initial Project Status</label>
                  <select
                    value={newProjStatus}
                    onChange={(e) => setNewProjStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On-hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Initial Workflow Task Chunks (Comma Separated)
                </label>
                <input 
                  type="text"
                  value={newProjTasksInput}
                  onChange={(e) => setNewProjTasksInput(e.target.value)}
                  placeholder="e.g. Review vendor terms, Seed test container, Draft SLA specifications"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">Each comma-separated clause becomes a toggleable workflow milestone check.</p>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Create Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 7. CLAN ASSIGNMENT MODAL */}
      {/* ==================================================== */}
      {showAssignClanModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-text animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowAssignClanModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" /> Assign Operator to Clan
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Allocate a team member to a specific tactical clan segment.
            </p>

            <form onSubmit={handleAssignClan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Select Team Member</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                >
                  <option value="">-- Choose Operator --</option>
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Target Clan Segment</label>
                <select
                  value={selectedClanId}
                  onChange={(e) => setSelectedClanId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                >
                  {CLANS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignClanModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedMemberId}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
