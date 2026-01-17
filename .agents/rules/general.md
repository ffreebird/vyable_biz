# General Development Rules

> 모든 레이어에 적용되는 일반 개발 규칙

---

## 1. 개발 프로세스

### 1.1 PRD 기반 개발

```
[요구사항 분석] → [PRD 작성] → [승인] → [구현]
```

- 기능 구현 전 반드시 PRD 제안
- PRD에 포함할 내용:
  - 구현 목표
  - 유저 스토리
  - 기술적 제약
  - 상세 설계
  - 영향 범위

### 1.2 PPP (Pseudocode Programming Process)

```
[계획] → [의사코드] → [검토] → [실제 코드]
```

1. **계획**: 무엇을 구현할지 명확히 정의
2. **의사코드**: 논리 구조를 자연어/의사코드로 작성
3. **검토**: 의사코드 검토 및 승인
4. **실제 코드**: 승인된 구조대로 구현

### 1.3 작업 완료 체크리스트

```bash
# 모든 작업 완료 후 실행
bun run lint        # 린트
bun run typecheck   # 타입 체크
bun test            # 테스트
```

---

## 2. 코드 스타일

### 2.1 파일 명명 규칙

```
# 컴포넌트/클래스: PascalCase
InterviewEngine.ts
ProjectCard.tsx

# 유틸리티/함수: camelCase
formatDate.ts
validateAnswer.ts

# 상수/설정: kebab-case 또는 SCREAMING_SNAKE_CASE
api-routes.ts
INTERVIEW_STEPS.ts

# 테스트: *.test.ts
InterviewEngine.test.ts
```

### 2.2 폴더 구조

```
src/
├── components/     # UI 컴포넌트
├── services/       # 비즈니스 로직
├── utils/          # 유틸리티 함수
├── types/          # 타입 정의
├── constants/      # 상수
└── __tests__/      # 테스트
```

### 2.3 Import 순서

```typescript
// 1. 외부 패키지
import { z } from 'zod';
import { Hono } from 'hono';

// 2. 내부 패키지 (@vyable/*)
import { ProjectSchema } from '@vyable/shared';

// 3. 상대 경로 (먼 거리부터)
import { db } from '../../db';
import { validateAnswer } from '../utils';
import { InterviewStep } from './types';
```

---

## 3. Type-Safe First

### 3.1 타입 정의 필수

```typescript
// ❌ Bad: any 사용
function processData(data: any) { ... }

// ✅ Good: 명시적 타입
function processData(data: InterviewStep) { ... }
```

### 3.2 Zod 스키마 활용

```typescript
// 스키마 정의
const AnswerSchema = z.object({
  stepNumber: z.number(),
  answer: z.string(),
});

// 타입 추론
type Answer = z.infer<typeof AnswerSchema>;

// 런타임 검증
const validated = AnswerSchema.parse(input);
```

### 3.3 공유 타입은 @vyable/shared에서

```typescript
// ❌ Bad: 로컬 타입 중복 정의
interface Project { ... }

// ✅ Good: 공유 타입 import
import { Project } from '@vyable/shared';
```

---

## 4. 에러 처리

### 4.1 명시적 에러 타입

```typescript
// 커스텀 에러 클래스
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### 4.2 에러 응답 형식

```typescript
// API 에러 응답
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "서비스 정의가 너무 추상적입니다",
    "field": "answer",
    "details": { ... }
  }
}
```

---

## 5. 필수 참조 문서

**구현 시 반드시 확인:**

1. `docs/process/Interview_Process_Log.md` - 인터뷰 로직
2. `docs/templates/RFP_Schema.md` - RFP 스키마
3. `docs/PRD.md` - 전체 기능 명세

---

## 6. Git 커밋 규칙

### 6.1 커밋 메시지 형식

```
<type>(<scope>): <description>

[optional body]
```

### 6.2 Type 종류

- `feat`: 새 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `docs`: 문서
- `test`: 테스트
- `chore`: 빌드/설정

### 6.3 예시

```
feat(interview): Step 1~6 인터뷰 로직 구현

- 서비스 정의 검증 로직 추가
- 타겟 정의 옵션 처리
- Phase 전환 체크 구현
```
