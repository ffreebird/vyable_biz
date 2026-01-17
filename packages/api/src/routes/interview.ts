import { zValidator } from '@hono/zod-validator';
import {
  PHASE_CONFIG,
  PhaseTransitionSchema,
  STEP_CONFIG,
  SubmitAnswerSchema,
  TOTAL_STEPS,
  getNextPhase,
  isPhaseTransitionStep,
} from '@vyable/shared';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { db, interviewSteps, projects } from '../db';
import { interviewEngine } from '../services/ai/interview-engine';

const app = new Hono();

app.get('/:projectId/interview', async (c) => {
  const projectId = c.req.param('projectId');

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const steps = await db
    .select()
    .from(interviewSteps)
    .where(eq(interviewSteps.projectId, projectId));

  const completedSteps = steps
    .filter((s) => s.answerState === 'confirmed' || s.answerState === 'inferred')
    .map((s) => s.stepNumber);

  const phaseProgress = {
    seed: {
      completed: completedSteps.filter((s) => s >= 1 && s <= 6).length,
      total: 6,
    },
    sprout: {
      completed: completedSteps.filter((s) => s >= 7 && s <= 10).length,
      total: 4,
    },
    tree: {
      completed: completedSteps.filter((s) => s >= 11 && s <= 17).length,
      total: 7,
    },
    final: {
      completed: completedSteps.filter((s) => s >= 18 && s <= 20).length,
      total: 3,
    },
  };

  return c.json({
    projectId,
    currentStep: project.currentStep,
    currentPhase: project.currentPhase,
    completedSteps,
    progress: {
      total: TOTAL_STEPS,
      completed: completedSteps.length,
      percentage: Math.round((completedSteps.length / TOTAL_STEPS) * 100),
    },
    phaseProgress,
  });
});

app.post('/:projectId/interview/next', async (c) => {
  const projectId = c.req.param('projectId');

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const stepNumber = project.currentStep;
  const stepConfig = STEP_CONFIG[stepNumber];

  if (!stepConfig) {
    return c.json({ error: 'Invalid step number' }, 400);
  }

  const steps = await db
    .select()
    .from(interviewSteps)
    .where(eq(interviewSteps.projectId, projectId));

  const question = await interviewEngine.generateQuestion(stepNumber, project, steps);

  return c.json({
    step: stepNumber,
    phase: stepConfig.phase,
    phaseName: PHASE_CONFIG[stepConfig.phase].label,
    question: question.text,
    type: stepConfig.questionType,
    options: question.options,
    allowCustomInput: stepConfig.allowCustomInput,
    rfpMapping: stepConfig.rfpMapping,
    hint: question.hint,
  });
});

app.post('/:projectId/interview/answer', zValidator('json', SubmitAnswerSchema), async (c) => {
  const projectId = c.req.param('projectId');
  const data = c.req.valid('json');

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const stepConfig = STEP_CONFIG[data.stepNumber];
  if (!stepConfig) {
    return c.json({ error: 'Invalid step number' }, 400);
  }

  const [existingStep] = await db
    .select()
    .from(interviewSteps)
    .where(
      and(eq(interviewSteps.projectId, projectId), eq(interviewSteps.stepNumber, data.stepNumber))
    );

  const validation = await interviewEngine.validateAnswer(
    data.stepNumber,
    data.answer,
    existingStep?.validationAttempts ?? 0,
    project
  );

  if (!validation.valid && validation.inquiry) {
    const now = new Date().toISOString();
    if (existingStep) {
      await db
        .update(interviewSteps)
        .set({
          validationAttempts: existingStep.validationAttempts + 1,
          updatedAt: now,
        })
        .where(eq(interviewSteps.id, existingStep.id));
    } else {
      await db.insert(interviewSteps).values({
        id: nanoid(),
        projectId,
        stepNumber: data.stepNumber,
        phase: stepConfig.phase,
        question: '',
        questionType: stepConfig.questionType,
        answerState: 'pending',
        rfpMapping: stepConfig.rfpMapping,
        validationAttempts: 1,
        createdAt: now,
        updatedAt: now,
      });
    }

    return c.json({
      success: false,
      validation,
    });
  }

  const now = new Date().toISOString();
  const answerJson = Array.isArray(data.answer) ? JSON.stringify(data.answer) : data.answer;

  if (existingStep) {
    await db
      .update(interviewSteps)
      .set({
        answer: answerJson,
        answerState: 'confirmed',
        updatedAt: now,
      })
      .where(eq(interviewSteps.id, existingStep.id));
  } else {
    await db.insert(interviewSteps).values({
      id: nanoid(),
      projectId,
      stepNumber: data.stepNumber,
      phase: stepConfig.phase,
      question: '',
      questionType: stepConfig.questionType,
      answer: answerJson,
      answerState: 'confirmed',
      rfpMapping: stepConfig.rfpMapping,
      validationAttempts: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  const isTransition = isPhaseTransitionStep(data.stepNumber);
  const nextPhase = getNextPhase(project.currentPhase);
  const isComplete = data.stepNumber === TOTAL_STEPS;

  if (!isTransition && !isComplete) {
    await db
      .update(projects)
      .set({
        currentStep: data.stepNumber + 1,
        status: 'interviewing',
        updatedAt: now,
      })
      .where(eq(projects.id, projectId));
  }

  return c.json({
    success: true,
    validation: { valid: true },
    nextStep: isTransition || isComplete ? undefined : data.stepNumber + 1,
    nextPhase: isTransition ? nextPhase : undefined,
    isPhaseTransition: isTransition,
    transitionQuestion: isTransition
      ? PHASE_CONFIG[project.currentPhase].transitionQuestion
      : undefined,
    isComplete,
  });
});

app.post(
  '/:projectId/interview/transition',
  zValidator('json', PhaseTransitionSchema),
  async (c) => {
    const projectId = c.req.param('projectId');
    const { proceed } = c.req.valid('json');

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const now = new Date().toISOString();
    const nextPhase = getNextPhase(project.currentPhase);

    if (proceed && nextPhase && nextPhase !== 'final') {
      const nextStep = PHASE_CONFIG[nextPhase].steps[0];
      await db
        .update(projects)
        .set({
          currentPhase: nextPhase,
          currentStep: nextStep,
          updatedAt: now,
        })
        .where(eq(projects.id, projectId));

      return c.json({
        nextPhase,
        nextStep,
      });
    }
    const finalStep = PHASE_CONFIG.final.steps[0];
    await db
      .update(projects)
      .set({
        currentPhase: 'final',
        currentStep: finalStep,
        updatedAt: now,
      })
      .where(eq(projects.id, projectId));

    return c.json({
      nextPhase: 'final',
      nextStep: finalStep,
    });
  }
);

export default app;
