# Shared Layer Rules (@vyable/shared)

> 공유 모듈 레이어 코딩 규칙

---

## 1. 역할

`@vyable/shared`는 API와 Web 패키지 간 공유되는 코드를 관리합니다:

- **타입 정의** (TypeScript)
- **스키마 검증** (Zod)
- **상수** (Constants)
- **유틸리티** (Utilities)

---

## 2. 폴더 구조

```
packages/shared/
├── src/
│   ├── index.ts              # 메인 export
│   ├── types/                # 타입 정의
│   │   ├── project.ts
│   │   ├── interview.ts
│   │   ├── rfp.ts
│   │   └── index.ts
│   ├── schemas/              # Zod 스키마
│   │   ├── project.ts
│   │   ├── interview.ts
│   │   ├── rfp.ts
│   │   └── index.ts
│   ├── constants/            # 상수
│   │   ├── interview-steps.ts
│   │   ├── rfp-sections.ts
│   │   └── index.ts
│   └── utils/                # 유틸리티
│       ├── validation.ts
│       └── index.ts
├── tsconfig.json
└── package.json
```

---

## 3. 타입 정의 규칙

### 3.1 기본 타입

```typescript
// types/project.ts

export type ProjectStatus = 'draft' | 'interviewing' | 'completed';
export type Phase = 'seed' | 'sprout' | 'tree' | 'final';
export type AnswerState = 'confirmed' | 'inferred' | 'pending' | 'missing';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  currentPhase: Phase;
  currentStep: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 API 요청/응답 타입

```typescript
// types/interview.ts

// 요청 타입: Create, Update 접두사
export interface CreateProjectRequest {
  name: string;
}

export interface SubmitAnswerRequest {
  stepNumber: number;
  answer: string | string[];
  customInput?: string;
}

// 응답 타입: Response 접미사
export interface QuestionResponse {
  step: number;
  phase: Phase;
  question: string;
  type: QuestionType;
  options?: Option[];
  rfpMapping: string;
}

export interface ValidationResponse {
  valid: boolean;
  reason?: string;
  inquiry?: {
    question: string;
    attempt: number;
    maxAttempts: number;
  };
}
```

### 3.3 도메인 타입

```typescript
// types/interview.ts

export type QuestionType =
  | 'text_input'
  | 'single_select'
  | 'multi_select'
  | 'multi_select_with_status';

export interface Option {
  id: string;
  label: string;
  hint?: string;
  status?: 'required' | 'later' | 'excluded' | 'pending';
}

export interface InterviewStep {
  id: string;
  projectId: string;
  stepNumber: number;
  phase: Phase;
  question: string;
  answer: string | string[] | null;
  answerState: AnswerState;
  options: Option[] | null;
  rfpMapping: string;
  createdAt: Date;
}
```

---

## 4. Zod 스키마 규칙

### 4.1 스키마 정의

```typescript
// schemas/project.ts
import { z } from 'zod';

// 기본 스키마
export const ProjectStatusSchema = z.enum(['draft', 'interviewing', 'completed']);
export const PhaseSchema = z.enum(['seed', 'sprout', 'tree', 'final']);
export const AnswerStateSchema = z.enum(['confirmed', 'inferred', 'pending', 'missing']);

// 엔티티 스키마
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  status: ProjectStatusSchema,
  currentPhase: PhaseSchema,
  currentStep: z.number().int().min(1).max(20),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// 요청 스키마
export const CreateProjectSchema = z.object({
  name: z.string().min(1, '프로젝트 이름을 입력해주세요').max(100),
});
```

### 4.2 타입 추론

```typescript
// 스키마에서 타입 추론
export type Project = z.infer<typeof ProjectSchema>;
export type CreateProjectRequest = z.infer<typeof CreateProjectSchema>;
```

### 4.3 인터뷰 스키마

```typescript
// schemas/interview.ts
import { z } from 'zod';
import { PhaseSchema, AnswerStateSchema } from './project';

export const QuestionTypeSchema = z.enum([
  'text_input',
  'single_select',
  'multi_select',
  'multi_select_with_status',
]);

export const OptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  hint: z.string().optional(),
  status: z.enum(['required', 'later', 'excluded', 'pending']).optional(),
});

