import { 
  users, trafficLogs, attackPatterns, aiAnalysisResults, systemMetrics, datasetStats,
  type User, type InsertUser, type TrafficLog, type InsertTrafficLog, 
  type AttackPattern, type InsertAttackPattern, type AIAnalysisResult, type InsertAIAnalysisResult,
  type SystemMetrics, type InsertSystemMetrics, type DatasetStats, type InsertDatasetStats
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Traffic Log methods
  getTrafficLogs(filters?: { severity?: string; attackType?: string; ipAddress?: string; limit?: number; offset?: number }): Promise<TrafficLog[]>;
  getTrafficLogById(id: number): Promise<TrafficLog | undefined>;
  createTrafficLog(log: InsertTrafficLog): Promise<TrafficLog>;
  getTrafficLogCount(filters?: { severity?: string; attackType?: string; ipAddress?: string }): Promise<number>;
  
  // Attack Pattern methods
  getAttackPatterns(): Promise<AttackPattern[]>;
  getNewAttackPatterns(): Promise<AttackPattern[]>;
  createAttackPattern(pattern: InsertAttackPattern): Promise<AttackPattern>;
  updateAttackPatternStatus(id: number, status: string): Promise<AttackPattern | undefined>;
  
  // AI Analysis methods
  getAIAnalysisResults(limit?: number): Promise<AIAnalysisResult[]>;
  createAIAnalysisResult(result: InsertAIAnalysisResult): Promise<AIAnalysisResult>;
  
  // System Metrics methods
  getSystemMetrics(): Promise<SystemMetrics | undefined>;
  updateSystemMetrics(metrics: InsertSystemMetrics): Promise<SystemMetrics>;
  
  // Dataset Stats methods
  getDatasetStats(): Promise<DatasetStats | undefined>;
  updateDatasetStats(stats: InsertDatasetStats): Promise<DatasetStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trafficLogs: Map<number, TrafficLog>;
  private attackPatterns: Map<number, AttackPattern>;
  private aiAnalysisResults: Map<number, AIAnalysisResult>;
  private systemMetrics: SystemMetrics | undefined;
  private datasetStats: DatasetStats | undefined;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.trafficLogs = new Map();
    this.attackPatterns = new Map();
    this.aiAnalysisResults = new Map();
    this.currentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Traffic Log methods
  async getTrafficLogs(filters?: { severity?: string; attackType?: string; ipAddress?: string; limit?: number; offset?: number }): Promise<TrafficLog[]> {
    let logs = Array.from(this.trafficLogs.values());
    
    if (filters) {
      if (filters.severity && filters.severity !== 'all') {
        logs = logs.filter(log => log.severity === filters.severity);
      }
      if (filters.attackType && filters.attackType !== 'all') {
        const typeMap = {
          'sql': 'SQL Injection',
          'xss': 'XSS',
          'brute': 'Brute Force',
          'ddos': 'DDoS'
        };
        const mappedType = typeMap[filters.attackType as keyof typeof typeMap];
        if (mappedType) {
          logs = logs.filter(log => log.attackType.includes(mappedType));
        }
      }
      if (filters.ipAddress) {
        logs = logs.filter(log => log.sourceIP.includes(filters.ipAddress!));
      }
    }
    
    // Sort by timestamp desc
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (filters?.offset) {
      logs = logs.slice(filters.offset);
    }
    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }
    
    return logs;
  }

  async getTrafficLogById(id: number): Promise<TrafficLog | undefined> {
    return this.trafficLogs.get(id);
  }

  async createTrafficLog(insertLog: InsertTrafficLog): Promise<TrafficLog> {
    const id = this.currentId++;
    const log: TrafficLog = { 
      ...insertLog, 
      id,
      payload: insertLog.payload ?? null,
      userAgent: insertLog.userAgent ?? null
    };
    this.trafficLogs.set(id, log);
    return log;
  }

  async getTrafficLogCount(filters?: { severity?: string; attackType?: string; ipAddress?: string }): Promise<number> {
    const logs = await this.getTrafficLogs(filters);
    return logs.length;
  }

  // Attack Pattern methods
  async getAttackPatterns(): Promise<AttackPattern[]> {
    return Array.from(this.attackPatterns.values());
  }

  async getNewAttackPatterns(): Promise<AttackPattern[]> {
    return Array.from(this.attackPatterns.values()).filter(pattern => 
      pattern.status === 'new' || pattern.status === 'under_review'
    );
  }

  async createAttackPattern(insertPattern: InsertAttackPattern): Promise<AttackPattern> {
    const id = this.currentId++;
    const pattern: AttackPattern = { 
      ...insertPattern, 
      id,
      aiGenerated: insertPattern.aiGenerated ?? true
    };
    this.attackPatterns.set(id, pattern);
    return pattern;
  }

  async updateAttackPatternStatus(id: number, status: string): Promise<AttackPattern | undefined> {
    const pattern = this.attackPatterns.get(id);
    if (pattern) {
      const updatedPattern = { ...pattern, status };
      this.attackPatterns.set(id, updatedPattern);
      return updatedPattern;
    }
    return undefined;
  }

  // AI Analysis methods
  async getAIAnalysisResults(limit = 10): Promise<AIAnalysisResult[]> {
    const results = Array.from(this.aiAnalysisResults.values());
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return results.slice(0, limit);
  }

  async createAIAnalysisResult(insertResult: InsertAIAnalysisResult): Promise<AIAnalysisResult> {
    const id = this.currentId++;
    const result: AIAnalysisResult = { 
      ...insertResult, 
      id,
      trafficLogId: insertResult.trafficLogId ?? null
    };
    this.aiAnalysisResults.set(id, result);
    return result;
  }

  // System Metrics methods
  async getSystemMetrics(): Promise<SystemMetrics | undefined> {
    return this.systemMetrics;
  }

  async updateSystemMetrics(insertMetrics: InsertSystemMetrics): Promise<SystemMetrics> {
    const id = this.systemMetrics?.id || this.currentId++;
    const metrics: SystemMetrics = { ...insertMetrics, id };
    this.systemMetrics = metrics;
    return metrics;
  }

  // Dataset Stats methods
  async getDatasetStats(): Promise<DatasetStats | undefined> {
    return this.datasetStats;
  }

  async updateDatasetStats(insertStats: InsertDatasetStats): Promise<DatasetStats> {
    const id = this.datasetStats?.id || this.currentId++;
    const stats: DatasetStats = { ...insertStats, id };
    this.datasetStats = stats;
    return stats;
  }
}

