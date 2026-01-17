import type {
  AnswerResponse,
  CreateProjectRequest,
  InterviewStateResponse,
  PhaseTransitionRequest,
  ProjectResponse,
  QuestionResponse,
  RFPResponse,
  SubmitAnswerRequest,
} from '@vyable/shared';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  projects: {
    list: () => fetchJson<ProjectResponse[]>('/api/projects'),
    get: (id: string) => fetchJson<ProjectResponse>(`/api/projects/${id}`),
    create: (data: CreateProjectRequest) =>
      fetchJson<ProjectResponse>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`/api/projects/${id}`, {
        method: 'DELETE',
      }),
  },

  interview: {
    getState: (projectId: string) =>
      fetchJson<InterviewStateResponse>(`/api/projects/${projectId}/interview`),
    getNext: (projectId: string) =>
      fetchJson<QuestionResponse>(`/api/projects/${projectId}/interview/next`, {
        method: 'POST',
      }),
    submitAnswer: (projectId: string, data: SubmitAnswerRequest) =>
      fetchJson<AnswerResponse>(`/api/projects/${projectId}/interview/answer`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    transition: (projectId: string, data: PhaseTransitionRequest) =>
      fetchJson<{ nextPhase: string; nextStep: number }>(
        `/api/projects/${projectId}/interview/transition`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
  },

  rfp: {
    get: (projectId: string) => fetchJson<RFPResponse>(`/api/projects/${projectId}/rfp`),
    generate: (projectId: string) =>
      fetchJson<RFPResponse>(`/api/projects/${projectId}/rfp/generate`, {
        method: 'POST',
      }),
    preview: (projectId: string) =>
      fetchJson<{
        sections: Array<{
          id: string;
          name: string;
          status: string;
          preview: string;
        }>;
        overallProgress: number;
      }>(`/api/projects/${projectId}/rfp/preview`),
  },
};
