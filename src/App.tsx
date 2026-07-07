import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle, CheckSquare, X } from 'lucide-react';

// Data and Types
import { 
  INITIAL_PROJECTS, 
  INITIAL_TASKS, 
  INITIAL_TEAM_MEMBERS, 
  INITIAL_FEED_EVENTS, 
  INITIAL_ATTENDANCE_LOGS, 
  INITIAL_GROWTH_INSIGHTS, 
  INITIAL_FILES, 
  INITIAL_REPORTS,
  INITIAL_USERS,
  INITIAL_CLIENTS
} from './data';
import { Project, Task, TeamMember, FeedEvent, AttendanceLog, GrowthInsight, IMSFile, IMSReport, User, Client, UserRole } from './types';

// Child Components
import LoginView from './components/LoginView';
import SignOutView from './components/SignOutView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import TeamView from './components/TeamView';
import FilesView from './components/FilesView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import ProjectsView from './components/ProjectsView';
import ClientsView from './components/ClientsView';

export default function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isSignedOut, setIsSignedOut] = useState<boolean>(false);

  // RBAC currentUser state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Layout states
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(true); // default theme is Dark Mode per explicit instructions
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);

  // State managed collections for local/offline support
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [insights, setInsights] = useState<GrowthInsight[]>([]);
  const [files, setFiles] = useState<IMSFile[]>([]);
  const [reports, setReports] = useState<IMSReport[]>([]);

  // Task Creator Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'high' | 'medium'>('high');

  // Load state from localStorage on init
  useEffect(() => {
    // Auth Check
    const authSaved = localStorage.getItem('ims_auth');
    if (authSaved === 'false') {
      setIsAuthenticated(false);
    }

    // Current RBAC User
    const localUser = localStorage.getItem('ims_current_user');
    if (localUser) setCurrentUser(JSON.parse(localUser));
    else setCurrentUser(INITIAL_USERS[0]); // Eleanor Vance (Admin) by default

    // Projects
    const localProjects = localStorage.getItem('ims_projects');
    if (localProjects) setProjects(JSON.parse(localProjects));
    else setProjects(INITIAL_PROJECTS);

    // Tasks
    const localTasks = localStorage.getItem('ims_tasks');
    if (localTasks) setTasks(JSON.parse(localTasks));
    else setTasks(INITIAL_TASKS);

    // Team Members
    const localTeam = localStorage.getItem('ims_team');
    if (localTeam) setTeamMembers(JSON.parse(localTeam));
    else setTeamMembers(INITIAL_TEAM_MEMBERS);

    // Clients
    const localClients = localStorage.getItem('ims_clients');
    if (localClients) setClients(JSON.parse(localClients));
    else setClients(INITIAL_CLIENTS);

    // Feed events
    const localFeed = localStorage.getItem('ims_feed');
    if (localFeed) setFeedEvents(JSON.parse(localFeed));
    else setFeedEvents(INITIAL_FEED_EVENTS);

    // Attendance Logs
    const localLogs = localStorage.getItem('ims_logs');
    if (localLogs) setAttendanceLogs(JSON.parse(localLogs));
    else setAttendanceLogs(INITIAL_ATTENDANCE_LOGS);

    // Growth Insights
    const localInsights = localStorage.getItem('ims_insights');
    if (localInsights) setInsights(JSON.parse(localInsights));
    else setInsights(INITIAL_GROWTH_INSIGHTS);

    // Files
    const localFiles = localStorage.getItem('ims_files');
    if (localFiles) setFiles(JSON.parse(localFiles));
    else setFiles(INITIAL_FILES);

    // Reports
    const localReports = localStorage.getItem('ims_reports');
    if (localReports) setReports(JSON.parse(localReports));
    else setReports(INITIAL_REPORTS);

    // Dark Mode class activation
    const savedTheme = localStorage.getItem('ims_theme');
    if (savedTheme === 'light') {
      setIsDark(false);
    } else {
      setIsDark(true);
    }
  }, []);

  // Update HTML Element classes whenever theme preference changes
  useEffect(() => {
    const rootElement = document.documentElement;
    if (isDark) {
      rootElement.classList.add('dark');
      localStorage.setItem('ims_theme', 'dark');
    } else {
      rootElement.classList.remove('dark');
      localStorage.setItem('ims_theme', 'light');
    }
  }, [isDark]);

  // Sync state functions with localStorage
  const syncProjects = (updated: Project[]) => {
    setProjects(updated);
    localStorage.setItem('ims_projects', JSON.stringify(updated));
  };

  const syncTasks = (updated: Task[]) => {
    setTasks(updated);
    localStorage.setItem('ims_tasks', JSON.stringify(updated));
  };

  const syncTeam = (updated: TeamMember[]) => {
    setTeamMembers(updated);
    localStorage.setItem('ims_team', JSON.stringify(updated));
  };

  const syncClients = (updated: Client[]) => {
    setClients(updated);
    localStorage.setItem('ims_clients', JSON.stringify(updated));
  };

  const syncFeed = (updated: FeedEvent[]) => {
    setFeedEvents(updated);
    localStorage.setItem('ims_feed', JSON.stringify(updated));
  };

  const syncLogs = (updated: AttendanceLog[]) => {
    setAttendanceLogs(updated);
    localStorage.setItem('ims_logs', JSON.stringify(updated));
  };

  const syncInsights = (updated: GrowthInsight[]) => {
    setInsights(updated);
    localStorage.setItem('ims_insights', JSON.stringify(updated));
  };

  const syncFiles = (updated: IMSFile[]) => {
    setFiles(updated);
    localStorage.setItem('ims_files', JSON.stringify(updated));
  };

  const syncReports = (updated: IMSReport[]) => {
    setReports(updated);
    localStorage.setItem('ims_reports', JSON.stringify(updated));
  };

  // Switch simulated RBAC Role
  const handleSwitchRole = (roleName: UserRole) => {
    const matchingUser = INITIAL_USERS.find(u => u.role === roleName) || INITIAL_USERS[0];
    setCurrentUser(matchingUser);
    localStorage.setItem('ims_current_user', JSON.stringify(matchingUser));
    
    // Add activity log
    const newEvent: FeedEvent = {
      id: `feed_${Date.now()}`,
      memberId: matchingUser.id,
      memberName: matchingUser.name,
      action: 'status_change',
      detail: `Simulated Role switched to: ${matchingUser.role}`,
      time: 'Just Now',
      statusType: 'info'
    };
    syncFeed([newEvent, ...feedEvents]);
  };

  // HANDLERS
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsSignedOut(false);
    localStorage.setItem('ims_auth', 'true');
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setIsSignedOut(true);
    localStorage.setItem('ims_auth', 'false');
  };

  const handleReturnToLogin = () => {
    setIsSignedOut(false);
  };

  const handleToggleTaskCompletion = (taskId: string) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    syncTasks(updated);

    // Add activity log
    const completedTask = tasks.find(t => t.id === taskId);
    if (completedTask && !completedTask.completed) {
      const newEvent: FeedEvent = {
        id: `feed_${Date.now()}`,
        memberId: 'admin',
        memberName: 'Admin',
        action: 'status_change',
        detail: `Completed task: ${completedTask.title}`,
        time: 'Just Now',
        statusType: 'success'
      };
      syncFeed([newEvent, ...feedEvents]);

      // Add a growth insight credit reward
      const newInsight: GrowthInsight = {
        id: `ins_${Date.now()}`,
        title: `Mitigated Risk: ${completedTask.title}`,
        description: `Operational bottleneck resolved by Admin successfully in offline workspace.`,
        type: 'Risk Solved',
        credits: '+15 Cr',
        time: 'Just Now',
        category: 'task'
      };
      syncInsights([newInsight, ...insights]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    syncTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDesc || 'No details provided.',
      priority: newTaskPriority,
      dueTime: 'Today',
      completed: false
    };

    const updatedTasks = [newTask, ...tasks];
    syncTasks(updatedTasks);

    // Reset Form
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('high');
    setShowAddTaskModal(false);

    // Append standard growth insight notification
    const newInsight: GrowthInsight = {
      id: `ins_${Date.now()}`,
      title: `Created Alert: ${newTask.title}`,
      description: `New high-priority system task has been registered offline.`,
      type: 'Alert Logged',
      credits: '+5 Cr',
      time: 'Just Now',
      category: 'quick-win'
    };
    syncInsights([newInsight, ...insights]);
  };

  const handleAddTeamMember = (memberData: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: `mem_${Date.now()}`,
      totalHoursToday: '0.0h'
    };

    syncTeam([newMember, ...teamMembers]);

    // Log clock event feed
    const generatedMemberId = `mem_${Date.now()}`;
    const newEvent: FeedEvent = {
      id: `feed_${Date.now()}`,
      memberId: generatedMemberId,
      memberName: memberData.name,
      action: 'clock_in',
      detail: `Registered and clocked in.`,
      time: 'Just Now',
      statusType: 'success'
    };
    syncFeed([newEvent, ...feedEvents]);

    // Append to attendance logs
    const newLog: AttendanceLog = {
      id: `log_${Date.now()}`,
      memberId: generatedMemberId,
      memberName: memberData.name,
      avatarUrl: memberData.avatarUrl,
      initials: memberData.initials,
      date: 'Today',
      checkInTime: '09:00 AM',
      status: memberData.status === 'online' ? 'On Time' : memberData.status === 'away' ? 'Late' : 'On Leave',
      totalHours: '0.0h'
    };
    syncLogs([newLog, ...attendanceLogs]);
  };

  const handleClockAction = (memberId: string, action: 'clock_in' | 'clock_out') => {
    const updatedMembers = teamMembers.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          status: action === 'clock_in' ? 'online' : ('away' as const),
          clockInTime: action === 'clock_in' ? '09:00 AM' : m.clockInTime,
          totalHoursToday: action === 'clock_out' ? '8.0h' : m.totalHoursToday
        };
      }
      return m;
    });

    syncTeam(updatedMembers);

    const targetMember = teamMembers.find(m => m.id === memberId);
    if (targetMember) {
      const newEvent: FeedEvent = {
        id: `feed_${Date.now()}`,
        memberId: targetMember.id,
        memberName: targetMember.name,
        action: action,
        detail: action === 'clock_in' ? 'Clocked in to shift' : 'Clocked out of shift',
        time: 'Just Now',
        statusType: action === 'clock_in' ? 'success' : 'info'
      };
      syncFeed([newEvent, ...feedEvents]);

      // Add analytical growth insight log
      const newInsight: GrowthInsight = {
        id: `ins_${Date.now()}`,
        title: `${targetMember.name} ${action === 'clock_in' ? 'Clocked In' : 'Clocked Out'}`,
        description: `${targetMember.name} updated clock parameters inside safe database ledger.`,
        type: 'Log Sync',
        credits: '+10 Cr',
        time: 'Just Now',
        category: 'attendance'
      };
      syncInsights([newInsight, ...insights]);
    }
  };

  const handleAddFile = (fileData: Omit<IMSFile, 'id'>) => {
    const newFile: IMSFile = {
      ...fileData,
      id: `file_${Date.now()}`
    };
    syncFiles([newFile, ...files]);

    // Sync insight log
    const newInsight: GrowthInsight = {
      id: `ins_${Date.now()}`,
      title: `Uploaded: ${fileData.name}`,
      description: `Asset mirrored on local database vault correctly.`,
      type: 'Asset Uploaded',
      credits: '+20 Cr',
      time: 'Just Now',
      category: 'asset'
    };
    syncInsights([newInsight, ...insights]);
  };

  const handleDeleteFile = (id: string) => {
    const updated = files.filter(f => f.id !== id);
    syncFiles(updated);
  };

  const handleAddReport = (reportData: Omit<IMSReport, 'id'>) => {
    const newReport: IMSReport = {
      ...reportData,
      id: `rep_${Date.now()}`
    };
    syncReports([newReport, ...reports]);

    // Sync insight log
    const newInsight: GrowthInsight = {
      id: `ins_${Date.now()}`,
      title: `Sealed Report: ${reportData.title}`,
      description: `Compiled compliance ledger has been structured offline successfully.`,
      type: 'Sealed Audit',
      credits: '+50 Cr',
      time: 'Just Now',
      category: 'milestone'
    };
    syncInsights([newInsight, ...insights]);
  };

  const handleResetFactoryDefaults = () => {
    localStorage.removeItem('ims_projects');
    localStorage.removeItem('ims_tasks');
    localStorage.removeItem('ims_team');
    localStorage.removeItem('ims_feed');
    localStorage.removeItem('ims_logs');
    localStorage.removeItem('ims_insights');
    localStorage.removeItem('ims_files');
    localStorage.removeItem('ims_reports');

    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setTeamMembers(INITIAL_TEAM_MEMBERS);
    setFeedEvents(INITIAL_FEED_EVENTS);
    setAttendanceLogs(INITIAL_ATTENDANCE_LOGS);
    setInsights(INITIAL_GROWTH_INSIGHTS);
    setFiles(INITIAL_FILES);
    setReports(INITIAL_REPORTS);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            currentUser={currentUser}
            projects={projects}
            tasks={tasks}
            teamMembers={teamMembers}
            insights={insights}
            onToggleTaskCompletion={handleToggleTaskCompletion}
            onDeleteTask={handleDeleteTask}
            searchQuery={searchQuery}
            feedEvents={feedEvents}
            onUpdateFeed={syncFeed}
          />
        );
      case 'projects':
        return (
          <ProjectsView 
            currentUser={currentUser}
            projects={projects}
            onUpdateProjects={syncProjects}
            teamMembers={teamMembers}
            onUpdateTeam={syncTeam}
            searchQuery={searchQuery}
          />
        );
      case 'clients':
        return (
          <ClientsView 
            clients={clients}
            onUpdateClients={syncClients}
            projects={projects}
            searchQuery={searchQuery}
          />
        );
      case 'team':
        return (
          <TeamView 
            teamMembers={teamMembers}
            feedEvents={feedEvents}
            attendanceLogs={attendanceLogs}
            onAddTeamMember={handleAddTeamMember}
            onClockAction={handleClockAction}
            searchQuery={searchQuery}
          />
        );
      case 'files':
        return (
          <FilesView 
            files={files}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            searchQuery={searchQuery}
          />
        );
      case 'reports':
        return (
          <ReportsView 
            reports={reports}
            onAddReport={handleAddReport}
            searchQuery={searchQuery}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            isDark={isDark}
            onToggleTheme={() => setIsDark(!isDark)}
            isOfflineSimulated={isOfflineSimulated}
            onToggleOfflineSimulation={() => setIsOfflineSimulated(!isOfflineSimulated)}
            onResetFactoryDefaults={handleResetFactoryDefaults}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
            <p className="font-bold text-sm">Select a Valid Operations View</p>
          </div>
        );
    }
  };

  // SSO Login state check
  if (!isAuthenticated) {
    if (isSignedOut) {
      return <SignOutView onReturnToLogin={handleReturnToLogin} />;
    }
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. WEAK CONNECTION / OFFLINE WARNING BANNER */}
      {isOfflineSimulated && (
        <div className="bg-red-600 text-white text-[11px] font-extrabold px-4 py-2 flex items-center justify-between gap-3 animate-pulse sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Simulated Connection Lost. Local databases are active: Changes sync offline securely.</span>
          </div>
          <button 
            onClick={() => setIsOfflineSimulated(false)}
            className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold"
          >
            Go Online
          </button>
        </div>
      )}

      {/* Primary Grid Layout */}
      <div className="flex">
        
        {/* SIDEBAR NAVIGATION (Desktop and Mobile Drawer) */}
        <Sidebar 
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleSignOut}
          onNewReport={() => {
            setActiveTab('reports');
            alert("Compile New Report: We navigated you to reports page. Click 'Compile New Report' to seal a custom ledger!");
          }}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          onSwitchRole={handleSwitchRole}
        />

        {/* MAIN DISPLAY PORT (Scroll Container) */}
        <div className="flex-1 min-w-0 md:pl-64 flex flex-col min-h-screen">
          
          {/* TOP HEADER COMPONENT */}
          <Header 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onAddTaskClick={() => setShowAddTaskModal(true)}
            onToggleTheme={() => setIsDark(!isDark)}
            isDark={isDark}
            onMenuToggle={() => setIsMobileSidebarOpen(true)}
            onSearchChange={setSearchQuery}
          />

          {/* ACTIVE VIEW WRAPPER */}
          <main className="flex-grow p-4 md:p-6 lg:p-8">
            {renderActiveView()}
          </main>

        </div>
      </div>

      {/* ADD TASK DIALOG MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-text animate-fade-in">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowAddTaskModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-500" /> Log Operational Alert Task
            </h3>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Task Title</label>
                <input 
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Audit storage limits on Node Beta"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                <textarea 
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Provide precise details of operational risk..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                >
                  <option value="urgent">Urgent Alert</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Add Alert Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
