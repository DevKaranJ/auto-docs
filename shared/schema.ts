import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const demoRequests = pgTable("demo_requests", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  language: text("language").notNull(),
  format: text("format").notNull(),
  style: text("style").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  processingTime: integer("processing_time"), // in milliseconds
  stats: jsonb("stats"), // JSON object with functions/classes/exports count
});

export const documentationJobs = pgTable("documentation_jobs", {
  id: text("id").primaryKey(),
  projectName: text("project_name"),
  sourceFiles: jsonb("source_files").notNull(), // Array of file paths
  configuration: jsonb("configuration").notNull(), // Auto-docs config
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  totalFiles: integer("total_files").notNull(),
  processedFiles: integer("processed_files").default(0),
  generatedDocs: jsonb("generated_docs"), // Array of generated documentation
  errorMessage: text("error_message"),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  keyName: text("key_name").notNull(),
  keyValue: text("key_value").notNull(),
  provider: text("provider").notNull(), // openai, ollama, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used"),
  usageCount: integer("usage_count").default(0),
});

export const documentationMetrics = pgTable("documentation_metrics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  totalGenerations: integer("total_generations").default(0),
  successfulGenerations: integer("successful_generations").default(0),
  failedGenerations: integer("failed_generations").default(0),
  avgProcessingTime: integer("avg_processing_time"), // in milliseconds
  totalFunctionsDocumented: integer("total_functions_documented").default(0),
  totalClassesDocumented: integer("total_classes_documented").default(0),
  languageBreakdown: jsonb("language_breakdown"), // Object with language usage stats
  formatBreakdown: jsonb("format_breakdown"), // Object with output format stats
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDemoRequestSchema = createInsertSchema(demoRequests).pick({
  id: true,
  code: true,
  language: true,
  format: true,
  style: true,
  timestamp: true,
});

export const insertDocumentationJobSchema = createInsertSchema(documentationJobs).pick({
  id: true,
  projectName: true,
  sourceFiles: true,
  configuration: true,
  totalFiles: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  userId: true,
  keyName: true,
  keyValue: true,
  provider: true,
});

export const insertDocumentationMetricsSchema = createInsertSchema(documentationMetrics).pick({
  date: true,
  totalGenerations: true,
  successfulGenerations: true,
  failedGenerations: true,
  avgProcessingTime: true,
  totalFunctionsDocumented: true,
  totalClassesDocumented: true,
  languageBreakdown: true,
  formatBreakdown: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDemoRequest = z.infer<typeof insertDemoRequestSchema>;
export type DemoRequest = typeof demoRequests.$inferSelect;

export type InsertDocumentationJob = z.infer<typeof insertDocumentationJobSchema>;
export type DocumentationJob = typeof documentationJobs.$inferSelect;

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

export type InsertDocumentationMetrics = z.infer<typeof insertDocumentationMetricsSchema>;
export type DocumentationMetrics = typeof documentationMetrics.$inferSelect;

// Additional types for frontend/API
export interface DemoStats {
  totalRequests: number;
  successRate: number;
  avgProcessingTime: number;
  languageBreakdown: Record<string, number>;
  formatBreakdown: Record<string, number>;
  recentRequests: DemoRequest[];
}

export interface GenerateDocsRequest {
  code: string;
  language: 'javascript' | 'typescript' | 'python' | 'go';
  format: 'markdown' | 'html' | 'json';
  style: 'concise' | 'detailed';
}

export interface GenerateDocsResponse {
  markdown: string;
  html: string;
  json: string;
  processingTime: number;
  stats: {
    functionsCount: number;
    classesCount: number;
    exportsCount: number;
  };
}

export interface DocumentationConfig {
  ai: 'openai' | 'ollama';
  format: 'markdown' | 'html' | 'json';
  style: 'concise' | 'detailed';
  output: string;
  ignore: string[];
  includeExamples: boolean;
  includeTypes: boolean;
}
