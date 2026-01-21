import type { AnswerState } from '@vyable/shared';
import { SECTION_NAMES, STEP_CONFIG } from '@vyable/shared';
import type { InterviewStep, Project } from '../../db/schema';
import { generateWithClaude } from '@vyable/core';

interface RFPSection {
  id: string;
  name: string;
  content: string | null;
  state: AnswerState;
  sourceStep?: number;
}

interface RFPContent {
  sections: RFPSection[];
  summary: string;
  completionRate: number;
}

interface RFPPreview {
  sections: Array<{
    id: string;
    name: string;
    status: 'complete' | 'partial' | 'missing';
    preview: string;
  }>;
  overallProgress: number;
}

class RFPEngine {
  async generateRFP(project: Project, steps: InterviewStep[]): Promise<RFPContent> {
    const mappedData = this.mapStepsToSections(steps);

    const prompt = `
당신은 숙련된 비즈니스 기획자입니다. 인터뷰 결과를 바탕으로 RFP(프로젝트 정의서)를 작성합니다.

## 프로젝트 정보
이름: ${project.name}

## 인터뷰 결과
${JSON.stringify(mappedData, null, 2)}

## RFP 작성 지침
1. 각 섹션별로 인터뷰 결과를 정리합니다.
2. [확정] 상태의 답변은 그대로 반영합니다.
3. [추론] 상태의 답변은 맥락에서 유추한 것임을 명시합니다.
4. [미정] 상태의 항목은 1.9 결정 보류에 기록합니다.
5. [누락] 상태의 항목은 추가 질문이 필요함을 표시합니다.

## 출력 형식 (JSON)
{
  "sections": [
    {
      "id": "1.1.1",
      "name": "해결하려는 문제",
      "content": "문제 설명...",
      "state": "confirmed",
      "sourceStep": 1
    }
  ],
  "summary": "이 프로젝트는... (1-2문장 요약)"
}
`;

    try {
      const response = await generateWithClaude(prompt);
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        ...parsed,
        completionRate: this.calculateCompletionRate(parsed),
      };
    } catch {
      return this.generateFallbackRFP(project, steps);
    }
  }

  generatePreview(_project: Project, steps: InterviewStep[]): RFPPreview {
    const sectionStatus = new Map<
      string,
      { status: 'complete' | 'partial' | 'missing'; preview: string }
    >();

    for (const [sectionId, _sectionName] of Object.entries(SECTION_NAMES)) {
      sectionStatus.set(sectionId, {
        status: 'missing',
        preview: '아직 정보가 없습니다.',
      });
    }

    for (const step of steps) {
      if (!step.answer) continue;

      const stepConfig = STEP_CONFIG[step.stepNumber];
      if (!stepConfig) continue;

      const mappings = stepConfig.rfpMapping.split(',');
      for (const sectionId of mappings) {
        if (sectionId === '*') continue;

        const current = sectionStatus.get(sectionId);
        if (current) {
          const answerPreview =
            typeof step.answer === 'string'
              ? step.answer.slice(0, 100)
              : JSON.stringify(step.answer).slice(0, 100);

          sectionStatus.set(sectionId, {
            status: step.answerState === 'confirmed' ? 'complete' : 'partial',
            preview: answerPreview + (answerPreview.length >= 100 ? '...' : ''),
          });
        }
      }
    }

    const sections = Array.from(sectionStatus.entries()).map(([id, data]) => ({
      id,
      name: SECTION_NAMES[id as keyof typeof SECTION_NAMES] || id,
      status: data.status,
      preview: data.preview,
    }));

    const complete = sections.filter((s) => s.status === 'complete').length;
    const total = sections.length;

    return {
      sections,
      overallProgress: Math.round((complete / total) * 100),
    };
  }

  calculateCompletionRate(content: RFPContent | { sections: RFPSection[] }): number {
    const sections = content.sections;
    if (sections.length === 0) return 0;

    let score = 0;
    for (const section of sections) {
      if (section.state === 'confirmed') score += 1;
      else if (section.state === 'inferred') score += 0.5;
    }

    return Math.round((score / sections.length) * 100);
  }

  private mapStepsToSections(
    steps: InterviewStep[]
  ): Record<string, { answer: string | null; state: AnswerState; step: number }> {
    const result: Record<string, { answer: string | null; state: AnswerState; step: number }> = {};

    for (const step of steps) {
      const stepConfig = STEP_CONFIG[step.stepNumber];
      if (!stepConfig) continue;

      const mappings = stepConfig.rfpMapping.split(',');
      for (const sectionId of mappings) {
        if (sectionId === '*') continue;

        result[sectionId] = {
          answer: step.answer,
          state: step.answerState as AnswerState,
          step: step.stepNumber,
        };
      }
    }

    return result;
  }

  private generateFallbackRFP(project: Project, steps: InterviewStep[]): RFPContent {
    const sections: RFPSection[] = [];

    for (const [sectionId, sectionName] of Object.entries(SECTION_NAMES)) {
      const relatedStep = steps.find((s) => {
        const config = STEP_CONFIG[s.stepNumber];
        return config?.rfpMapping.includes(sectionId);
      });

      sections.push({
        id: sectionId,
        name: sectionName,
        content: relatedStep?.answer || null,
        state: (relatedStep?.answerState as AnswerState) || 'missing',
        sourceStep: relatedStep?.stepNumber,
      });
    }

    return {
      sections,
      summary: `${project.name} 프로젝트의 RFP입니다.`,
      completionRate: this.calculateCompletionRate({ sections }),
    };
  }
}

export const rfpEngine = new RFPEngine();
