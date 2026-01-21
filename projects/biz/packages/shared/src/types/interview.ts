import type { AnswerState, Phase } from './project';

export type QuestionType =
  | 'text_input'
  | 'single_select'
  | 'multi_select'
  | 'multi_select_with_status';

export type FeatureStatus = 'required' | 'later' | 'excluded' | 'pending';

export interface Option {
  id: string;
  label: string;
  hint?: string;
  status?: FeatureStatus;
}

export interface InterviewStep {
  id: string;
  projectId: string;
  stepNumber: number;
  phase: Phase;
  question: string;
  questionType: QuestionType;
  answer: string | string[] | null;
  answerState: AnswerState;
  options: Option[] | null;
  rfpMapping: string;
  validationAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionResponse {
  step: number;
  phase: Phase;
  phaseName: string;
  question: string;
  type: QuestionType;
  options?: Option[];
  allowCustomInput?: boolean;
  rfpMapping: string;
  hint?: string;
}

export interface SubmitAnswerRequest {
  stepNumber: number;
  answer: string | string[];
  customInput?: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  inquiry?: {
    question: string;
    attempt: number;
    maxAttempts: number;
  };
}

export interface AnswerResponse {
  success: boolean;
  validation: ValidationResult;
  nextStep?: number;
  nextPhase?: Phase;
  isPhaseTransition?: boolean;
  transitionQuestion?: string;
  isComplete?: boolean;
}

export interface PhaseTransitionRequest {
  proceed: boolean;
}

export interface InterviewStateResponse {
  projectId: string;
  currentStep: number;
  currentPhase: Phase;
  completedSteps: number[];
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
  phaseProgress: {
    seed: { completed: number; total: number };
    sprout: { completed: number; total: number };
    tree: { completed: number; total: number };
    final: { completed: number; total: number };
  };
}
