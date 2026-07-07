import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  TrendingUp, 
  FolderIcon, 
  Users, 
  Clock, 
  AlertTriangle, 
  TrendingDown, 
  Star, 
  Award, 
  Zap, 
  FolderUp, 
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle2,
  Trash2,
  Activity,
  Terminal,
  Plus,
  Send,
  X,
  RefreshCw,
  LayoutGrid,
  Eye,
  EyeOff,
  BriefcaseIcon
} from 'lucide-react';
import { Project, Task, TeamMember, GrowthInsight, FeedEvent, User } from '../types';
import { CLANS } from '../data';

interface DashboardViewProps {
  currentUser: User | null;
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
  insights: GrowthInsight[];
  onToggleTaskCompletion: (id: string) => void;
  onDeleteTask: (id: string) => void;
  searchQuery: string;
  feedEvents: FeedEvent[];
  onUpdateFeed: (updated: FeedEvent[]) => void;
}

export default function DashboardView({
  currentUser,
  projects,
  tasks,
  teamMembers,
  insights,
  onToggleTaskCompletion,
  onDeleteTask,
  searchQuery,
  feedEvents,
  onUpdateFeed
}: DashboardViewProps) {
  // Segmented control to toggle between both visual layouts
  const [layoutMode, setLayoutMode] = useState<'inventory' | 'performance'>('inventory');

  // Tab state for operations charts
  const [activeChartTab, setActiveChartTab] = useState<'attendance' | 'clan_workloads' | 'project_rings'>('attendance');

  // Quick Logs Form state
  const [quickLogText, setQuickLogText] = useState('');
  const [quickLogStatus, setQuickLogStatus] = useState<'success' | 'warning' | 'error' | 'info'>('info');
  const [quickLogMember, setQuickLogMember] = useState('');

  // Toggle for showing only current clan's tasks/workload on the dashboard
  const [showOnlyMyClanTasks, setShowOnlyMyClanTasks] = useState<boolean>(true);

  // Determine user role properties
  const isAdmin = !currentUser || currentUser.role === 'Admin';
  const myClanId = currentUser?.clanId;
  const myClanInfo = CLANS.find(c => c.id === myClanId);

  // Clan operations metrics
  const vanguardProj = projects.filter(p => p.clanId === 'vanguard');
  const synapseProj = projects.filter(p => p.clanId === 'synapse');
  const sentinelProj = projects.filter(p => p.clanId === 'sentinel');
  const forgeProj = projects.filter(p => p.clanId === 'forge');

  const vanguardTasks = tasks.filter(t => t.clanId === 'vanguard' && !t.completed);
  const synapseTasks = tasks.filter(t => t.clanId === 'synapse' && !t.completed);
  const sentinelTasks = tasks.filter(t => t.clanId === 'sentinel' && !t.completed);
  const forgeTasks = tasks.filter(t => t.clanId === 'forge' && !t.completed);

  const clanStats = [
    { 
      id: 'vanguard', 
      name: 'Alpha Vanguard', 
      projectsCount: vanguardProj.length, 
      activeTasks: vanguardTasks.length,
      load: vanguardProj.length * 2 + vanguardTasks.length, // composite load score
      colorClass: 'text-indigo-500 dark:text-indigo-400',
      accentClass: 'bg-indigo-500',
      bgClass: 'bg-indigo-500/10 border border-indigo-500/15'
    },
    { 
      id: 'synapse', 
      name: 'Beta Synapse', 
      projectsCount: synapseProj.length, 
      activeTasks: synapseTasks.length,
      load: synapseProj.length * 2 + synapseTasks.length,
      colorClass: 'text-amber-500 dark:text-amber-400',
      accentClass: 'bg-amber-500',
      bgClass: 'bg-amber-500/10 border border-amber-500/15'
    },
    { 
      id: 'sentinel', 
      name: 'Omega Sentinel', 
      projectsCount: sentinelProj.length, 
      activeTasks: sentinelTasks.length,
      load: sentinelProj.length * 2 + sentinelTasks.length,
      colorClass: 'text-emerald-500 dark:text-emerald-400',
      accentClass: 'bg-emerald-500',
      bgClass: 'bg-emerald-500/10 border border-emerald-500/15'
    },
    { 
      id: 'forge', 
      name: 'Delta Forge', 
      projectsCount: forgeProj.length, 
      activeTasks: forgeTasks.length,
      load: forgeProj.length * 2 + forgeTasks.length,
      colorClass: 'text-rose-500 dark:text-rose-400',
      accentClass: 'bg-rose-500',
      bgClass: 'bg-rose-500/10 border border-rose-500/15'
    }
  ];

  const maxLoad = Math.max(...clanStats.map(c => c.load), 1);

  // Quick Log Submit handler
  const handlePostQuickLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLogText.trim()) return;

    const memberObj = teamMembers.find(m => m.id === quickLogMember) || { name: currentUser?.name || 'Admin User', id: currentUser?.id || 'admin' };
    const timeStr = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newEvent: FeedEvent = {
      id: `feed_${Date.now()}`,
      memberId: memberObj.id,
      memberName: memberObj.name,
      action: 'status_change',
      detail: quickLogText.trim(),
      time: timeStr,
      statusType: quickLogStatus
    };

    onUpdateFeed([newEvent, ...feedEvents]);
    setQuickLogText('');
  };

  const handleDeleteLogEvent = (id: string) => {
    const updated = feedEvents.filter(fe => fe.id !== id);
    onUpdateFeed(updated);
  };
  
  // Filtered projects for stats & lists
  const myClanProjects = projects.filter(p => p.clanId === myClanId);
  const activeProjects = isAdmin ? projects.filter(p => p.status === 'active') : myClanProjects.filter(p => p.status === 'active');
  const inactiveProjects = isAdmin ? projects.filter(p => p.status !== 'active') : myClanProjects.filter(p => p.status !== 'active');

  // Tasks filters based on RBAC rules
  const pendingTasks = tasks.filter(t => !t.completed);
  
  // Decide task list based on user role and switch state
  const rbacTasks = (isAdmin || !myClanId || !showOnlyMyClanTasks)
    ? pendingTasks
    : pendingTasks.filter(t => t.clanId === myClanId);

  const urgentCount = rbacTasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;

  // Filter tasks & insights based on header search query
  const filteredTasks = rbacTasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInsights = insights.filter(ins =>
    ins.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ins.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // SVG Bar Chart Dimensions & Interactions
  const chartData = [
    { day: 'Mon', rate: 92, height: 140 },
    { day: 'Tue', rate: 95, height: 165 },
    { day: 'Wed', rate: 98, height: 195 },
    { day: 'Thu', rate: 100, height: 220 },
    { day: 'Fri', rate: 96, height: 180 },
  ];
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Growth Insights Icon mapping
  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'task':
        return <Briefcase className="w-5 h-5 text-blue-400" />;
      case 'milestone':
        return <Award className="w-5 h-5 text-amber-400" />;
      case 'quick-win':
        return <Zap className="w-5 h-5 text-sky-400" />;
      case 'asset':
        return <FolderUp className="w-5 h-5 text-emerald-400" />;
      case 'attendance':
        return <Star className="w-5 h-5 text-violet-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-slate-400" />;
    }
  };

  const getInsightBg = (category: string) => {
    switch (category) {
      case 'task': return 'bg-blue-950/40 border-blue-800/25';
      case 'milestone': return 'bg-amber-950/40 border-amber-800/25';
      case 'quick-win': return 'bg-sky-950/40 border-sky-800/25';
      case 'asset': return 'bg-emerald-950/40 border-emerald-800/25';
      case 'attendance': return 'bg-violet-950/40 border-violet-800/25';
      default: return 'bg-slate-900/40 border-slate-800/25';
    }
  };

  // Stats calculation for the current user
  const displayProjectsCount = isAdmin ? projects.length : myClanProjects.length;
  const displayActiveProjectsCount = isAdmin ? projects.filter(p => p.status === 'active').length : myClanProjects.filter(p => p.status === 'active').length;
  const displayAvgEfficiency = (isAdmin ? projects : myClanProjects).length
    ? Math.round((isAdmin ? projects : myClanProjects).reduce((sum, p) => sum + (p.efficiency || 0), 0) / (isAdmin ? projects : myClanProjects).length)
    : 85;

  const clanOperatorCount = teamMembers.filter(m => m.clanId === myClanId).length;

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto animate-fade-in pb-12 font-sans select-none">
      
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/60 dark:border-slate-900 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
              Welcome back, <span className="text-blue-600 dark:text-blue-400">{currentUser?.name || 'Guest Operator'}</span>
            </h2>
            {myClanInfo && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${myClanInfo.bg} ${myClanInfo.text} border ${myClanInfo.border}`}>
                {myClanInfo.name}
              </span>
            )}
            <span className="text-xs font-bold text-slate-400">({currentUser?.role || 'Operator'})</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {isAdmin 
              ? "Global System Insights: Full administration over portfolio operations and segment workloads." 
              : `Clan Workspace: Showing workload telemetry isolated to the ${myClanInfo?.name || 'assigned'} unit.`}
          </p>
        </div>

        {/* Dynamic Layout segmented switcher */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center shadow-inner">
            <button
              onClick={() => setLayoutMode('inventory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                layoutMode === 'inventory'
                  ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Inventory & Assets
            </button>
            <button
              onClick={() => setLayoutMode('performance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                layoutMode === 'performance'
                  ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Team Performance
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 px-3.5 py-1.5 rounded-full shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>Oct 24, 2023</span>
          </div>
        </div>
      </div>

      {/* Connected Workspace Focus Banner */}
      {!isAdmin && myClanInfo && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
              <Layers className="w-4.5 h-4.5" />
            </span>
            <div>
              <p className="text-xs text-slate-900 dark:text-slate-200 font-bold">
                Minimal Distraction Layout Active
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                We've filtered your workspace to show ONLY the <span className="font-extrabold text-blue-500">{myClanInfo.name}</span> workload. Use the toggle next to tasks to review the rest of the connected team's active pipeline.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowOnlyMyClanTasks(!showOnlyMyClanTasks)}
            className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs shrink-0"
          >
            {showOnlyMyClanTasks ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showOnlyMyClanTasks ? "Review Connected Workspace" : "Lock Clan Focus"}
          </button>
        </div>
      )}

      {/* METRICS Bento Grid (Conditional Layout Mode rendering) */}
      {layoutMode === 'inventory' ? (
        /* VARIANT 1: Inventory & Accounts Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1: Projects Breakdown */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[155px]">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isAdmin ? "Global Portfolios" : "Clan Portfolios"}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
                {displayProjectsCount}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 font-semibold">
                {isAdmin ? "Active implementations" : "Assigned to your Clan"}
              </p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: isAdmin ? '65%' : '100%' }}></div>
            </div>
          </div>

          {/* Card 2: Productivity Efficiency */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[155px]">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Accuracy</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
                  {displayAvgEfficiency}%
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  ↑ +3% WoW
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 font-semibold">
                {isAdmin ? "Overall team efficiency" : "Your Clan completion rate"}
              </p>
            </div>
          </div>

          {/* Card 3: Ecosystem Assets */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[155px] relative overflow-hidden group">
            {/* Folder watermarked graphic */}
            <div className="absolute -right-4 -top-4 text-slate-100 dark:text-slate-900/40 group-hover:scale-110 transition-transform duration-500 pointer-events-none select-none">
              <FolderIcon className="w-32 h-32" />
            </div>
            <div className="flex justify-between items-start relative z-10">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <FolderIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider relative z-10">Assets</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
                {isAdmin ? "1.2k" : "340"}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 font-semibold">
                {isAdmin ? "Managed files in ecosystem" : "Your Clan document assets"}
              </p>
            </div>
          </div>

          {/* Card 4: Total Accounts (Accent Filled Box Style) */}
          <div className="bg-slate-950 dark:bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-[155px]">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-600 text-white rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clients Onboard</span>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-white leading-none">
                {isAdmin ? "48" : "12"}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 font-semibold">
                {isAdmin ? "Active client portfolios" : "Sponsors linked to Clan"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* VARIANT 2: Team Performance Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Team Strength */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[155px]">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clan Roster</span>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
                {isAdmin ? teamMembers.length : clanOperatorCount}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 font-semibold">
                {isAdmin ? "Total active operators" : "Operators in your Clan"}
              </p>
            </div>
          </div>

          {/* Avg. Punctuality */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[155px]">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Punctuality</span>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">94%</h3>
              <p className="text-xs text-slate-500 mt-1.5 font-semibold">On-time arrival rate</p>
            </div>
          </div>

          {/* Active Now */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[155px]">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Now</span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
                  {isAdmin ? "132" : Math.max(1, Math.round(clanOperatorCount * 0.8))}
                </h3>
                <span className="relative flex h-3 w-3 mt-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 font-semibold">Members currently clocked in</p>
            </div>
          </div>

          {/* Efficiency */}
          <div className="bg-slate-950 dark:bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-[155px]">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-600 text-white rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Efficiency</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-extrabold text-white leading-none">87%</h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                  ↑ +12% WoW
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 font-semibold">Overall team productivity</p>
            </div>
          </div>
        </div>
      )}

      {/* LOWER SECTION: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CHARTS CONTAINER CARD */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Header with Switcher Tabs */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/30">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-blue-500" />
                  Operations Analytics {myClanInfo && <span className="text-[11px] font-bold text-indigo-500">({myClanInfo.name} Focus)</span>}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Live metrics across logistics, clans, and attendance</p>
              </div>

              {/* Segmented controls */}
              <div className="flex bg-slate-200/50 dark:bg-slate-900/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs shrink-0 self-stretch sm:self-auto">
                <button
                  onClick={() => setActiveChartTab('attendance')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                    activeChartTab === 'attendance'
                      ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Weekly Attendance
                </button>
                <button
                  onClick={() => setActiveChartTab('clan_workloads')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                    activeChartTab === 'clan_workloads'
                      ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Clan Workloads
                </button>
                <button
                  onClick={() => setActiveChartTab('project_rings')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                    activeChartTab === 'project_rings'
                      ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Project Progress
                </button>
              </div>
            </div>

            {/* CHART VIEWPORTS */}
            <div className="p-6 h-[290px] flex items-stretch">
              {activeChartTab === 'attendance' && (
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span>Average active: 96.5%</span>
                    <span>Goal: 98%</span>
                  </div>
                  <div className="flex items-end justify-between flex-grow h-36 px-4">
                    {chartData.map((bar, idx) => (
                      <div 
                        key={bar.day} 
                        className="flex flex-col items-center group/bar cursor-pointer"
                        onMouseEnter={() => setHoveredBar(idx)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        <div className="relative w-12 sm:w-16 flex justify-center">
                          {hoveredBar === idx && (
                            <div className="absolute -top-10 bg-slate-950 text-white border border-slate-800 text-[10px] px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                              {bar.rate}% arrived
                            </div>
                          )}
                          <div 
                            className="w-8 sm:w-10 bg-slate-150 dark:bg-slate-900 rounded-t-lg overflow-hidden relative flex items-end"
                            style={{ height: `${bar.height}px` }}
                          >
                            <div className="bg-blue-600 hover:bg-blue-500 transition-colors w-full h-[85%] rounded-t-lg" />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-500 mt-2">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeChartTab === 'clan_workloads' && (
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                    <span>Segment Allocation Load</span>
                    <span>Max Index: {maxLoad}</span>
                  </div>
                  <div className="space-y-3 flex-grow overflow-y-auto pr-1">
                    {clanStats.map((clan) => {
                      const loadPercentage = Math.round((clan.load / maxLoad) * 100);
                      const isMyClan = clan.id === myClanId;
                      return (
                        <div 
                          key={clan.id} 
                          className={`space-y-1.5 p-2 rounded-xl transition duration-150 ${
                            isMyClan ? 'bg-blue-500/10 border border-blue-500/20' : ''
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${clan.accentClass}`} />
                              {clan.name}
                              {isMyClan && (
                                <span className="bg-blue-500 text-white text-[8px] font-black px-1 rounded">
                                  My Clan
                                </span>
                              )}
                            </span>
                            <span className="text-slate-500 font-bold">
                              {clan.projectsCount} Projects ({clan.activeTasks} Pending Tasks)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isMyClan ? 'bg-blue-500' : clan.accentClass
                              }`}
                              style={{ width: `${loadPercentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeChartTab === 'project_rings' && (
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span>Ongoing Portfolios Progress</span>
                    <span>Filtered view</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 flex-grow overflow-y-auto max-h-[220px] pr-1">
                    {activeProjects.map((p) => {
                      const completedTasks = p.tasks?.filter(t => t.completed).length || 0;
                      const totalTasks = p.tasks?.length || 0;
                      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : p.efficiency;
                      
                      return (
                        <div 
                          key={p.id} 
                          className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-900 p-3 rounded-xl flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{p.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{p.client}</p>
                          </div>
                          <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-500/20 font-black text-xs text-blue-600 dark:text-blue-400">
                            {progress}%
                          </div>
                        </div>
                      );
                    })}
                    {activeProjects.length === 0 && (
                      <div className="col-span-2 flex items-center justify-center h-full text-slate-400 text-xs italic">
                        No active portfolios in this context.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* QUICK LOGS FEED AND LOG TERMINAL */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4.5 h-4.5 text-blue-500" />
                  System Activity Logs & Terminal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time system events dispatcher & log feed</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">Live Feed</span>
              </div>
            </div>

            {/* QUICK LOG FORM */}
            <form onSubmit={handlePostQuickLog} className="p-5 border-b border-slate-100 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-950/40 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-6 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Log Entry Message</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={quickLogText}
                    onChange={(e) => setQuickLogText(e.target.value)}
                    placeholder="Enter quick action log detail..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Team Domain/Member</label>
                <select
                  value={quickLogMember}
                  onChange={(e) => setQuickLogMember(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">{currentUser?.name || 'Self'} ({currentUser?.role || 'Operator'})</option>
                  {teamMembers.filter(m => isAdmin || m.clanId === myClanId).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Severity</label>
                <select
                  value={quickLogStatus}
                  onChange={(e) => setQuickLogStatus(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <button
                  type="submit"
                  className="w-full h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  title="Dispatch Entry"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* SCROLLABLE LOG FEED */}
            <div className="p-5 flex-grow overflow-y-auto max-h-[300px] divide-y divide-slate-100 dark:divide-slate-900 scrollbar-hide">
              {feedEvents.length > 0 ? (
                <div className="space-y-4">
                  {feedEvents.map((event) => {
                    let sevColor = 'bg-blue-500';
                    let bgHover = 'hover:bg-blue-50/10 dark:hover:bg-blue-950/5';
                    if (event.statusType === 'success') { sevColor = 'bg-emerald-500'; bgHover = 'hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5'; }
                    else if (event.statusType === 'warning') { sevColor = 'bg-amber-500'; bgHover = 'hover:bg-amber-50/10 dark:hover:bg-amber-950/5'; }
                    else if (event.statusType === 'error') { sevColor = 'bg-rose-500'; bgHover = 'hover:bg-rose-50/10 dark:hover:bg-rose-950/5'; }

                    return (
                      <div 
                        key={event.id} 
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors relative group/item ${bgHover}`}
                      >
                        {/* Severity Line Node */}
                        <div className="flex flex-col items-center shrink-0 mt-1.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${sevColor} ring-4 ring-white dark:ring-slate-950 shadow-sm`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                              {event.memberName}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                              {event.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                            {event.detail}
                          </p>
                        </div>

                        {/* Interactive Clear Node */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteLogEvent(event.id)}
                            className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1 cursor-pointer shrink-0"
                            title="Purge Log Record"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Terminal className="w-10 h-10 stroke-1 mb-2 text-slate-500" />
                  <p className="text-xs font-bold">System Log Empty</p>
                  <p className="text-[10px] mt-0.5">Post an activity above to initialize.</p>
                </div>
              )}
            </div>
          </div>

        </div>


        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* NEEDS ATTENTION ACTION LOGS */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30 shrink-0">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                Needs Attention
                {urgentCount > 0 && (
                  <span className="bg-red-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm animate-pulse shrink-0">
                    {urgentCount}
                  </span>
                )}
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {showOnlyMyClanTasks && !isAdmin ? "Clan Priority Only" : "All Pipeline"}
              </span>
            </div>

            <div className="p-4 flex-grow overflow-y-auto max-h-[320px] scrollbar-hide">
              {filteredTasks.length > 0 ? (
                <div className="space-y-3">
                  {filteredTasks.map((task) => {
                    const isUrgent = task.priority === 'urgent';
                    const taskClan = CLANS.find(c => c.id === task.clanId);
                    
                    return (
                      <div 
                        key={task.id}
                        className={`p-3.5 border rounded-xl hover:shadow-md transition-shadow relative group ${
                          isUrgent 
                            ? 'border-red-200 dark:border-red-900/40 bg-red-500/5 dark:bg-red-950/10' 
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                        }`}
                      >
                        {/* Priority tag header */}
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full tracking-wider border ${
                              isUrgent 
                                ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30' 
                                : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30'
                            }`}>
                              {task.priority}
                            </span>
                            {taskClan && (
                              <span className={`text-[8px] font-black uppercase px-1 rounded ${taskClan.bg} ${taskClan.text}`}>
                                {taskClan.name.split(' ')[1] || taskClan.name}
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                            {task.dueTime}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-semibold">
                          {task.description}
                        </p>

                        {/* Interactive Checkbox Action and Delete trigger */}
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-900/60 flex items-center justify-between gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            onClick={() => onToggleTaskCompletion(task.id)}
                            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                          </button>
                          
                          {(isAdmin || myClanId === task.clanId) && (
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              title="Delete Task"
                              className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 stroke-1 mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">All Operations Clear</p>
                </div>
              )}
            </div>
          </div>


          {/* COMPACT GROWTH INSIGHTS LIST */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Growth Insights
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Performance awards and operational milestones</p>
              </div>
              <span className="text-[9px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase">Credits Feed</span>
            </div>

            <div className="p-4 overflow-y-auto flex-grow max-h-[290px] divide-y divide-slate-100 dark:divide-slate-900 scrollbar-hide">
              {filteredInsights.length > 0 ? (
                <ul className="space-y-3">
                  {filteredInsights.map((ins) => (
                    <li 
                      key={ins.id} 
                      className="flex items-start gap-3 p-2.5 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/20 dark:border-slate-800/20 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900/30 transition-all cursor-pointer group"
                    >
                      {/* Compact Category Icon indicator */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${getInsightBg(ins.category)}`}>
                        {React.cloneElement(getInsightIcon(ins.category), { className: 'w-4 h-4' })}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5 gap-1">
                          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">{ins.credits}</span>
                          <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap shrink-0">{ins.time}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {ins.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate leading-relaxed">
                          {ins.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Layers className="w-8 h-8 stroke-1 mb-2" />
                  <p className="text-xs font-bold">No insights found</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
