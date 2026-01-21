import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status', { enum: ['draft', 'interviewing', 'completed'] })
    .notNull()
    .default('draft'),
  currentPhase: text('current_phase', { enum: ['seed', 'sprout', 'tree', 'final'] })
    .notNull()
    .default('seed'),
  currentStep: integer('current_step').notNull().default(1),
  completionRate: real('completion_rate').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const interviewSteps = sqliteTable('interview_steps', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(),
  phase: text('phase', { enum: ['seed', 'sprout', 'tree', 'final'] }).notNull(),
  question: text('question').notNull(),
  questionType: text('question_type', {
    enum: ['text_input', 'single_select', 'multi_select', 'multi_select_with_status'],
  }).notNull(),
  answer: text('answer'),
  answerState: text('answer_state', { enum: ['confirmed', 'inferred', 'pending', 'missing'] })
    .notNull()
    .default('missing'),
  options: text('options'),
  rfpMapping: text('rfp_mapping').notNull(),
  validationAttempts: integer('validation_attempts').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const rfpDocuments = sqliteTable('rfp_documents', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  version: text('version').notNull().default('1.0'),
  content: text('content').notNull(),
  completionRate: real('completion_rate').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type InterviewStep = typeof interviewSteps.$inferSelect;
export type NewInterviewStep = typeof interviewSteps.$inferInsert;
export type RFPDocument = typeof rfpDocuments.$inferSelect;
export type NewRFPDocument = typeof rfpDocuments.$inferInsert;
