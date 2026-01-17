export const RFP_SECTIONS = {
  '1.1': { name: '문제 정의', subsections: ['1.1.1', '1.1.2', '1.1.3', '1.1.4'] },
  '1.2': { name: '사용자 정의', subsections: ['1.2.1', '1.2.2'] },
  '1.3': { name: '기능 범위', subsections: ['1.3.1', '1.3.2', '1.3.3'] },
  '1.4': { name: '수익/비용 구조', subsections: ['1.4.1', '1.4.2'] },
  '1.5': { name: '기술 제약', subsections: ['1.5.1', '1.5.2', '1.5.3', '1.5.4'] },
  '1.6': { name: '성공 정의', subsections: ['1.6.1', '1.6.2'] },
  '1.7': { name: '용어 정의', subsections: [] },
  '1.8': { name: '핵심 시나리오', subsections: [] },
  '1.9': { name: '결정 보류', subsections: [] },
  '1.10': { name: '브랜딩', subsections: [] },
} as const;

export const SECTION_NAMES = {
  '1.1.1': '해결하려는 문제',
  '1.1.2': '기존 해결책과 한계',
  '1.1.3': '경쟁/대체재 분석',
  '1.1.4': '유입 채널',
  '1.2.1': '사용자 유형',
  '1.2.2': '사용자별 핵심 목표',
  '1.3.1': '핵심 기능 (Must)',
  '1.3.2': '부가 기능 (Nice to have)',
  '1.3.3': '제외 기능 (Out of scope)',
  '1.4.1': '수익 모델',
  '1.4.2': '운영 비용',
  '1.5.1': '플랫폼 결정',
  '1.5.2': '외부 의존성',
  '1.5.3': '규제 제약',
  '1.5.4': '데이터 제약',
  '1.6.1': '핵심 지표',
  '1.6.2': 'MVP 검증 가설',
  '1.7': '용어 정의',
  '1.8': '핵심 시나리오 개요',
  '1.9': '결정 보류 항목',
  '1.10': '브랜딩',
} as const;

export const COMPLETION_THRESHOLDS = {
  high: 80,
  medium: 50,
  low: 30,
} as const;

export const MINIMUM_COMPLETION_REQUIREMENTS = [
  '1.1.1', // 서비스 정의
  '1.2.1', // 타겟
  '1.3.1', // 핵심 기능 1개 이상
] as const;

export const GAP_PRIORITY = {
  P0: {
    label: '필수',
    description: 'MVP 구현에 필수',
    maxQuestions: 5,
  },
  P1: {
    label: '권장',
    description: '있으면 좋음',
    maxQuestions: 3,
  },
  P2: {
    label: '선택',
    description: '나중에 정해도 됨',
    maxQuestions: 0,
  },
} as const;

export const P0_PRIORITY_ORDER = ['1.3.1', '1.4.1', '1.5.2', '1.5.1', '1.2.1'] as const;
