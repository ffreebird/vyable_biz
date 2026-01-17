# API Layer Rules (@vyable/api)

> 백엔드 API 레이어 코딩 규칙

---

## 1. 기술 스택

```
런타임: Bun
프레임워크: Hono
ORM: Drizzle
DB: SQLite (로컬) / D1 (배포)
AI: Gemini 3.0 Flash + Claude Opus 4.5
```

---

## 2. 폴더 구조

```
packages/api/
├── src/
│   ├── index.ts              # 엔트리포인트
│   ├── app.ts                # Hono 앱 설정
│   ├── routes/               # API 라우트
│   │   ├── projects.ts
│   │   ├── interview.ts
│   │   └── rfp.ts
│   ├── services/             # 비즈니스 로직
│   │   ├── interview-engine.ts
│   │   ├── rfp-generator.ts
│   │   └── ai/
│   │       ├── gemini.ts
│   │       └── claude.ts
│   ├── db/                   # 데이터베이스
│   │   ├── schema.ts         # Drizzle 스키마
│   │   ├── index.ts          # DB 연결
│   │   └── migrations/
│   ├── middleware/           # 미들웨어
│   └── utils/                # 유틸리티
├── drizzle.config.ts
└── package.json
```

---

## 3. Hono 라우트 규칙

### 3.1 라우트 정의

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { CreateProjectSchema } from '@vyable/shared';

const projects = new Hono();

// 스키마 검증과 함께 라우트 정의
projects.post(
  '/',
  zValidator('json', CreateProjectSchema),
  async (c) => {
    const data = c.req.valid('json');
    // ...
    return c.json(result, 201);
  }
);

export default projects;
```

### 3.2 응답 형식 통일

```typescript
// 성공 응답
return c.json({
  data: result,
  meta: { ... }
}, 200);

// 에러 응답
return c.json({
  error: {
    code: 'VALIDATION_ERROR',
    message: '...',
  }
}, 400);
```

### 3.3 라우트 그룹화

```typescript
// src/app.ts
import { Hono } from 'hono';
import projects from './routes/projects';
import interview from './routes/interview';
import rfp from './routes/rfp';

const app = new Hono();

app.route('/api/projects', projects);
app.route('/api/projects/:projectId/interview', interview);
app.route('/api/projects/:projectId/rfp', rfp);

export default app;
```

---

## 4. Drizzle ORM 규칙

### 4.1 스키마 정의

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status', { enum: ['draft', 'interviewing', 'completed'] }).notNull(),
  currentPhase: text('current_phase', { enum: ['seed', 'sprout', 'tree', 'final'] }).notNull(),
  currentStep: integer('current_step').notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
```

### 4.2 쿼리 패턴

```typescript
import { db } from '../db';
import { projects } from '../db/schema';
import { eq } from 'drizzle-orm';

// SELECT
const project = await db.select().from(projects).where(eq(projects.id, id)).get();

// INSERT
const newProject = await db.insert(projects).values({ ... }).returning().get();

// UPDATE
await db.update(projects).set({ status: 'completed' }).where(eq(projects.id, id));
```

---

## 5. AI 서비스 규칙

### 5.1 AI Provider 추상화

```typescript
// src/services/ai/types.ts
export interface AIProvider {
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
}

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
}
```

### 5.2 모델 분담

```typescript
// Gemini Flash: 인터뷰, 검증, Gap Detection
import { gemini } from './ai/gemini';
const question = await gemini.generate(interviewPrompt);

// Claude Opus: RFP 생성
import { claude } from './ai/claude';
const rfp = await claude.generate(rfpPrompt, { maxTokens: 8192 });
```

### 5.3 프롬프트 관리

```typescript
// src/services/ai/prompts/interview.ts
export const INTERVIEW_SYSTEM_PROMPT = `
당신은 Vyable Biz의 소크라테스 인터뷰 진행자입니다.

## 핵심 원칙
1. 질문의 목적은 정보 수집이 아니라 사고 촉발
2. Yes/No가 아닌 선택지를 제공
...
`;

// src/services/ai/prompts/rfp.ts
export const RFP_GENERATION_PROMPT = `...`;
```

---

## 6. 인터뷰 엔진 규칙

### 6.1 필수 참조

**반드시 `docs/process/Interview_Process_Log.md` 참조**

### 6.2 Step 처리 구조

```typescript
interface InterviewEngine {
  // 다음 질문 생성
  generateNextQuestion(context: InterviewContext): Promise<Question>;

  // 답변 검증 (3-Step Validation)
  validateAnswer(step: number, answer: string, context: InterviewContext): Promise<ValidationResult>;

  // Phase 전환 체크
  checkPhaseTransition(currentPhase: Phase, currentStep: number): PhaseTransition | null;

  // Gap Detection
  detectGaps(rfpDraft: RFPDraft): Promise<Gap[]>;
}
```

### 6.3 응답 상태 처리

```typescript
type AnswerState = 'confirmed' | 'inferred' | 'pending' | 'missing';

// 상태별 처리
switch (answerState) {
  case 'confirmed':
    // 그대로 RFP에 반영
    break;
  case 'inferred':
    // [추론] 태그 유지, 검증 필요
    break;
  case 'pending':
    // RFP 1.9에 기록
    break;
  case 'missing':
    // Gap filling에서 추가 질문
    break;
}
```

---

## 7. RFP 생성 규칙

### 7.1 필수 참조

**반드시 `docs/templates/RFP_Schema.md` 참조**

### 7.2 섹션 구조

```typescript
const RFP_SECTIONS = [
  '1.1.1', '1.1.2', '1.1.3', '1.1.4',  // 문제 정의
  '1.2.1', '1.2.2',                     // 사용자 정의
  '1.3.1', '1.3.2', '1.3.3',            // 기능 범위
  '1.4.1', '1.4.2',                     // 수익/비용
  '1.5.1', '1.5.2', '1.5.3', '1.5.4',  // 기술 제약
  '1.6.1', '1.6.2',                     // 성공 정의
  '1.7', '1.8', '1.9', '1.10',          // 용어, 시나리오, 보류, 브랜딩
] as const;
```

### 7.3 완성도 계산

```typescript
function calculateCompleteness(sections: RFPSection[]): number {
  const confirmed = sections.filter(s => s.state === 'confirmed').length;
  return Math.round((confirmed / sections.length) * 100);
}
```

---

## 8. 에러 코드

```typescript
const ERROR_CODES = {
  // 검증 에러
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_ANSWER: 'INVALID_ANSWER',

  // 인터뷰 에러
  STEP_NOT_FOUND: 'STEP_NOT_FOUND',
  PHASE_TRANSITION_REQUIRED: 'PHASE_TRANSITION_REQUIRED',

  // RFP 에러
  INCOMPLETE_INTERVIEW: 'INCOMPLETE_INTERVIEW',
  RFP_GENERATION_FAILED: 'RFP_GENERATION_FAILED',

  // AI 에러
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
} as const;
```
