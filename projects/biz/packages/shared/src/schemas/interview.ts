import { z } from 'zod';
import { AnswerStateSchema, PhaseSchema } from './project';

export const QuestionTypeSchema = z.enum([
  'text_input',
  'single_select',
  'multi_select',
  'multi_select_with_status',
]);

export const FeatureStatusSchema = z.enum(['required', 'later', 'excluded', 'pending']);

export const OptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  hint: z.string().optional(),
  status: FeatureStatusSchema.optional(),
});

export const InterviewStepSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  stepNumber: z.number().int().min(1).max(20),
  phase: PhaseSchema,
  question: z.string(),
  questionType: QuestionTypeSchema,
  answer: z.union([z.string(), z.array(z.string()), z.null()]),
  answerState: AnswerStateSchema,
  options: z.array(OptionSchema).nullable(),
  rfpMapping: z.string(),
  validationAttempts: z.number().int().min(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const QuestionResponseSchema = z.object({
  step: z.number().int().min(1).max(20),
  phase: PhaseSchema,
  phaseName: z.string(),
  question: z.string(),
  type: QuestionTypeSchema,
  options: z.array(OptionSchema).optional(),
  allowCustomInput: z.boolean().optional(),
  rfpMapping: z.string(),
  hint: z.string().optional(),
});

export const SubmitAnswerSchema = z.object({
  stepNumber: z.number().int().min(1).max(20),
  answer: z.union([z.string(), z.array(z.string())]),
  customInput: z.string().optional(),
});

export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  reason: z.string().optional(),
  inquiry: z
    .object({
      question: z.string(),
      attempt: z.number(),
      maxAttempts: z.number(),
    })
    .optional(),
});

export const AnswerResponseSchema = z.object({
  success: z.boolean(),
  validation: ValidationResultSchema,
  nextStep: z.number().int().min(1).max(20).optional(),
  nextPhase: PhaseSchema.optional(),
  isPhaseTransition: z.boolean().optional(),
  transitionQuestion: z.string().optional(),
  isComplete: z.boolean().optional(),
});

export const PhaseTransitionSchema = z.object({
  proceed: z.boolean(),
});

export const InterviewStateResponseSchema = z.object({
  projectId: z.string().uuid(),
  currentStep: z.number().int().min(1).max(20),
  currentPhase: PhaseSchema,
  completedSteps: z.array(z.number().int().min(1).max(20)),
  progress: z.object({
    total: z.number().int(),
    completed: z.number().int(),
    percentage: z.number().min(0).max(100),
  }),
  phaseProgress: z.object({
    seed: z.object({ completed: z.number().int(), total: z.number().int() }),
    sprout: z.object({ completed: z.number().int(), total: z.number().int() }),
    tree: z.object({ completed: z.number().int(), total: z.number().int() }),
    final: z.object({ completed: z.number().int(), total: z.number().int() }),
  }),
});
