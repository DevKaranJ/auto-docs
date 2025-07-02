import { users, demoRequests, type User, type InsertUser, type DemoRequest, type InsertDemoRequest, type DemoStats } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createDemoRequest(request: InsertDemoRequest): Promise<DemoRequest>;
  getDemoStats(): Promise<DemoStats>;
  sessionStore: any; // Using any to avoid complex session store type issues
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createDemoRequest(insertRequest: InsertDemoRequest): Promise<DemoRequest> {
    const [request] = await db
      .insert(demoRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async getDemoStats(): Promise<DemoStats> {
    const requests = await db.select().from(demoRequests);
    const totalRequests = requests.length;
    const successfulRequests = requests.filter(r => r.success === true).length;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    
    const processingTimes = requests
      .filter(r => r.processingTime !== null)
      .map(r => r.processingTime!);
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length 
      : 0;

    const languageBreakdown: Record<string, number> = {};
    const formatBreakdown: Record<string, number> = {};

    requests.forEach(r => {
      languageBreakdown[r.language] = (languageBreakdown[r.language] || 0) + 1;
      formatBreakdown[r.format] = (formatBreakdown[r.format] || 0) + 1;
    });

    const recentRequests = await db
      .select()
      .from(demoRequests)
      .orderBy(desc(demoRequests.timestamp))
      .limit(10);

    return {
      totalRequests,
      successRate,
      avgProcessingTime,
      languageBreakdown,
      formatBreakdown,
      recentRequests
    };
  }
}

export const storage = new DatabaseStorage();


