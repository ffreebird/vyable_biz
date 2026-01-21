import { z } from 'zod';
import { AnswerStateSchema } from './project';

export const RFPFieldSchema = z.object({
  content: z.string().nullable(),
  state: AnswerStateSchema,
  sourceStep: z.number().int().min(1).max(20).optional(),
});

export const RFPCompetitorSchema = z.object({
  name: z.string(),
  type: z.enum(['direct', 'indirect']),
  strengths: z.string(),
  weaknesses: z.string(),
});

export const RFPUserTypeSchema = z.object({
  name: z.string(),
  definition: z.string(),
  purpose: z.string(),
});

export const RFPUserGoalSchema = z.object({
  type: z.string(),
  goal: z.string(),
  successCondition: z.string(),
  obstacles: z.string(),
});

export const RFPFeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
  linkedGoal: z.string().optional(),
  withoutIt: z.string().optional(),
  expectedEffect: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  excludeReason: z.string().optional(),
  future: z.enum(['planned', 'permanent']).optional(),
});

export const RFPCostItemSchema = z.object({
  item: z.string(),
  estimatedAmount: z.string(),
  type: z.enum(['fixed', 'variable']),
});

export const RFPExternalDependencySchema = z.object({
  system: z.string(),
  purpose: z.string(),
  integrationMethod: z.string(),
  confirmed: z.boolean(),
  replaceable: z.boolean(),
});

export const RFPRegulationSchema = z.object({
  law: z.string(),
  impact: z.string(),
  requiredAction: z.string(),
});

export const RFPMetricSchema = z.object({
  name: z.string(),
  definition: z.string(),
  target: z.string(),
  measurementTime: z.string(),
});

export const RFPHypothesisSchema = z.object({
  hypothesis: z.string(),
  ifTrue: z.string(),
  ifFalse: z.string(),
});

export const RFPTermSchema = z.object({
  term: z.string(),
  definition: z.string(),
  notThis: z.string(),
  relatedTerms: z.string(),
});

export const RFPScenarioSchema = z.object({
  userType: z.string(),
  journey: z.array(z.string()),
  intersectionPoints: z.string(),
});

export const RFPDeferredItemSchema = z.object({
  item: z.string(),
  decisionDeadline: z.string(),
  temporaryAssumption: z.string(),
});

export const GenerateRFPSchema = z.object({
  projectId: z.string().uuid(),
});
