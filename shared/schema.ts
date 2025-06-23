import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const trafficLogs = pgTable("traffic_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  sourceIP: text("source_ip").notNull(),
  country: text("country").notNull(),
  attackType: text("attack_type").notNull(),
  target: text("target").notNull(),
  severity: text("severity").notNull(), // "high", "medium", "low"
  status: text("status").notNull(), // "blocked", "monitored", "analyzed"
  payload: text("payload"),
  userAgent: text("user_agent"),
  method: text("method").notNull(),
  port: integer("port").notNull(),
});

export const attackPatterns = pgTable("attack_patterns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  confidence: integer("confidence").notNull(), // percentage 0-100
  occurrences: integer("occurrences").notNull(),
  firstSeen: timestamp("first_seen").notNull(),
  lastSeen: timestamp("last_seen").notNull(),
  technique: text("technique").notNull(),
  riskScore: integer("risk_score").notNull(), // 1-10
  status: text("status").notNull(), // "new", "under_review", "confirmed", "added_to_dataset"
  aiGenerated: boolean("ai_generated").notNull().default(true),
});

export const aiAnalysisResults = pgTable("ai_analysis_results", {
  id: serial("id").primaryKey(),
  trafficLogId: integer("traffic_log_id").references(() => trafficLogs.id),
  attackType: text("attack_type").notNull(),
  technique: text("technique").notNull(),
  riskScore: integer("risk_score").notNull(),
  recommendations: text("recommendations").notNull(), // JSON string
  confidence: integer("confidence").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  attacksToday: integer("attacks_today").notNull(),
  uniqueIPs: integer("unique_ips").notNull(),
  aiDetections: integer("ai_detections").notNull(),
  blockedAttempts: integer("blocked_attempts").notNull(),
  uptime: text("uptime").notNull(),
  lastUpdated: timestamp("last_updated").notNull(),
});

export const datasetStats = pgTable("dataset_stats", {
  id: serial("id").primaryKey(),
  sqlSamples: integer("sql_samples").notNull(),
  bruteForceSamples: integer("brute_force_samples").notNull(),
  xssSamples: integer("xss_samples").notNull(),
  ddosPatterns: integer("ddos_patterns").notNull(),
  modelAccuracy: integer("model_accuracy").notNull(), // percentage
  lastRetraining: timestamp("last_retraining").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTrafficLogSchema = createInsertSchema(trafficLogs).omit({
  id: true,
});

export const insertAttackPatternSchema = createInsertSchema(attackPatterns).omit({
  id: true,
});

export const insertAIAnalysisResultSchema = createInsertSchema(aiAnalysisResults).omit({
  id: true,
});

export const insertSystemMetricsSchema = createInsertSchema(systemMetrics).omit({
  id: true,
});

export const insertDatasetStatsSchema = createInsertSchema(datasetStats).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type TrafficLog = typeof trafficLogs.$inferSelect;
export type InsertTrafficLog = z.infer<typeof insertTrafficLogSchema>;

export type AttackPattern = typeof attackPatterns.$inferSelect;
export type InsertAttackPattern = z.infer<typeof insertAttackPatternSchema>;

export type AIAnalysisResult = typeof aiAnalysisResults.$inferSelect;
export type InsertAIAnalysisResult = z.infer<typeof insertAIAnalysisResultSchema>;

export type SystemMetrics = typeof systemMetrics.$inferSelect;
export type InsertSystemMetrics = z.infer<typeof insertSystemMetricsSchema>;

export type DatasetStats = typeof datasetStats.$inferSelect;
export type InsertDatasetStats = z.infer<typeof insertDatasetStatsSchema>;
