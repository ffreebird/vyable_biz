export type ProjectStatus = 'draft' | 'interviewing' | 'completed';

export type Phase = 'seed' | 'sprout' | 'tree' | 'final';

export type AnswerState = 'confirmed' | 'inferred' | 'pending' | 'missing';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  currentPhase: Phase;
  currentStep: number;
  completionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectRequest {
  name: string;
}

export interface UpdateProjectRequest {
  name?: string;
  status?: ProjectStatus;
  currentPhase?: Phase;
  currentStep?: number;
}

export interface ProjectResponse extends Omit<Project, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}
