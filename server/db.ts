import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

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
  IMSReportModel
} from './models';

import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_CLIENTS,
  INITIAL_FEED_EVENTS,
  INITIAL_ATTENDANCE_LOGS,
  INITIAL_GROWTH_INSIGHTS,
  INITIAL_FILES,
  INITIAL_REPORTS
} from '../src/data';

dotenv.config();

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined in environment variables!");
    process.exit(1);
  }

  // Support local development with placeholder replacement warning
  if (uri.includes('<db_password>') || uri.includes('YOUR_PASSWORD_HERE')) {
    console.warn("WARNING: MongoDB Connection URI contains password placeholder '<db_password>'. Please update your .env file!");
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully!");
    await seedDatabase();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

export async function seedDatabase(force = false) {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount > 0 && !force) {
      console.log("Database already has records. Seeding skipped.");
      return;
    }

    console.log("Seeding database (Force: " + force + ")...");

    // Clear everything
    await Promise.all([
      UserModel.deleteMany({}),
      ProjectModel.deleteMany({}),
      TaskModel.deleteMany({}),
      TeamMemberModel.deleteMany({}),
      ClientModel.deleteMany({}),
      FeedEventModel.deleteMany({}),
      AttendanceLogModel.deleteMany({}),
      GrowthInsightModel.deleteMany({}),
      IMSFileModel.deleteMany({}),
      IMSReportModel.deleteMany({})
    ]);

    // Seed Users with default hashed password 'password123'
    const hashedPassword = await bcrypt.hash('password123', 10);
    const usersToInsert = INITIAL_USERS.map(u => ({
      ...u,
      password: hashedPassword
    }));
    await UserModel.insertMany(usersToInsert);

    // Seed others
    await Promise.all([
      ProjectModel.insertMany(INITIAL_PROJECTS),
      TaskModel.insertMany(INITIAL_TASKS),
      TeamMemberModel.insertMany(INITIAL_TEAM_MEMBERS),
      ClientModel.insertMany(INITIAL_CLIENTS),
      FeedEventModel.insertMany(INITIAL_FEED_EVENTS),
      AttendanceLogModel.insertMany(INITIAL_ATTENDANCE_LOGS),
      GrowthInsightModel.insertMany(INITIAL_GROWTH_INSIGHTS),
      IMSFileModel.insertMany(INITIAL_FILES),
      IMSReportModel.insertMany(INITIAL_REPORTS)
    ]);

    console.log("Database successfully seeded with initial datasets.");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}
