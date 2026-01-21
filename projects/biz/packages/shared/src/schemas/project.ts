import { z } from 'zod';

export const ProjectStatusSchema = z.enum(['draft', 'interviewing', 'completed']);
export const PhaseSchema = z.enum(['seed', 'sprout', 'tree', 'final']);
export const AnswerStateSchema = z.enum(['confirmed', 'inferred', 'pending', 'missing']);

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  status: ProjectStatusSchema,
  currentPhase: PhaseSchema,
  currentStep: z.number().int().min(1).max(20),
  completionRate: z.number().min(0).max(100),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1, '프로젝트 이름을 입력해주세요').max(100, '100자 이내로 입력해주세요'),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: ProjectStatusSchema.optional(),
  currentPhase: PhaseSchema.optional(),
  currentStep: z.number().int().min(1).max(20).optional(),
});
