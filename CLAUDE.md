# Vyable Biz - Claude Code Context

> 이 파일은 Claude Code가 프로젝트 컨텍스트를 이해하기 위해 자동으로 읽습니다.

## 프로젝트 개요

**Vyable Biz**는 비개발자의 아이디어를 AI 코딩 에이전트가 이해할 수 있는 구조화된 RFP(Request For Proposal)로 변환하는 서비스입니다.

- **슬로건**: "AI Agent를 위한 완벽한 지시서 생성기"
- **핵심 기능**: 소크라테스 인터뷰(4 Phase, 20 Step)를 통한 맥락 수집 및 RFP 생성

---

## 필수 참조 문서 (CRITICAL)

**모든 구현 작업 시 반드시 아래 문서를 정확히 참조해야 합니다:**

1. **인터뷰 로직 명세**: `docs/process/Interview_Process_Log.md`
   - 20단계 인터뷰 프로세스 상세 로직
   - Phase 전환 규칙
   - 질문/검증/응답 상태 처리 방식

2. **RFP 출력 스키마**: `docs/templates/RFP_Schema.md`
   - 10개 섹션 구조
   - 각 섹션별 확인 질문 및 확정 형식
   - RFP 완성 조건

3. **PRD**: `docs/PRD.md`
   - 전체 기능 명세
   - API 명세
   - 데이터 모델

4. **기술 스택**: `docs/Tech_Stack.md`
   - 로컬 개발 환경 구성
   - 패키지 및 버전

---

## 개발 프로세스 (엄격히 준수)

### 1. PRD 기반 개발

모든 작업은 요구사항 문서 작성부터 시작합니다:

```
1. 구현 목표 정의
2. 유저 스토리 작성
3. 기술적 제약 확인
4. 상세 설계 제안
5. 확답 후 구현 착수
```

### 2. PPP (Pseudocode Programming Process)

코드를 바로 작성하지 않습니다:

```
[계획] → [의사코드] → [검토] → [실제 코드]
```

1. 먼저 논리 구조를 의사코드로 설명
2. 검토 및 승인
3. 실제 구현

### 3. 모듈화 및 규칙 참조

코드 작성 시 반드시 `.agents/rules/` 폴더의 규칙을 참조합니다:

- `general.md` - 일반 개발 규칙
- `api.md` - API 레이어 규칙
- `web.md` - Web 레이어 규칙
- `shared.md` - Shared 레이어 규칙

### 4. Type-Safe First

- 모든 데이터 교환은 타입 정의 필수
- Zod 스키마로 런타임 검증
- `@vyable/shared`에서 타입 공유

### 5. 자동화 도구 실행

작업 완료 후 항상 실행:

```bash
bun run lint      # 린트 체크
bun run typecheck # 타입 체크
bun test          # 테스트 실행
```

---

## 프로젝트 구조

```
vyable-biz/
├── packages/
│   ├── api/           # @vyable/api - Hono + Drizzle
│   ├── web/           # @vyable/web - React + Vite + Tailwind
│   └── shared/        # @vyable/shared - Types + Zod Schemas
├── data/              # SQLite 파일 (로컬)
├── docs/              # 문서
│   ├── PRD.md
│   ├── Tech_Stack.md
│   ├── process/
│   │   └── Interview_Process_Log.md  # 인터뷰 로직 (필수 참조)
│   └── templates/
│       └── RFP_Schema.md             # RFP 스키마 (필수 참조)
├── .agents/rules/     # 코딩 규칙
└── .claude/           # Claude Code 설정
```

---

## AI 엔진 분담

| 역할 | 모델 |
|------|------|
| 인터뷰 진행, 답변 검증, Gap Detection | **Gemini 3.0 Flash** |
| RFP/Recipe 생성 | **Claude Opus 4.5** |

---

## 핵심 원칙

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
