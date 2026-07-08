export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'active' | 'completed' | 'on-hold';
  efficiency: number;
  startDate: string;
  description?: string;
  tasks?: ProjectTask[];
  clanId?: string; // Optional assigned Clan
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueTime: string;
  completed: boolean;
  clanId?: string; // Optional assigned Clan to isolate task workloads
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'away' | 'on-leave';
  avatarUrl: string;
  initials?: string;
  clockInTime?: string;
  clockOutTime?: string;
  totalHoursToday?: string;
  clanId?: string; // Joining a specific clan
}

export interface FeedEvent {
  id: string;
  memberId: string;
  memberName: string;
  action: 'clock_in' | 'clock_out' | 'status_change';
  detail: string;
  time: string;
  statusType: 'success' | 'warning' | 'error' | 'info';
}

export interface AttendanceLog {
  id: string;
  memberId: string;
  memberName: string;
  avatarUrl?: string;
  initials?: string;
  date: string;
  checkInTime: string;
  status: 'On Time' | 'Late' | 'On Leave';
  totalHours: string;
}

export interface GrowthInsight {
  id: string;
  credits: string;
  type: string;
  title: string;
  description: string;
  time: string;
  category: 'task' | 'milestone' | 'quick-win' | 'asset' | 'attendance';
}

export interface IMSFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  category: 'image' | 'report' | 'config' | 'archive';
  url?: string;
}

export interface IMSReport {
  id: string;
  title: string;
  author: string;
  date: string;
  type: 'Inventory' | 'Performance' | 'Financial' | 'Logistics';
  status: 'Draft' | 'Approved' | 'Review';
}

export type UserRole = 'Admin' | 'Clan Leader' | 'Team Member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clanId?: string; // which clan they lead or belong to
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  status: 'active' | 'onboarding' | 'inactive';
  avatarUrl?: string;
  projectCount: number;
  onboardedAt: string;
  contactPerson: string;
  contactEmail: string;
  notes?: string;
}

export interface SessionLog {
  startTime: Date;
  endTime?: Date;
}

export interface Attendance {
  userId: any;
  status: 'Available' | 'Deep Work' | 'Away' | 'Offline';
  activeProjectId?: any;
  logDate?: Date;
  sessionLogs: SessionLog[];
  createdAt?: Date;
  updatedAt?: Date;
}

