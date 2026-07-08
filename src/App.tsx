import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle, CheckSquare, X } from 'lucide-react';
import { socket, connectSocket, disconnectSocket } from './socket';

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

  // Offline queueing states
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    const stored = localStorage.getItem('ims_offline_queue');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('ims_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const API_BASE = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('ims_jwt_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    return fetch(API_BASE + url, { ...options, headers });
  };

  const queueOperation = (
    type: 'create' | 'update' | 'delete',
    collection: 'projects' | 'tasks' | 'team' | 'clients' | 'feed' | 'logs' | 'insights' | 'files' | 'reports',
    id: string,
    data: any
  ) => {
    const newOp = {
      type,
      collection,
      id,
      data,
      timestamp: Date.now(),
      userRole: currentUser?.role || 'Team Member',
      userName: currentUser?.name || 'Anonymous'
    };
    setOfflineQueue(prev => [...prev, newOp]);
  };

  const syncOfflineData = async () => {
    if (offlineQueue.length === 0) return;
    try {
      const res = await apiFetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify({ operations: offlineQueue })
      });
      if (res.ok) {
        setOfflineQueue([]);
        await loadAllData();
      }
    } catch (err) {
      console.error("Failed to sync offline queue:", err);
    }
  };

  const loadAllData = async () => {
    try {
      const res = await apiFetch('/api/init');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
        setTasks(data.tasks);
        setTeamMembers(data.teamMembers);
        setClients(data.clients);
        setFeedEvents(data.feedEvents);
        setAttendanceLogs(data.attendanceLogs);
        setInsights(data.insights);
        setFiles(data.files);
        setReports(data.reports);

        // Backup to localStorage
        localStorage.setItem('ims_projects', JSON.stringify(data.projects));
        localStorage.setItem('ims_tasks', JSON.stringify(data.tasks));
        localStorage.setItem('ims_team', JSON.stringify(data.teamMembers));
        localStorage.setItem('ims_clients', JSON.stringify(data.clients));
        localStorage.setItem('ims_feed', JSON.stringify(data.feedEvents));
        localStorage.setItem('ims_logs', JSON.stringify(data.attendanceLogs));
        localStorage.setItem('ims_insights', JSON.stringify(data.insights));
        localStorage.setItem('ims_files', JSON.stringify(data.files));
        localStorage.setItem('ims_reports', JSON.stringify(data.reports));
      }
    } catch (err) {
      console.error("Failed to fetch initial data from server, falling back to local storage.", err);
    }
  };

  // Sync offline queue when connection is restored
  useEffect(() => {
    if (!isOfflineSimulated && isAuthenticated) {
      syncOfflineData();
    }
  }, [isOfflineSimulated, isAuthenticated]);

  // Load state from localStorage on init, check auth status
  useEffect(() => {
    const authSaved = localStorage.getItem('ims_auth');
    const token = localStorage.getItem('ims_jwt_token');

    if (authSaved === 'false' || !token) {
      setIsAuthenticated(false);
    } else {
      // Validate session with backend
      apiFetch('/api/auth/me')
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Unauthorized');
        })
        .then(user => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          loadAllData();
        })
        .catch(() => {
          // If offline, trust local auth
          const localUser = localStorage.getItem('ims_current_user');
          if (localUser) {
            setCurrentUser(JSON.parse(localUser));
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        });
    }

    // Load fallback data from localStorage first
    const localProjects = localStorage.getItem('ims_projects');
    setProjects(localProjects ? JSON.parse(localProjects) : INITIAL_PROJECTS);

    const localTasks = localStorage.getItem('ims_tasks');
    setTasks(localTasks ? JSON.parse(localTasks) : INITIAL_TASKS);

    const localTeam = localStorage.getItem('ims_team');
    setTeamMembers(localTeam ? JSON.parse(localTeam) : INITIAL_TEAM_MEMBERS);

    const localClients = localStorage.getItem('ims_clients');
    setClients(localClients ? JSON.parse(localClients) : INITIAL_CLIENTS);

    const localFeed = localStorage.getItem('ims_feed');
    setFeedEvents(localFeed ? JSON.parse(localFeed) : INITIAL_FEED_EVENTS);

    const localLogs = localStorage.getItem('ims_logs');
    setAttendanceLogs(localLogs ? JSON.parse(localLogs) : INITIAL_ATTENDANCE_LOGS);

    const localInsights = localStorage.getItem('ims_insights');
    setInsights(localInsights ? JSON.parse(localInsights) : INITIAL_GROWTH_INSIGHTS);

    const localFiles = localStorage.getItem('ims_files');
    setFiles(localFiles ? JSON.parse(localFiles) : INITIAL_FILES);

    const localReports = localStorage.getItem('ims_reports');
    setReports(localReports ? JSON.parse(localReports) : INITIAL_REPORTS);

    const savedTheme = localStorage.getItem('ims_theme');
    setIsDark(savedTheme !== 'light');
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

  // Socket.io event listeners
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();

      socket.on('projects:update', (project: Project) => {
        setProjects(prev => {
          const exists = prev.some(p => p.id === project.id);
          return exists ? prev.map(p => p.id === project.id ? project : p) : [project, ...prev];
        });
      });
      socket.on('projects:delete', (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
      });

      socket.on('tasks:update', (task: Task) => {
        setTasks(prev => {
          const exists = prev.some(t => t.id === task.id);
          return exists ? prev.map(t => t.id === task.id ? task : t) : [task, ...prev];
        });
      });
      socket.on('tasks:delete', (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
      });

      socket.on('team:update', (member: TeamMember) => {
        setTeamMembers(prev => {
          const exists = prev.some(m => m.id === member.id);
          return exists ? prev.map(m => m.id === member.id ? member : m) : [member, ...prev];
        });
      });

      socket.on('clients:update', (client: Client) => {
        setClients(prev => {
          const exists = prev.some(c => c.id === client.id);
          return exists ? prev.map(c => c.id === client.id ? client : c) : [client, ...prev];
        });
      });

      socket.on('feed:update', (event: FeedEvent) => {
        setFeedEvents(prev => {
          const exists = prev.some(e => e.id === event.id);
          return exists ? prev.map(e => e.id === event.id ? event : e) : [event, ...prev];
        });
      });

      socket.on('logs:update', (log: AttendanceLog) => {
        setAttendanceLogs(prev => {
          const exists = prev.some(l => l.id === log.id);
          return exists ? prev.map(l => l.id === log.id ? log : l) : [log, ...prev];
        });
      });

      socket.on('insights:update', (insight: GrowthInsight) => {
        setInsights(prev => {
          const exists = prev.some(i => i.id === insight.id);
          return exists ? prev.map(i => i.id === insight.id ? insight : i) : [insight, ...prev];
        });
      });

      socket.on('files:update', (file: IMSFile) => {
        setFiles(prev => {
          const exists = prev.some(f => f.id === file.id);
          return exists ? prev.map(f => f.id === file.id ? file : f) : [file, ...prev];
        });
      });
      socket.on('files:delete', (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
      });

      socket.on('reports:update', (report: IMSReport) => {
        setReports(prev => {
          const exists = prev.some(r => r.id === report.id);
          return exists ? prev.map(r => r.id === report.id ? report : r) : [report, ...prev];
        });
      });

      socket.on('system:reset', () => {
        loadAllData();
      });

      return () => {
        socket.off('projects:update');
        socket.off('projects:delete');
        socket.off('tasks:update');
        socket.off('tasks:delete');
        socket.off('team:update');
        socket.off('clients:update');
        socket.off('feed:update');
        socket.off('logs:update');
        socket.off('insights:update');
        socket.off('files:update');
        socket.off('files:delete');
        socket.off('reports:update');
        socket.off('system:reset');
        disconnectSocket();
      };
    }
  }, [isAuthenticated]);

  // Sync state functions with REST API and offline queue
  const syncProjects = (updated: Project[]) => {
    const old = projects;
    setProjects(updated);
    localStorage.setItem('ims_projects', JSON.stringify(updated));

    if (isOfflineSimulated) {
      if (updated.length < old.length) {
        const deleted = old.filter(o => !updated.some(n => n.id === o.id));
        deleted.forEach(p => queueOperation('delete', 'projects', p.id, null));
      } else if (updated.length > old.length) {
        const added = updated.filter(n => !old.some(o => o.id === n.id));
        added.forEach(p => queueOperation('create', 'projects', p.id, p));
      } else {
        updated.forEach(p => {
          const oldP = old.find(o => o.id === p.id);
          if (oldP && JSON.stringify(oldP) !== JSON.stringify(p)) {
            queueOperation('update', 'projects', p.id, p);
          }
        });
      }
    } else {
      if (updated.length < old.length) {
        const deleted = old.filter(o => !updated.some(n => n.id === o.id));
        deleted.forEach(p => apiFetch(`/api/projects/${p.id}`, { method: 'DELETE' }));
      } else if (updated.length > old.length) {
        const added = updated.filter(n => !old.some(o => o.id === n.id));
        added.forEach(p => apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(p) }));
      } else {
        updated.forEach(p => {
          const oldP = old.find(o => o.id === p.id);
          if (oldP && JSON.stringify(oldP) !== JSON.stringify(p)) {
            apiFetch(`/api/projects/${p.id}`, { method: 'PUT', body: JSON.stringify(p) });
          }
        });
      }
    }
  };

  const syncTasks = (updated: Task[]) => {
    const old = tasks;
    setTasks(updated);
    localStorage.setItem('ims_tasks', JSON.stringify(updated));

    if (isOfflineSimulated) {
      if (updated.length < old.length) {
        const deleted = old.filter(o => !updated.some(n => n.id === o.id));
        deleted.forEach(t => queueOperation('delete', 'tasks', t.id, null));
      } else if (updated.length > old.length) {
        const added = updated.filter(n => !old.some(o => o.id === n.id));
        added.forEach(t => queueOperation('create', 'tasks', t.id, t));
      } else {
        updated.forEach(t => {
          const oldT = old.find(o => o.id === t.id);
          if (oldT && JSON.stringify(oldT) !== JSON.stringify(t)) {
            queueOperation('update', 'tasks', t.id, t);
          }
        });
      }
    } else {
      if (updated.length < old.length) {
        const deleted = old.filter(o => !updated.some(n => n.id === o.id));
        deleted.forEach(t => apiFetch(`/api/tasks/${t.id}`, { method: 'DELETE' }));
      } else if (updated.length > old.length) {
        const added = updated.filter(n => !old.some(o => o.id === n.id));
        added.forEach(t => apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(t) }));
      } else {
        updated.forEach(t => {
          const oldT = old.find(o => o.id === t.id);
          if (oldT && JSON.stringify(oldT) !== JSON.stringify(t)) {
            apiFetch(`/api/tasks/${t.id}`, { method: 'PUT', body: JSON.stringify(t) });
          }
        });
      }
    }
  };

  const syncTeam = (updated: TeamMember[]) => {
    const old = teamMembers;
    setTeamMembers(updated);
    localStorage.setItem('ims_team', JSON.stringify(updated));

    if (isOfflineSimulated) {
      if (updated.length > old.length) {
        const added = updated.filter(n => !old.some(o => o.id === n.id));
        added.forEach(m => queueOperation('create', 'team', m.id, m));
      } else {
        updated.forEach(m => {
          const oldM = old.find(o => o.id === m.id);
          if (oldM && JSON.stringify(oldM) !== JSON.stringify(m)) {
            queueOperation('update', 'team', m.id, m);
          }
        });
      }
    } else {
      if (updated.length > old.length) {
        const added = updated.filter(n => !old.some(o => o.id === n.id));
        added.forEach(m => apiFetch('/api/team', { method: 'POST', body: JSON.stringify(m) }));
      } else {
        updated.forEach(m => {
          const oldM = old.find(o => o.id === m.id);
          if (oldM && JSON.stringify(oldM) !== JSON.stringify(m)) {
            apiFetch(`/api/team/${m.id}`, { method: 'PUT', body: JSON.stringify(m) });
          }
        });
      }
    }
  };

  const syncClients = (updated: Client[]) => {
    const old = clients;
    setClients(updated);
    localStorage.setItem('ims_clients', JSON.stringify(updated));

    if (isOfflineSimulated) {
      if (updated.length > old.length) {
        const added = updated.filter(n => !old.some(o => o.id === n.id));
        added.forEach(c => queueOperation('create', 'clients', c.id, c));
      } else {
        updated.forEach(c => {
          const oldC = old.find(o => o.id === c.id);
          if (oldC && JSON.stringify(oldC) !== JSON.stringify(c)) {
            queueOperation('update', 'clients', c.id, c);
          }
        });
      }
    } else {
      if (updated.length > old.length) {
        const added = updated.filter(n => !old.some(o => o.id === n.id));
        added.forEach(c => apiFetch('/api/clients', { method: 'POST', body: JSON.stringify(c) }));
      } else {
        updated.forEach(c => {
          const oldC = old.find(o => o.id === c.id);
          if (oldC && JSON.stringify(oldC) !== JSON.stringify(c)) {
            apiFetch(`/api/clients/${c.id}`, { method: 'PUT', body: JSON.stringify(c) });
          }
        });
      }
    }
  };

  const syncFeed = (updated: FeedEvent[]) => {
    const old = feedEvents;
    setFeedEvents(updated);
    localStorage.setItem('ims_feed', JSON.stringify(updated));

    if (updated.length > old.length) {
      const added = updated.filter(n => !old.some(o => o.id === n.id));
      added.forEach(e => {
        if (isOfflineSimulated) queueOperation('create', 'feed', e.id, e);
        else apiFetch('/api/feed', { method: 'POST', body: JSON.stringify(e) });
      });
    }
  };

  const syncLogs = (updated: AttendanceLog[]) => {
    const old = attendanceLogs;
    setAttendanceLogs(updated);
    localStorage.setItem('ims_logs', JSON.stringify(updated));

    if (updated.length > old.length) {
      const added = updated.filter(n => !old.some(o => o.id === n.id));
      added.forEach(l => {
        if (isOfflineSimulated) queueOperation('create', 'logs', l.id, l);
        else apiFetch('/api/logs', { method: 'POST', body: JSON.stringify(l) });
      });
    }
  };

  const syncInsights = (updated: GrowthInsight[]) => {
    const old = insights;
    setInsights(updated);
    localStorage.setItem('ims_insights', JSON.stringify(updated));

    if (updated.length > old.length) {
      const added = updated.filter(n => !old.some(o => o.id === n.id));
      added.forEach(i => {
        if (isOfflineSimulated) queueOperation('create', 'insights', i.id, i);
        else apiFetch('/api/insights', { method: 'POST', body: JSON.stringify(i) });
      });
    }
  };

  const syncFiles = (updated: IMSFile[]) => {
    const old = files;
    setFiles(updated);
    localStorage.setItem('ims_files', JSON.stringify(updated));

    if (isOfflineSimulated) {
      if (updated.length < old.length) {
        const deleted = old.filter(o => !updated.some(n => n.id === o.id));
        deleted.forEach(f => queueOperation('delete', 'files', f.id, null));
      } else if (updated.length > old.length) {
        const added = updated.filter(n => !old.some(o => o.id === n.id));
        added.forEach(f => queueOperation('create', 'files', f.id, f));
      }
    } else {
      if (updated.length < old.length) {
        const deleted = old.filter(o => !updated.some(n => n.id === o.id));
        deleted.forEach(f => apiFetch(`/api/files/${f.id}`, { method: 'DELETE' }));
      } else if (updated.length > old.length) {
        const added = updated.filter(n => !old.some(o => o.id === n.id));
        added.forEach(f => apiFetch('/api/files', { method: 'POST', body: JSON.stringify(f) }));
      }
    }
  };

  const syncReports = (updated: IMSReport[]) => {
    const old = reports;
    setReports(updated);
    localStorage.setItem('ims_reports', JSON.stringify(updated));

    if (updated.length > old.length) {
      const added = updated.filter(n => !old.some(o => o.id === n.id));
      added.forEach(r => {
        if (isOfflineSimulated) queueOperation('create', 'reports', r.id, r);
        else apiFetch('/api/reports', { method: 'POST', body: JSON.stringify(r) });
      });
    }
  };

  // Switch simulated RBAC Role (local simulation state)
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
  const handleLoginSuccess = (user: User, token: string) => {
    setIsAuthenticated(true);
    setIsSignedOut(false);
    setCurrentUser(user);
    localStorage.setItem('ims_auth', 'true');
    loadAllData();
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setIsSignedOut(true);
    setCurrentUser(null);
    localStorage.removeItem('ims_jwt_token');
    localStorage.removeItem('ims_current_user');
    localStorage.setItem('ims_auth', 'false');
    disconnectSocket();
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

  const handleResetFactoryDefaults = async () => {
    if (!isOfflineSimulated) {
      try {
        const res = await apiFetch('/api/reset', { method: 'POST' });
        if (res.ok) {
          await loadAllData();
        }
      } catch (err) {
        console.error("Failed to reset database on server:", err);
      }
    } else {
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
    }
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
            currentUser={currentUser}
          />
        );
      case 'files':
        return (
          <FilesView 
            files={files}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            searchQuery={searchQuery}
            currentUser={currentUser}
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
            currentUser={currentUser}
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
    return <LoginView onLoginSuccess={(user, token) => handleLoginSuccess(user, token)} />;
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
            currentUser={currentUser}
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
