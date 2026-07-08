import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB, seedDatabase } from './db';
import {
  UserModel,
  ProjectModel,
  TaskModel,
  TeamMemberModel,
  ClientModel,
  FeedEventModel,
  AttendanceLogModel,
  GrowthInsightModel,
  IMSFileModel,
  IMSReportModel,
  AttendanceModel
} from './models';
import { User, Project, Task, TeamMember, Client, FeedEvent, AttendanceLog, GrowthInsight, IMSFile, IMSReport } from '../src/types';

dotenv.config();

const __dirname = import.meta.dirname;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      callback(null, origin || '*');
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123_change_me';

app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin || '*');
  },
  credentials: true
}));
app.use(express.json());

// Express Middleware for Authenticating JWT
interface AuthenticatedRequest extends express.Request {
  user?: any;
}

const authenticateJWT = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      req.user = decoded;
      next();
    });
  } else {
    res.status(401).json({ error: 'Authorization header missing or malformed' });
  }
};

// --- AUTHENTICATION ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, clanId } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = `user_${Date.now()}`;
    const newUser = new UserModel({
      id,
      email,
      name,
      role,
      password: hashedPassword,
      clanId
    });

    await newUser.save();

    const token = jwt.sign({ id, email, name, role, clanId }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id, email, name, role, clanId }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, clanId: user.clanId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clanId: user.clanId
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile
app.get('/api/auth/me', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await UserModel.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clanId: user.clanId
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- CORE SYSTEM DATA INITIALIZATION ---

// Load all collections for client startup bootstrap
app.get('/api/init', authenticateJWT, async (req, res) => {
  try {
    const [
      projects,
      tasks,
      teamMembers,
      clients,
      feedEvents,
      attendanceLogs,
      insights,
      files,
      reports
    ] = await Promise.all([
      ProjectModel.find().sort({ createdAt: -1 }),
      TaskModel.find().sort({ createdAt: -1 }),
      TeamMemberModel.find().sort({ createdAt: -1 }),
      ClientModel.find().sort({ createdAt: -1 }),
      FeedEventModel.find().sort({ createdAt: -1 }),
      AttendanceLogModel.find().sort({ createdAt: -1 }),
      GrowthInsightModel.find().sort({ createdAt: -1 }),
      IMSFileModel.find().sort({ createdAt: -1 }),
      IMSReportModel.find().sort({ createdAt: -1 })
    ]);

    res.json({
      projects,
      tasks,
      teamMembers,
      clients,
      feedEvents,
      attendanceLogs,
      insights,
      files,
      reports
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reset database to factory default mockups
app.post('/api/reset', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied: Admin role required' });
    }
    await seedDatabase(true);
    
    // Broadcast reset event so all connected clients reload
    io.emit('system:reset');
    
    res.json({ success: true, message: 'Database reset to factory defaults successfully!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper role hierarchical ranks for conflict resolution
const ROLE_HIERARCHY: Record<string, number> = {
  'Admin': 3,
  'Clan Leader': 2,
  'Team Member': 1
};

// --- THREE-TIER OFFLINE RESOLUTION SYNCHRONIZATION ---
interface SyncOperation {
  type: 'create' | 'update' | 'delete';
  collection: 'projects' | 'tasks' | 'team' | 'clients' | 'feed' | 'logs' | 'insights' | 'files' | 'reports';
  id: string;
  data: any;
  timestamp: number;
  userRole: string;
  userName: string;
}

app.post('/api/sync', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { operations } = req.body as { operations: SyncOperation[] };
    if (!operations || !Array.isArray(operations)) {
      return res.status(400).json({ error: 'Operations array is required' });
    }

    console.log(`Processing ${operations.length} offline synchronization operations...`);

    const syncLogs: string[] = [];

    // Sort operations chronologically to apply them in correct order
    const sortedOps = [...operations].sort((a, b) => a.timestamp - b.timestamp);

    for (const op of sortedOps) {
      const { collection, type, id, data, timestamp, userRole, userName } = op;
      
      // Determine target model
      let Model: any;
      switch (collection) {
        case 'projects': Model = ProjectModel; break;
        case 'tasks': Model = TaskModel; break;
        case 'team': Model = TeamMemberModel; break;
        case 'clients': Model = ClientModel; break;
        case 'feed': Model = FeedEventModel; break;
        case 'logs': Model = AttendanceLogModel; break;
        case 'insights': Model = GrowthInsightModel; break;
        case 'files': Model = IMSFileModel; break;
        case 'reports': Model = IMSReportModel; break;
        default: continue;
      }

      const existingDoc = await Model.findOne({ id });

      // Action: DELETE
      if (type === 'delete') {
        if (!existingDoc) continue;
        
        // Tier 3 Conflict Check: Roles and timestamps
        const dbUpdatedAt = new Date(existingDoc.updatedAt || existingDoc.createdAt).getTime();
        const roleRank = ROLE_HIERARCHY[userRole] || 1;
        
        // Admin or Clan Leader can always delete, or if equal ranks, compare timestamps
        if (roleRank >= 2 || timestamp >= dbUpdatedAt) {
          await Model.deleteOne({ id });
          io.emit(`${collection}:delete`, id);
          syncLogs.push(`Deleted ${collection} document with ID ${id}`);
        } else {
          syncLogs.push(`Skipped deletion of ${collection} ID ${id} due to lower credentials or older timestamp.`);
        }
        continue;
      }

      // Action: CREATE / UPDATE
      if (!existingDoc) {
        // Document doesn't exist, create it outright
        const newDoc = new Model(data);
        await newDoc.save();
        io.emit(`${collection}:update`, newDoc);
        syncLogs.push(`Created ${collection} document with ID ${id}`);
      } else {
        // Document exists - Perform three-tier resolution strategy based on field types
        const dbUpdatedAt = new Date(existingDoc.updatedAt || existingDoc.createdAt).getTime();
        const incomingRoleRank = ROLE_HIERARCHY[userRole] || 1;
        
        // Retrieve current DB object fields
        const dbObj = existingDoc.toObject();
        const mergedObj = { ...dbObj };
        let hasChanges = false;
        let conflictDetected = false;

        // Iterate through fields to apply Tier 1, 2, and 3 resolutions
        for (const key of Object.keys(data)) {
          if (key === '_id' || key === 'id' || key === 'createdAt' || key === 'updatedAt' || key === '__v') continue;

          const clientVal = data[key];
          const dbVal = dbObj[key];

          // Check if values differ
          if (JSON.stringify(clientVal) !== JSON.stringify(dbVal)) {
            // Determine tier based on field types/collection types
            
            // TIER 1: Append-Only / Array Unions (Non-destructive merge)
            if (Array.isArray(clientVal) && Array.isArray(dbVal)) {
              // Merge subtask arrays by unique ID
              const mergedArray = [...dbVal];
              for (const clientItem of clientVal) {
                const existingItemIdx = mergedArray.findIndex(item => item.id === clientItem.id);
                if (existingItemIdx === -1) {
                  mergedArray.push(clientItem);
                  hasChanges = true;
                } else {
                  // Resolve completion conflict: if completed state changed, prioritize completions
                  const dbItem = mergedArray[existingItemIdx];
                  if (clientItem.completed !== dbItem.completed) {
                    // Non-destructive: if completed, keep completed. Or use latest timestamp/role
                    mergedArray[existingItemIdx] = {
                      ...dbItem,
                      completed: clientItem.completed || dbItem.completed // Non-destructive complete
                    };
                    hasChanges = true;
                  }
                }
              }
              mergedObj[key] = mergedArray;
            }
            
            // TIER 2: Numeric Accumulation / High-Water Mark Fields
            else if (typeof clientVal === 'number' && typeof dbVal === 'number') {
              if (key === 'efficiency') {
                // If it is efficiency, take the latest / highest
                mergedObj[key] = Math.max(dbVal, clientVal);
              } else {
                mergedObj[key] = clientVal; // fallback
              }
              hasChanges = true;
            }
            
            // TIER 3: Role-Based Priority & Timestamp Merge for text/status
            else {
              // Compare timestamps and role ranking
              const isIncomingHigherRank = incomingRoleRank > 2; // Admin or Leader
              const isTimestampNewer = timestamp >= dbUpdatedAt;
              
              if (isIncomingHigherRank || isTimestampNewer) {
                mergedObj[key] = clientVal;
                hasChanges = true;
              } else {
                conflictDetected = true;
              }
            }
          }
        }

        if (hasChanges) {
          // Save updates
          Object.assign(existingDoc, mergedObj);
          await existingDoc.save();
          io.emit(`${collection}:update`, existingDoc);
          
          if (conflictDetected) {
            // Log that a partial conflict resolution took place
            const conflictEvent = new FeedEventModel({
              id: `feed_conflict_${Date.now()}`,
              memberId: 'system',
              memberName: 'Conflict Resolver',
              action: 'status_change',
              detail: `Resolved concurrent edits on ${collection} ID ${id} using Three-Tier Strategy. Preserved higher-priority fields.`,
              time: 'Just Now',
              statusType: 'warning'
            });
            await conflictEvent.save();
            io.emit('feed:update', conflictEvent);
          }
          syncLogs.push(`Updated ${collection} document with ID ${id}`);
        }
      }
    }

    res.json({ success: true, logs: syncLogs });
  } catch (error: any) {
    console.error('Error during client sync:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- REST API ENDPOINTS ---

// CRUD: Tasks
app.get('/api/tasks', authenticateJWT, async (req, res) => {
  const tasks = await TaskModel.find().sort({ createdAt: -1 });
  res.json(tasks);
});

app.post('/api/tasks', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user.role === 'Team Member') {
    return res.status(403).json({ error: 'Access denied: Team Members cannot create pipeline tasks' });
  }
  if (req.user.role === 'Clan Leader' && req.body.clanId !== req.user.clanId) {
    return res.status(403).json({ error: 'Access denied: Clan Leaders can only assign tasks to their own clan' });
  }
  const task = new TaskModel(req.body);
  await task.save();
  io.emit('tasks:update', task);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user.role === 'Team Member') {
    const existingTask = await TaskModel.findOne({ id: req.params.id });
    if (existingTask && existingTask.clanId !== req.user.clanId) {
      return res.status(403).json({ error: 'Access denied: Cannot edit tasks from another clan' });
    }
  }
  if (req.user.role === 'Clan Leader') {
    const existingTask = await TaskModel.findOne({ id: req.params.id });
    if (existingTask && existingTask.clanId !== req.user.clanId) {
      return res.status(403).json({ error: 'Access denied: Cannot edit tasks from another clan' });
    }
  }
  const task = await TaskModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  if (task) {
    io.emit('tasks:update', task);
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user.role === 'Team Member') {
    return res.status(403).json({ error: 'Access denied: Team Members cannot delete tasks' });
  }
  if (req.user.role === 'Clan Leader') {
    const existingTask = await TaskModel.findOne({ id: req.params.id });
    if (existingTask && existingTask.clanId !== req.user.clanId) {
      return res.status(403).json({ error: 'Access denied: Cannot delete tasks from another clan' });
    }
  }
  const result = await TaskModel.deleteOne({ id: req.params.id });
  if (result.deletedCount) {
    io.emit('tasks:delete', req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// CRUD: Projects
app.get('/api/projects', authenticateJWT, async (req, res) => {
  const projects = await ProjectModel.find().sort({ createdAt: -1 });
  res.json(projects);
});

app.post('/api/projects', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user.role === 'Team Member') {
    return res.status(403).json({ error: 'Access denied: Team Members cannot create projects' });
  }
  if (req.user.role === 'Clan Leader' && req.body.clanId !== req.user.clanId) {
    return res.status(403).json({ error: 'Access denied: Clan Leaders can only create projects for their own clan' });
  }
  const project = new ProjectModel(req.body);
  await project.save();
  io.emit('projects:update', project);
  res.status(201).json(project);
});

app.put('/api/projects/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const existingProject = await ProjectModel.findOne({ id: req.params.id });
  if (!existingProject) {
    return res.status(404).json({ error: 'Project not found' });
  }
  if (req.user.role === 'Team Member') {
    if (existingProject.clanId !== req.user.clanId) {
      return res.status(403).json({ error: 'Access denied: Cannot edit projects from another clan' });
    }
    // Block editing project metadata
    const isMetadataChanged = 
      req.body.name !== existingProject.name ||
      req.body.client !== existingProject.client ||
      req.body.status !== existingProject.status ||
      req.body.efficiency !== existingProject.efficiency ||
      req.body.clanId !== existingProject.clanId;
    if (isMetadataChanged) {
      return res.status(403).json({ error: 'Access denied: Team Members cannot edit project metadata' });
    }
  } else if (req.user.role === 'Clan Leader') {
    if (existingProject.clanId !== req.user.clanId || req.body.clanId !== req.user.clanId) {
      return res.status(403).json({ error: 'Access denied: Clan Leaders can only edit projects of their own clan' });
    }
  }

  const project = await ProjectModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  if (project) {
    io.emit('projects:update', project);
    res.json(project);
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

app.delete('/api/projects/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user.role === 'Team Member') {
    return res.status(403).json({ error: 'Access denied: Team Members cannot delete projects' });
  }
  if (req.user.role === 'Clan Leader') {
    const existingProject = await ProjectModel.findOne({ id: req.params.id });
    if (existingProject && existingProject.clanId !== req.user.clanId) {
      return res.status(403).json({ error: 'Access denied: Cannot delete projects from another clan' });
    }
  }
  const result = await ProjectModel.deleteOne({ id: req.params.id });
  if (result.deletedCount) {
    io.emit('projects:delete', req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

// CRUD: Team Members
app.get('/api/team', authenticateJWT, async (req, res) => {
  const team = await TeamMemberModel.find().sort({ createdAt: -1 });
  res.json(team);
});

app.post('/api/team', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user.role === 'Team Member') {
    return res.status(403).json({ error: 'Access denied: Team Members cannot register personnel' });
  }
  if (req.user.role === 'Clan Leader' && req.body.clanId !== req.user.clanId) {
    return res.status(403).json({ error: 'Access denied: Clan Leaders can only assign to their own clan' });
  }
  const member = new TeamMemberModel(req.body);
  await member.save();
  io.emit('team:update', member);
  res.status(201).json(member);
});

app.put('/api/team/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const existingMember = await TeamMemberModel.findOne({ id: req.params.id });
  if (!existingMember) {
    return res.status(404).json({ error: 'Team member not found' });
  }
  if (req.user.role === 'Team Member') {
    const isSelf = existingMember.name.toLowerCase() === req.user.name.split(' (')[0].toLowerCase();
    if (!isSelf) {
      return res.status(403).json({ error: 'Access denied: Team Members can only modify their own profile' });
    }
    // Block metadata changes
    const isMetaChanged = 
      req.body.name !== existingMember.name ||
      req.body.role !== existingMember.role ||
      req.body.clanId !== existingMember.clanId;
    if (isMetaChanged) {
      return res.status(403).json({ error: 'Access denied: Cannot edit personnel metadata' });
    }
  } else if (req.user.role === 'Clan Leader') {
    if (existingMember.clanId !== req.user.clanId || req.body.clanId !== req.user.clanId) {
      return res.status(403).json({ error: 'Access denied: Clan Leaders can only manage personnel in their own clan' });
    }
  }

  const member = await TeamMemberModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  if (member) {
    io.emit('team:update', member);
    res.json(member);
  } else {
    res.status(404).json({ error: 'Team member not found' });
  }
});

// CRUD: Clients
app.get('/api/clients', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied: Clients Ledger restricted' });
  }
  const clients = await ClientModel.find().sort({ createdAt: -1 });
  res.json(clients);
});

app.post('/api/clients', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied: Clients Ledger restricted' });
  }
  const client = new ClientModel(req.body);
  await client.save();
  io.emit('clients:update', client);
  res.status(201).json(client);
});

app.put('/api/clients/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied: Clients Ledger restricted' });
  }
  const client = await ClientModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  if (client) {
    io.emit('clients:update', client);
    res.json(client);
  } else {
    res.status(404).json({ error: 'Client not found' });
  }
});

// Feed Events
app.post('/api/feed', authenticateJWT, async (req, res) => {
  const event = new FeedEventModel(req.body);
  await event.save();
  io.emit('feed:update', event);
  res.status(201).json(event);
});

// Attendance Logs
app.post('/api/logs', authenticateJWT, async (req, res) => {
  const log = new AttendanceLogModel(req.body);
  await log.save();
  io.emit('logs:update', log);
  res.status(201).json(log);
});

// Growth Insights
app.post('/api/insights', authenticateJWT, async (req, res) => {
  const insight = new GrowthInsightModel(req.body);
  await insight.save();
  io.emit('insights:update', insight);
  res.status(201).json(insight);
});

// Files
app.get('/api/files', authenticateJWT, async (req, res) => {
  const files = await IMSFileModel.find().sort({ createdAt: -1 });
  res.json(files);
});

app.post('/api/files', authenticateJWT, async (req, res) => {
  const file = new IMSFileModel(req.body);
  await file.save();
  io.emit('files:update', file);
  res.status(201).json(file);
});

app.delete('/api/files/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user.role === 'Team Member') {
    return res.status(403).json({ error: 'Access denied: Team Members cannot delete assets' });
  }
  const result = await IMSFileModel.deleteOne({ id: req.params.id });
  if (result.deletedCount) {
    io.emit('files:delete', req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Reports
app.get('/api/reports', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user.role === 'Team Member') {
    return res.status(403).json({ error: 'Access denied: Reports restricted' });
  }
  const reports = await IMSReportModel.find().sort({ createdAt: -1 });
  res.json(reports);
});

app.post('/api/reports', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user.role === 'Team Member') {
    return res.status(403).json({ error: 'Access denied: Team Members cannot compile reports' });
  }
  const report = new IMSReportModel(req.body);
  await report.save();
  io.emit('reports:update', report);
  res.status(201).json(report);
});

