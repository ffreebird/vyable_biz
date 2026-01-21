# Vyable - Claude Code Context

> 이 파일은 Claude Code가 프로젝트 컨텍스트를 이해하기 위해 자동으로 읽습니다.

## 프로젝트 개요

**Vyable**은 AI 기반 제품 개발 도구 모음입니다.

### Vyable Biz (projects/biz)
비개발자의 아이디어를 AI 코딩 에이전트가 이해할 수 있는 구조화된 RFP로 변환

### Vyable PM (projects/pm) - 예정
RFP 기반 디자인 스프린트 도구

---

## 프로젝트 구조

```
vyable/
├── packages/
│   └── core/              # @vyable/core - AI 클라이언트 (Gemini, Claude)
├── projects/
│   ├── biz/               # RFP 생성
│   │   ├── packages/
│   │   │   ├── api/       # @vyable/api - Hono + Drizzle
│   │   │   ├── web/       # @vyable/web - React + Vite + Tailwind
│   │   │   └── shared/    # @vyable/shared - Types + Zod Schemas
│   │   ├── docs/          # biz 전용 문서
│   │   └── .agents/rules/ # biz 코딩 규칙
│   └── pm/                # 디자인 스프린트 (예정)
└── README.md
```

---

## Biz: 필수 참조 문서

**모든 biz 관련 작업 시 반드시 아래 문서를 참조:**

1. **인터뷰 로직 명세**: `projects/biz/docs/process/Interview_Process_Log.md`
2. **RFP 출력 스키마**: `projects/biz/docs/templates/RFP_Schema.md`
3. **PRD**: `projects/biz/docs/PRD.md`
4. **기술 스택**: `projects/biz/docs/Tech_Stack.md`

---

## 개발 명령어

```bash
# Biz 개발
bun run dev:biz          # 전체 실행
bun run dev:biz:api      # API만
bun run dev:biz:web      # Web만

# DB 마이그레이션
bun run db:biz:generate
bun run db:biz:migrate

# 공통
bun run typecheck        # 타입 체크
bun run lint             # 린트 체크
bun run format           # 코드 포맷팅
```

---

## AI 엔진 분담

| 역할 | 모델 |
|------|------|
| 인터뷰 진행, 답변 검증, Gap Detection | **Gemini 3 Flash** |
| RFP/Recipe 생성 | **Claude Opus 4.5** |

AI 클라이언트는 `@vyable/core` 패키지에서 공유.

---

## Biz: 핵심 원칙

> **"질문의 목적은 정보 수집이 아니라 사고 촉발이다"**

1. 사용자 결정만 묻는다
2. Yes/No가 아닌 선택을 준다
3. 먼저 제안하고 선택받는다
4. 놓친 관점을 드러낸다
5. AI가 채운 건 확정 안 함
6. 미정을 존중한다

---

## 응답 상태

| 상태 | 의미 |
|------|------|
| `confirmed` | 사용자가 명확히 답변 |
| `inferred` | AI가 맥락에서 유추 |
| `pending` | 의도적으로 보류 |
| `missing` | 질문하지 않아 정보 없음 |