export class DatabaseStorage implements IStorage {
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

  async getTrafficLogs(filters?: { severity?: string; attackType?: string; ipAddress?: string; limit?: number; offset?: number }): Promise<TrafficLog[]> {
    const conditions = [];
    
    if (filters?.severity && filters.severity !== 'all') {
      conditions.push(eq(trafficLogs.severity, filters.severity));
    }
    
    if (filters?.attackType && filters.attackType !== 'all') {
      const typeMap = {
        'sql': 'SQL Injection',
        'xss': 'XSS',
        'brute': 'Brute Force',
        'ddos': 'DDoS'
      };
      const mappedType = typeMap[filters.attackType as keyof typeof typeMap];
      if (mappedType) {
        conditions.push(like(trafficLogs.attackType, `%${mappedType}%`));
      }
    }
    
    if (filters?.ipAddress) {
      conditions.push(like(trafficLogs.sourceIP, `%${filters.ipAddress}%`));
    }
    
    // Build the complete query in a single chain to avoid type issues
    const baseQuery = db.select().from(trafficLogs);
    const whereQuery = conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery;
    
    const orderedQuery = whereQuery.orderBy(desc(trafficLogs.timestamp));
    
    const limitedQuery = filters?.limit 
      ? orderedQuery.limit(filters.limit)
      : orderedQuery;
      
    const finalQuery = filters?.offset 
      ? limitedQuery.offset(filters.offset)
      : limitedQuery;
    
    return await finalQuery;
  }

  async getTrafficLogById(id: number): Promise<TrafficLog | undefined> {
    const [log] = await db.select().from(trafficLogs).where(eq(trafficLogs.id, id));
    return log || undefined;
  }