export const QuestionResponseSchema = z.object({
  step: z.number().int().min(1).max(20),
  phase: PhaseSchema,
  question: z.string(),
  type: QuestionTypeSchema,
  options: z.array(OptionSchema).optional(),
  allowCustomInput: z.boolean().optional(),
  rfpMapping: z.string(),
});

export const SubmitAnswerSchema = z.object({
  stepNumber: z.number().int().min(1).max(20),
  answer: z.union([z.string(), z.array(z.string())]),
  customInput: z.string().optional(),
});

export const ValidationResponseSchema = z.object({
  valid: z.boolean(),
  reason: z.string().optional(),
  inquiry: z.object({
    question: z.string(),
    attempt: z.number(),
    maxAttempts: z.number(),
  }).optional(),
});
```

---

## 5. 상수 규칙

### 5.1 인터뷰 단계 상수

```typescript
// constants/interview-steps.ts

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
    transitionQuestion: null, // 자동으로 Final 진행
  },
  final: {
    name: 'Final',
    label: '마무리',
    description: '정리 및 확정',
    steps: [18, 19, 20],
    transitionQuestion: null,
  },
} as const;

export const STEP_CONFIG = {
  1: { phase: 'seed', name: '서비스 정의', rfpMapping: '1.1.1' },
  2: { phase: 'seed', name: '타겟 정의', rfpMapping: '1.2.1' },
  3: { phase: 'seed', name: '동작 도출', rfpMapping: '1.3.1,1.3.2,1.3.3' },
  4: { phase: 'seed', name: '핵심 동작 선정', rfpMapping: '1.3.1' },
  5: { phase: 'seed', name: '가치 제안', rfpMapping: '1.1.2' },
  6: { phase: 'seed', name: '실행 환경', rfpMapping: '1.5.1' },
  7: { phase: 'sprout', name: '경쟁 서비스', rfpMapping: '1.1.3' },
  8: { phase: 'sprout', name: '차별점', rfpMapping: '1.1.3' },
  9: { phase: 'sprout', name: '최종 목표', rfpMapping: '1.2.2' },
  10: { phase: 'sprout', name: '수익 모델', rfpMapping: '1.4.1' },
  11: { phase: 'tree', name: '유입 채널', rfpMapping: '1.1.4' },
  12: { phase: 'tree', name: '성공 지표', rfpMapping: '1.6.1' },
  13: { phase: 'tree', name: 'MVP 가설', rfpMapping: '1.6.2' },
  14: { phase: 'tree', name: '외부 연동', rfpMapping: '1.5.2' },
  15: { phase: 'tree', name: '초기 데이터', rfpMapping: '1.5.4' },
  16: { phase: 'tree', name: '운영 비용', rfpMapping: '1.4.2' },
  17: { phase: 'tree', name: '규제 제약', rfpMapping: '1.5.3' },
  18: { phase: 'final', name: '비정형 맥락', rfpMapping: '*' },
  19: { phase: 'final', name: 'Gap Detection', rfpMapping: '*' },
  20: { phase: 'final', name: '최종 확정', rfpMapping: '*' },
} as const;
```

### 5.2 RFP 섹션 상수

```typescript
// constants/rfp-sections.ts

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
```

---

## 6. Export 규칙

### 6.1 배럴 파일

```typescript
// types/index.ts
export * from './project';
export * from './interview';
export * from './rfp';

// schemas/index.ts
export * from './project';
export * from './interview';
export * from './rfp';

// constants/index.ts
export * from './interview-steps';
export * from './rfp-sections';
```

### 6.2 메인 Export

```typescript
// src/index.ts
export * from './types';
export * from './schemas';
export * from './constants';
export * from './utils';
```

---

## 7. 버전 관리

### 7.1 Breaking Change 주의

공유 모듈 변경 시 API와 Web 모두 영향받으므로:

1. 타입 변경 전 영향 범위 파악
2. 하위 호환성 유지 (가능한 경우)
3. Breaking change 시 명확히 문서화

### 7.2 변경 체크리스트

```
[ ] 타입 변경이 API에 미치는 영향 확인
[ ] 타입 변경이 Web에 미치는 영향 확인
[ ] 스키마 검증 테스트 통과
[ ] 양쪽 패키지 타입 체크 통과
```