// Attendance tracker endpoints
app.post('/api/attendance/pulse', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { status, activeProjectId } = req.body;
    if (!status || !['Available', 'Deep Work', 'Away', 'Offline'].includes(status)) {
      return res.status(400).json({ error: 'Valid status required' });
    }

    const userDoc = await UserModel.findOne({ id: req.user.id });
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }

    let projectObjectId = null;
    if (activeProjectId) {
      const projectDoc = await ProjectModel.findOne({ id: activeProjectId });
      if (projectDoc) {
        projectObjectId = projectDoc._id;
      }
    }

    // Find user's latest attendance document
    let attendance = await AttendanceModel.findOne({ userId: userDoc._id }).sort({ createdAt: -1 });

    const now = new Date();

    if (attendance) {
      const statusChanged = attendance.status !== status;
      const projectChanged = String(attendance.activeProjectId || '') !== String(projectObjectId || '');

      if (statusChanged) {
        // Close the previous active session log if exists
        const activeLog = attendance.sessionLogs.find((log: any) => !log.endTime);
        if (activeLog) {
          activeLog.endTime = now;
        }

        // If new status is not Offline, start a new session log
        if (status !== 'Offline') {
          attendance.sessionLogs.push({ startTime: now });
        }

        attendance.status = status;
        attendance.activeProjectId = projectObjectId;
      } else if (projectChanged) {
        // Just update the active project
        attendance.activeProjectId = projectObjectId;
      }
      await attendance.save();
    } else {
      // Create new record
      const sessionLogs = [];
      if (status !== 'Offline') {
        sessionLogs.push({ startTime: now });
      }
      attendance = new AttendanceModel({
        userId: userDoc._id,
        status,
        activeProjectId: projectObjectId,
        sessionLogs
      });
      await attendance.save();
    }

    // Populate project if linked
    if (attendance.activeProjectId) {
      await attendance.populate('activeProjectId');
    }

    // Broadcast changes via Socket.io
    io.emit('attendance:pulse', {
      userId: req.user.id,
      name: userDoc.name.split(' (')[0],
      status,
      activeProject: attendance.activeProjectId ? {
        id: (attendance.activeProjectId as any).id,
        name: (attendance.activeProjectId as any).name
      } : null,
      lastUpdated: attendance.updatedAt
    });

    res.json({
      success: true,
      attendance: {
        status: attendance.status,
        activeProjectId,
        sessionLogs: attendance.sessionLogs
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/attendance/team', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await UserModel.find();
    const teamAvailability = [];

    for (const user of users) {
      const attendance = await AttendanceModel.findOne({ userId: user._id })
        .populate('activeProjectId')
        .sort({ createdAt: -1 });

      // Lookup matching TeamMember in TeamMemberModel by prefix name matching
      const cleanName = user.name.split(' (')[0];
      const memberDoc = await TeamMemberModel.findOne({ 
        name: { $regex: new RegExp('^' + cleanName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') } 
      });

      teamAvailability.push({
        userId: user.id,
        name: cleanName,
        role: user.role,
        clanId: user.clanId,
        status: attendance ? attendance.status : 'Offline',
        avatarUrl: memberDoc ? memberDoc.avatarUrl : '',
        initials: memberDoc ? memberDoc.initials : cleanName.split(' ')[0][0] + (cleanName.split(' ')[1]?.[0] || ''),
        activeProject: attendance?.activeProjectId ? {
          id: (attendance.activeProjectId as any).id,
          name: (attendance.activeProjectId as any).name
        } : null,
        lastUpdated: attendance ? attendance.updatedAt : null
      });
    }

    res.json(teamAvailability);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- PRODUCTION SERVING ---
// Serve static client build if it exists in dist folder
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log("Serving compiled production client from: " + distPath);
}

// Start Server
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Backend server executing dynamically on http://localhost:${PORT}`);
  });
});