  async createTrafficLog(insertLog: InsertTrafficLog): Promise<TrafficLog> {
    const [log] = await db
      .insert(trafficLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getTrafficLogCount(filters?: { severity?: string; attackType?: string; ipAddress?: string }): Promise<number> {
    const conditions = [];
    
    if (filters?.severity && filters.severity !== 'all') {
      conditions.push(eq(trafficLogs.severity, filters.severity));
    }
    
    if (filters?.attackType && filters.attackType !== 'all') {
      const typeMap = {
        'sql': 'SQL Injection',
        'xss': 'XSS',
        'brute': 'Brute Force',
        'ddos': 'DDoS'
      };
      const mappedType = typeMap[filters.attackType as keyof typeof typeMap];
      if (mappedType) {
        conditions.push(like(trafficLogs.attackType, `%${mappedType}%`));
      }
    }
    
    if (filters?.ipAddress) {
      conditions.push(like(trafficLogs.sourceIP, `%${filters.ipAddress}%`));
    }
    
    // Build the complete query in a single chain to avoid type issues
    const baseQuery = db.select({ count: count() }).from(trafficLogs);
    const finalQuery = conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery;
    
    const [result] = await finalQuery;
    return result.count;
  }

  async getAttackPatterns(): Promise<AttackPattern[]> {
    return await db.select().from(attackPatterns).orderBy(desc(attackPatterns.lastSeen));
  }

  async getNewAttackPatterns(): Promise<AttackPattern[]> {
    return await db.select().from(attackPatterns)
      .where(
        or(
          eq(attackPatterns.status, 'new'),
          eq(attackPatterns.status, 'under_review')
        )
      )
      .orderBy(desc(attackPatterns.lastSeen));
  }

  async createAttackPattern(insertPattern: InsertAttackPattern): Promise<AttackPattern> {
    const [pattern] = await db
      .insert(attackPatterns)
      .values(insertPattern)
      .returning();
    return pattern;
  }

  async updateAttackPatternStatus(id: number, status: string): Promise<AttackPattern | undefined> {
    const [pattern] = await db
      .update(attackPatterns)
      .set({ status })
      .where(eq(attackPatterns.id, id))
      .returning();
    return pattern || undefined;
  }

  async getAIAnalysisResults(limit = 10): Promise<AIAnalysisResult[]> {
    return await db.select().from(aiAnalysisResults)
      .orderBy(desc(aiAnalysisResults.timestamp))
      .limit(limit);
  }

  async createAIAnalysisResult(insertResult: InsertAIAnalysisResult): Promise<AIAnalysisResult> {
    const [result] = await db
      .insert(aiAnalysisResults)
      .values(insertResult)
      .returning();
    return result;
  }

  async getSystemMetrics(): Promise<SystemMetrics | undefined> {
    const [metrics] = await db.select().from(systemMetrics)
      .orderBy(desc(systemMetrics.lastUpdated))
      .limit(1);
    return metrics || undefined;
  }

  async updateSystemMetrics(insertMetrics: InsertSystemMetrics): Promise<SystemMetrics> {
    // Check if metrics exist
    const existing = await this.getSystemMetrics();
    
    if (existing) {
      const [metrics] = await db
        .update(systemMetrics)
        .set(insertMetrics)
        .where(eq(systemMetrics.id, existing.id))
        .returning();
      return metrics;
    } else {
      const [metrics] = await db
        .insert(systemMetrics)
        .values(insertMetrics)
        .returning();
      return metrics;
    }
  }

  async getDatasetStats(): Promise<DatasetStats | undefined> {
    const [stats] = await db.select().from(datasetStats)
      .orderBy(desc(datasetStats.lastRetraining))
      .limit(1);
    return stats || undefined;
  }

  async updateDatasetStats(insertStats: InsertDatasetStats): Promise<DatasetStats> {
    // Check if stats exist
    const existing = await this.getDatasetStats();
    
    if (existing) {
      const [stats] = await db
        .update(datasetStats)
        .set(insertStats)
        .where(eq(datasetStats.id, existing.id))
        .returning();
      return stats;
    } else {
      const [stats] = await db
        .insert(datasetStats)
        .values(insertStats)
        .returning();
      return stats;
    }
  }
}

export const storage = new DatabaseStorage();
