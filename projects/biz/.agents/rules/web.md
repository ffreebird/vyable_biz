# Web Layer Rules (@vyable/web)

> 프론트엔드 레이어 코딩 규칙

---

## 1. 기술 스택

```
런타임: Bun
프레임워크: React 19
빌드: Vite 6
스타일: Tailwind CSS 4
라우팅: React Router 7
```

---

## 2. 폴더 구조

```
packages/web/
├── src/
│   ├── main.tsx              # 엔트리포인트
│   ├── App.tsx               # 루트 컴포넌트
│   ├── routes/               # 페이지 컴포넌트
│   │   ├── Landing.tsx
│   │   ├── Projects.tsx
│   │   ├── Interview.tsx
│   │   └── Preview.tsx
│   ├── components/           # 재사용 컴포넌트
│   │   ├── ui/               # 기본 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   ├── interview/        # 인터뷰 관련
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── OptionSelector.tsx
│   │   │   └── PhaseIndicator.tsx
│   │   └── rfp/              # RFP 관련
│   │       ├── RFPViewer.tsx
│   │       └── SectionCard.tsx
│   ├── hooks/                # 커스텀 훅
│   │   ├── useInterview.ts
│   │   ├── useProject.ts
│   │   └── useApi.ts
│   ├── services/             # API 호출
│   │   └── api.ts
│   ├── stores/               # 상태 관리 (필요시)
│   └── styles/               # 글로벌 스타일
│       └── globals.css
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 3. 컴포넌트 규칙

### 3.1 컴포넌트 구조

```tsx
// components/interview/QuestionCard.tsx
import { type FC } from 'react';

interface QuestionCardProps {
  question: string;
  hint?: string;
  children: React.ReactNode;
}

export const QuestionCard: FC<QuestionCardProps> = ({
  question,
  hint,
  children,
}) => {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{question}</h3>
      {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
};
```

### 3.2 Props 타입 정의

```tsx
// ✅ Good: interface로 Props 정의
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// ✅ Good: @vyable/shared 타입 활용
import { Project } from '@vyable/shared';

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
}
```

### 3.3 컴포넌트 분류

```
UI 컴포넌트 (components/ui/)
- 재사용 가능한 기본 컴포넌트
- 비즈니스 로직 없음
- 순수 프레젠테이션

Feature 컴포넌트 (components/interview/, components/rfp/)
- 특정 기능에 종속
- 비즈니스 로직 포함 가능
- 훅과 함께 사용
```

---

## 4. 커스텀 훅 규칙

### 4.1 API 훅

```typescript
// hooks/useInterview.ts
import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { Question, AnswerResponse } from '@vyable/shared';

export function useInterview(projectId: string) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNextQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.interview.getNext(projectId);
      setQuestion(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const submitAnswer = useCallback(async (answer: string) => {
    setLoading(true);
    try {
      const result = await api.interview.submitAnswer(projectId, {
        stepNumber: question?.step,
        answer,
      });
      return result;
    } finally {
      setLoading(false);
    }
  }, [projectId, question]);

  return {
    question,
    loading,
    error,
    fetchNextQuestion,
    submitAnswer,
  };
}
```

### 4.2 훅 네이밍

```
use + 명사/동사
- useProject
- useInterview
- useApi
- useFetch
```

---

## 5. 스타일 규칙

### 5.1 Tailwind CSS 사용

```tsx
// ✅ Good: Tailwind 유틸리티 클래스
<button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
  다음
</button>

// ❌ Bad: 인라인 스타일
<button style={{ backgroundColor: 'blue', padding: '8px 16px' }}>
  다음
</button>
```

### 5.2 조건부 스타일

```tsx
import { clsx } from 'clsx';

<button
  className={clsx(
    'rounded-lg px-4 py-2 transition-colors',
    variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
    variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    disabled && 'cursor-not-allowed opacity-50',
  )}
>
```

### 5.3 컴포넌트 스타일 그룹화

```tsx
// 관련 스타일을 논리적으로 그룹화
const styles = {
  container: 'flex flex-col gap-4 p-6',
  header: 'text-xl font-bold text-gray-900',
  content: 'text-gray-600',
  actions: 'flex justify-end gap-2 mt-4',
};
```

---

## 6. 라우팅 규칙

### 6.1 라우트 정의

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './routes/Landing';
import { Projects } from './routes/Projects';
import { Interview } from './routes/Interview';
import { Preview } from './routes/Preview';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId/interview" element={<Interview />} />
        <Route path="/projects/:projectId/preview" element={<Preview />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 6.2 URL 파라미터 사용

```tsx
import { useParams } from 'react-router-dom';

function Interview() {
  const { projectId } = useParams<{ projectId: string }>();
  // ...
}
```

---

## 7. API 호출 규칙

### 7.1 API 서비스

```typescript
// services/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export const api = {
  projects: {
    list: () => fetchJson<Project[]>('/api/projects'),
    create: (data: CreateProject) =>
      fetchJson<Project>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (id: string) => fetchJson<Project>(`/api/projects/${id}`),
    delete: (id: string) =>
      fetchJson(`/api/projects/${id}`, { method: 'DELETE' }),
  },
  interview: {
    getState: (projectId: string) =>
      fetchJson<InterviewState>(`/api/projects/${projectId}/interview`),
    getNext: (projectId: string) =>
      fetchJson<Question>(`/api/projects/${projectId}/interview/next`, {
        method: 'POST',
      }),
    submitAnswer: (projectId: string, data: SubmitAnswer) =>
      fetchJson<AnswerResponse>(`/api/projects/${projectId}/interview/answer`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  rfp: {
    get: (projectId: string) => fetchJson<RFP>(`/api/projects/${projectId}/rfp`),
    generate: (projectId: string) =>
      fetchJson<RFP>(`/api/projects/${projectId}/rfp/generate`, {
        method: 'POST',
      }),
  },
};
```

---

## 8. 인터뷰 UI 규칙

### 8.1 질문 타입별 렌더링

```tsx
function renderQuestion(question: Question) {
  switch (question.type) {
    case 'text_input':
      return <TextInput {...question} />;
    case 'single_select':
      return <SingleSelect options={question.options} />;
    case 'multi_select_with_status':
      return <MultiSelectWithStatus options={question.options} />;
    default:
      return null;
  }
}
```

### 8.2 Phase 표시

```tsx
const PHASE_LABELS = {
  seed: { name: 'Seed', label: '씨앗', color: 'green' },
  sprout: { name: 'Sprout', label: '새싹', color: 'yellow' },
  tree: { name: 'Tree', label: '나무', color: 'orange' },
  final: { name: 'Final', label: '마무리', color: 'blue' },
};
```

### 8.3 진행률 표시

```tsx
function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = (current / total) * 100;
  return (
    <div className="h-2 w-full rounded-full bg-gray-200">
      <div
        className="h-2 rounded-full bg-blue-600 transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
```

---

## 9. 상태 관리

### 9.1 로컬 상태 우선

```tsx
// 간단한 상태는 useState로
const [answer, setAnswer] = useState('');
const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
```

### 9.2 서버 상태는 훅으로

```tsx
// API 데이터는 커스텀 훅으로 관리
const { question, loading, submitAnswer } = useInterview(projectId);
```

### 9.3 전역 상태 (필요시)

```tsx
// 정말 필요한 경우에만 Context 사용
const ProjectContext = createContext<ProjectContextType | null>(null);
```
