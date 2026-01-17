import type { Phase } from '../types/project';

export const PHASE_CONFIG = {
  seed: {
    name: 'Seed',
    label: '씨앗',
    description: '제품 정의',
    steps: [1, 2, 3, 4, 5, 6],
    transitionQuestion: '이 제품을 실제 시장에서 검증하길 원하시나요?',
  },
  sprout: {
    name: 'Sprout',
    label: '새싹',
    description: '시장 검증',
    steps: [7, 8, 9, 10],
    transitionQuestion: '이 서비스를 정식으로 출시하실 건가요?',
  },
  tree: {
    name: 'Tree',
    label: '나무',
    description: '사업 운영',
    steps: [11, 12, 13, 14, 15, 16, 17],
    transitionQuestion: null,
  },
  final: {
    name: 'Final',
    label: '마무리',
    description: '정리 및 확정',
    steps: [18, 19, 20],
    transitionQuestion: null,
  },
} as const;

export const STEP_CONFIG: Record<
  number,
  {
    phase: Phase;
    name: string;
    rfpMapping: string;
    questionType: 'text_input' | 'single_select' | 'multi_select' | 'multi_select_with_status';
    allowCustomInput?: boolean;
    maxValidationAttempts?: number;
  }
> = {
  1: {
    phase: 'seed',
    name: '서비스 정의',
    rfpMapping: '1.1.1',
    questionType: 'text_input',
    maxValidationAttempts: 2,
  },
  2: {
    phase: 'seed',
    name: '타겟 정의',
    rfpMapping: '1.2.1',
    questionType: 'single_select',
    allowCustomInput: true,
  },
  3: {
    phase: 'seed',
    name: '동작 도출',
    rfpMapping: '1.3.1,1.3.2,1.3.3',
    questionType: 'multi_select_with_status',
    allowCustomInput: true,
  },
  4: {
    phase: 'seed',
    name: '핵심 동작 선정',
    rfpMapping: '1.3.1',
    questionType: 'single_select',
  },
  5: {
    phase: 'seed',
    name: '가치 제안',
    rfpMapping: '1.1.2',
    questionType: 'text_input',
    maxValidationAttempts: 3,
  },
  6: {
    phase: 'seed',
    name: '실행 환경',
    rfpMapping: '1.5.1',
    questionType: 'single_select',
  },
  7: {
    phase: 'sprout',
    name: '경쟁 서비스',
    rfpMapping: '1.1.3',
    questionType: 'single_select',
    allowCustomInput: true,
  },
  8: {
    phase: 'sprout',
    name: '차별점',
    rfpMapping: '1.1.3',
    questionType: 'single_select',
    allowCustomInput: true,
  },
  9: {
    phase: 'sprout',
    name: '최종 목표',
    rfpMapping: '1.2.2',
    questionType: 'text_input',
  },
  10: {
    phase: 'sprout',
    name: '수익 모델',
    rfpMapping: '1.4.1',
    questionType: 'single_select',
    allowCustomInput: true,
  },
  11: {
    phase: 'tree',
    name: '유입 채널',
    rfpMapping: '1.1.4',
    questionType: 'multi_select',
    allowCustomInput: true,
  },
  12: {
    phase: 'tree',
    name: '성공 지표',
    rfpMapping: '1.6.1',
    questionType: 'single_select',
    allowCustomInput: true,
  },
  13: {
    phase: 'tree',
    name: 'MVP 가설',
    rfpMapping: '1.6.2',
    questionType: 'single_select',
    allowCustomInput: true,
  },
  14: {
    phase: 'tree',
    name: '외부 연동',
    rfpMapping: '1.5.2',
    questionType: 'multi_select',
    allowCustomInput: true,
  },
  15: {
    phase: 'tree',
    name: '초기 데이터',
    rfpMapping: '1.5.4',
    questionType: 'single_select',
    allowCustomInput: true,
  },
  16: {
    phase: 'tree',
    name: '운영 비용',
    rfpMapping: '1.4.2',
    questionType: 'multi_select',
    allowCustomInput: true,
  },
  17: {
    phase: 'tree',
    name: '규제 제약',
    rfpMapping: '1.5.3',
    questionType: 'single_select',
    allowCustomInput: true,
  },
  18: {
    phase: 'final',
    name: '비정형 맥락',
    rfpMapping: '*',
    questionType: 'text_input',
  },
  19: {
    phase: 'final',
    name: 'Gap Detection',
    rfpMapping: '*',
    questionType: 'multi_select',
  },
  20: {
    phase: 'final',
    name: '최종 확정',
    rfpMapping: '*',
    questionType: 'single_select',
  },
} as const;

export const TOTAL_STEPS = 20;

export const getPhaseForStep = (step: number): Phase => {
  return STEP_CONFIG[step]?.phase ?? 'seed';
};

export const getStepsForPhase = (phase: Phase): readonly number[] => {
  return PHASE_CONFIG[phase]?.steps ?? [];
};

export const getNextPhase = (currentPhase: Phase): Phase | null => {
  const phases: Phase[] = ['seed', 'sprout', 'tree', 'final'];
  const currentIndex = phases.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === phases.length - 1) {
    return null;
  }
  return phases[currentIndex + 1];
};

export const isPhaseTransitionStep = (step: number): boolean => {
  return step === 6 || step === 10 || step === 17;
};
