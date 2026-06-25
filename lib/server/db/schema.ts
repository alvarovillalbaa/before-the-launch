import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type {
  AgentResult,
  Recommendation,
  ScoreBreakdown,
} from "@/lib/shared/schemas";

function timestamps() {
  return {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  };
}

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  ...timestamps(),
});

export const productProjects = pgTable("product_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  status: varchar("status", { length: 40 }).default("draft").notNull(),
  nextRecommendedAction: text("next_recommended_action").default("").notNull(),
  lastRunId: uuid("last_run_id"),
  ...timestamps(),
});

export const productBriefs = pgTable("product_briefs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => productProjects.id, { onDelete: "cascade" })
    .notNull(),
  version: integer("version").default(1).notNull(),
  productName: varchar("product_name", { length: 160 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  icp: text("icp").notNull(),
  market: varchar("market", { length: 160 }).notNull(),
  expectedPrice: varchar("expected_price", { length: 120 }).notNull(),
  competitors: text("competitors").default("").notNull(),
  launchChannel: varchar("launch_channel", { length: 160 }).notNull(),
  positioningStatement: text("positioning_statement").notNull(),
  notes: text("notes").default("").notNull(),
  isCurrent: boolean("is_current").default(true).notNull(),
  ...timestamps(),
});

export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => productProjects.id, { onDelete: "cascade" })
    .notNull(),
  kind: varchar("kind", { length: 40 }).notNull(),
  inputType: varchar("input_type", { length: 20 }).notNull(),
  status: varchar("status", { length: 24 }).default("pending").notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  url: text("url"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }),
  contentHash: varchar("content_hash", { length: 80 }),
  mimeType: varchar("mime_type", { length: 120 }),
  byteSize: integer("byte_size"),
  storageKey: text("storage_key"),
  extractedText: text("extracted_text"),
  errorMessage: text("error_message"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  ...timestamps(),
});

export const sourceChunks = pgTable("source_chunks", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceId: uuid("source_id")
    .references(() => sources.id, { onDelete: "cascade" })
    .notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  text: text("text").notNull(),
  tokenEstimate: integer("token_estimate").notNull(),
  contentHash: varchar("content_hash", { length: 80 }).notNull(),
  ...timestamps(),
});

export const personas = pgTable(
  "personas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    role: varchar("role", { length: 160 }).notNull(),
    description: text("description").notNull(),
    evaluationLens: text("evaluation_lens").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    ...timestamps(),
  },
  (table) => ({
    nameWorkspaceIdx: uniqueIndex("personas_workspace_name_idx").on(
      table.workspaceId,
      table.name,
    ),
  }),
);

export const simulationRuns = pgTable("simulation_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => productProjects.id, { onDelete: "cascade" })
    .notNull(),
  workflowRunId: varchar("workflow_run_id", { length: 160 }),
  status: varchar("status", { length: 24 }).default("queued").notNull(),
  engine: varchar("engine", { length: 24 }).default("fake").notNull(),
  depth: varchar("depth", { length: 24 }).default("standard").notNull(),
  targetMarket: varchar("target_market", { length: 180 }).notNull(),
  budgetLimitCents: integer("budget_limit_cents").default(0).notNull(),
  agentCount: integer("agent_count").default(8).notNull(),
  globalScore: numeric("global_score", { precision: 5, scale: 2 }),
  briefSnapshot: jsonb("brief_snapshot").$type<Record<string, unknown>>().notNull(),
  sourceSnapshot: jsonb("source_snapshot").$type<Record<string, unknown>[]>().notNull(),
  personaSnapshot: jsonb("persona_snapshot").$type<Record<string, unknown>[]>().notNull(),
  disagreementSummary: jsonb("disagreement_summary").$type<Record<string, unknown>>(),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps(),
});

export const agentRuns = pgTable("agent_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  simulationRunId: uuid("simulation_run_id")
    .references(() => simulationRuns.id, { onDelete: "cascade" })
    .notNull(),
  personaId: uuid("persona_id"),
  personaSnapshot: jsonb("persona_snapshot").$type<Record<string, unknown>>().notNull(),
  status: varchar("status", { length: 24 }).default("queued").notNull(),
  currentStep: varchar("current_step", { length: 160 }).default("Queued").notNull(),
  tokenCount: integer("token_count"),
  latencyMs: integer("latency_ms"),
  costCents: integer("cost_cents"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps(),
});

export const agentTraceEvents = pgTable("agent_trace_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentRunId: uuid("agent_run_id")
    .references(() => agentRuns.id, { onDelete: "cascade" })
    .notNull(),
  sequence: integer("sequence").notNull(),
  eventType: varchar("event_type", { length: 60 }).notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  body: text("body").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const agentFindings = pgTable("agent_findings", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentRunId: uuid("agent_run_id")
    .references(() => agentRuns.id, { onDelete: "cascade" })
    .notNull(),
  result: jsonb("result").$type<AgentResult>().notNull(),
  evidenceSummary: text("evidence_summary").notNull(),
  ...timestamps(),
});

export const scoreBreakdowns = pgTable("score_breakdowns", {
  id: uuid("id").defaultRandom().primaryKey(),
  simulationRunId: uuid("simulation_run_id")
    .references(() => simulationRuns.id, { onDelete: "cascade" })
    .notNull(),
  scores: jsonb("scores").$type<ScoreBreakdown>().notNull(),
  globalScore: numeric("global_score", { precision: 5, scale: 2 }).notNull(),
  ...timestamps(),
});

export const recommendations = pgTable("recommendations", {
  id: uuid("id").defaultRandom().primaryKey(),
  simulationRunId: uuid("simulation_run_id")
    .references(() => simulationRuns.id, { onDelete: "cascade" })
    .notNull(),
  area: varchar("area", { length: 40 }).notNull(),
  priority: varchar("priority", { length: 20 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  rationale: text("rationale").notNull(),
  suggestedChange: text("suggested_change").notNull(),
  payload: jsonb("payload").$type<Recommendation>().notNull(),
  ...timestamps(),
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  simulationRunId: uuid("simulation_run_id")
    .references(() => simulationRuns.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  format: varchar("format", { length: 20 }).default("markdown").notNull(),
  body: text("body").notNull(),
  ...timestamps(),
});

export const workspaceRelations = relations(workspaces, ({ many }) => ({
  projects: many(productProjects),
  personas: many(personas),
}));

export const projectRelations = relations(productProjects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [productProjects.workspaceId],
    references: [workspaces.id],
  }),
  briefs: many(productBriefs),
  sources: many(sources),
  runs: many(simulationRuns),
}));

export const runRelations = relations(simulationRuns, ({ many, one }) => ({
  project: one(productProjects, {
    fields: [simulationRuns.projectId],
    references: [productProjects.id],
  }),
  agentRuns: many(agentRuns),
  scoreBreakdowns: many(scoreBreakdowns),
  recommendations: many(recommendations),
  reports: many(reports),
}));

export const agentRunRelations = relations(agentRuns, ({ many, one }) => ({
  run: one(simulationRuns, {
    fields: [agentRuns.simulationRunId],
    references: [simulationRuns.id],
  }),
  events: many(agentTraceEvents),
  findings: many(agentFindings),
}));
