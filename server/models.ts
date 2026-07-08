import mongoose, { Schema, Document } from 'mongoose';
import { Project, Task, TeamMember, FeedEvent, AttendanceLog, GrowthInsight, IMSFile, IMSReport, User, Client, Attendance } from '../src/types';

// User Schema (with hashed password)
const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  password: { type: String, required: true }, // Added for real JWT auth
  clanId: { type: String }
}, { timestamps: true });

// Project Schema
const ProjectSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  client: { type: String, required: true },
  status: { type: String, required: true, enum: ['active', 'completed', 'on-hold'] },
  efficiency: { type: Number, required: true },
  startDate: { type: String, required: true },
  description: { type: String },
  clanId: { type: String },
  tasks: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    completed: { type: Boolean, required: true, default: false }
  }]
}, { timestamps: true });

// Task Schema
const TaskSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, required: true, enum: ['urgent', 'high', 'medium', 'low'] },
  dueTime: { type: String, required: true },
  completed: { type: Boolean, required: true, default: false },
  clanId: { type: String }
}, { timestamps: true });

// Team Member Schema
const TeamMemberSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, required: true, enum: ['online', 'away', 'on-leave'] },
  avatarUrl: { type: String },
  initials: { type: String },
  clockInTime: { type: String },
  clockOutTime: { type: String },
  totalHoursToday: { type: String },
  clanId: { type: String }
}, { timestamps: true });

// Client Schema
const ClientSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  industry: { type: String, required: true },
  status: { type: String, required: true, enum: ['active', 'onboarding', 'inactive'] },
  avatarUrl: { type: String },
  projectCount: { type: Number, required: true, default: 0 },
  onboardedAt: { type: String, required: true },
  contactPerson: { type: String, required: true },
  contactEmail: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

// Feed Event Schema
const FeedEventSchema = new Schema({
  id: { type: String, required: true, unique: true },
  memberId: { type: String, required: true },
  memberName: { type: String, required: true },
  action: { type: String, required: true, enum: ['clock_in', 'clock_out', 'status_change'] },
  detail: { type: String, required: true },
  time: { type: String, required: true },
  statusType: { type: String, required: true, enum: ['success', 'warning', 'error', 'info'] }
}, { timestamps: true });

// Attendance Log Schema
const AttendanceLogSchema = new Schema({
  id: { type: String, required: true, unique: true },
  memberId: { type: String, required: true },
  memberName: { type: String, required: true },
  avatarUrl: { type: String },
  initials: { type: String },
  date: { type: String, required: true },
  checkInTime: { type: String, required: true },
  status: { type: String, required: true, enum: ['On Time', 'Late', 'On Leave'] },
  totalHours: { type: String, required: true }
}, { timestamps: true });

// Growth Insight Schema
const GrowthInsightSchema = new Schema({
  id: { type: String, required: true, unique: true },
  credits: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  time: { type: String, required: true },
  category: { type: String, required: true, enum: ['task', 'milestone', 'quick-win', 'asset', 'attendance'] }
}, { timestamps: true });

// IMS File Schema
const IMSFileSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  size: { type: String, required: true },
  type: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: String, required: true },
  category: { type: String, required: true, enum: ['image', 'report', 'config', 'archive'] },
  url: { type: String }
}, { timestamps: true });

// IMS Report Schema
const IMSReportSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, required: true, enum: ['Inventory', 'Performance', 'Financial', 'Logistics'] },
  status: { type: String, required: true, enum: ['Draft', 'Approved', 'Review'] }
}, { timestamps: true });

// Attendance Schema for Live availability
const AttendanceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, required: true, enum: ['Available', 'Deep Work', 'Away', 'Offline'] },
  activeProjectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  logDate: { type: Date, default: Date.now },
  sessionLogs: [{
    startTime: { type: Date, required: true },
    endTime: { type: Date }
  }]
}, { timestamps: true });

export const UserModel = mongoose.model<Document & User & { password?: string }>('User', UserSchema);
export const ProjectModel = mongoose.model<Document & Project>('Project', ProjectSchema);
export const TaskModel = mongoose.model<Document & Task>('Task', TaskSchema);
export const TeamMemberModel = mongoose.model<Document & TeamMember>('TeamMember', TeamMemberSchema);
export const ClientModel = mongoose.model<Document & Client>('Client', ClientSchema);
export const FeedEventModel = mongoose.model<Document & FeedEvent>('FeedEvent', FeedEventSchema);
export const AttendanceLogModel = mongoose.model<Document & AttendanceLog>('AttendanceLog', AttendanceLogSchema);
export const GrowthInsightModel = mongoose.model<Document & GrowthInsight>('GrowthInsight', GrowthInsightSchema);
export const IMSFileModel = mongoose.model<Document & IMSFile>('IMSFile', IMSFileSchema);
export const IMSReportModel = mongoose.model<Document & IMSReport>('IMSReport', IMSReportSchema);
export const AttendanceModel = mongoose.model<Document & Attendance>('Attendance', AttendanceSchema);
