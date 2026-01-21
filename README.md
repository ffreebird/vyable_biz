# Vyable

AI 기반 제품 개발 도구 모음

## Projects

### Vyable Biz (projects/biz)
AI Agent를 위한 완벽한 지시서(RFP) 생성기

비개발자도 대화형 인터뷰를 통해 AI가 이해할 수 있는 프로젝트 정의서를 쉽게 만들 수 있습니다.

- **대화형 인터뷰**: AI가 질문하고, 사용자는 답하기만 하면 됩니다
- **4-Phase 시스템**: Seed → Sprout → Tree → Final
- **20-Step 구조화 질문**: 체계적인 질문으로 빠짐없이 정보 수집
- **자동 RFP 생성**: 답변을 바탕으로 AI Agent가 이해할 수 있는 문서 자동 생성

### Vyable PM (projects/pm) - Coming Soon
RFP 기반 디자인 스프린트 도구

## Tech Stack

| 영역 | 기술 |
|------|------|
| Runtime | Bun |
| Monorepo | Bun Workspaces |
| API | Hono + Drizzle ORM + SQLite |
| Web | React 19 + Vite 6 + Tailwind CSS 4 |
| Shared | TypeScript + Zod |
| Lint/Format | Biome |
| AI | Gemini 3 Flash (인터뷰) + Claude Opus 4.5 (RFP 생성) |

## Project Structure

```
vyable/
├── packages/
│   └── core/               # 공유 AI 클라이언트
├── projects/
│   ├── biz/                # RFP 생성
│   │   ├── packages/
│   │   │   ├── api/        # Hono 백엔드
│   │   │   ├── web/        # React 프론트엔드
│   │   │   └── shared/     # biz 전용 타입/스키마
│   │   └── docs/           # biz 문서
│   └── pm/                 # 디자인 스프린트 (예정)
└── README.md
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0+

### Installation

```bash
# 의존성 설치
bun install

# 데이터베이스 마이그레이션 (biz)
bun run db:biz:generate
bun run db:biz:migrate
```

### Environment Variables

`.env.example`을 `.env`로 복사하고 API 키를 설정하세요:

```bash
cp .env.example .env
```

```env
# AI API Keys
GOOGLE_AI_API_KEY=your_vertex_ai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Development

```bash
# Biz 전체 실행
bun run dev:biz

# Biz API만 실행 (localhost:3001)
bun run dev:biz:api

# Biz Web만 실행 (localhost:5173)
bun run dev:biz:web
```

### Scripts

```bash
bun run typecheck    # 타입 체크
bun run lint         # 린트 체크
bun run format       # 코드 포맷팅
```

## Biz: Interview Phases

| Phase | Steps | 목적 |
|-------|-------|------|
| Seed | 1-6 | 제품 정의 (핵심 아이디어, 사용자, 기능) |
| Sprout | 7-10 | 시장 검증 (경쟁사, 차별점, 수익모델) |
| Tree | 11-17 | 사업 운영 (유입채널, 지표, MVP, 비용) |
| Final | 18-20 | 마무리 (추가정보, 검증, 확정) |

## Biz: API Endpoints

### Projects
- `GET /api/projects` - 프로젝트 목록
- `POST /api/projects` - 프로젝트 생성
- `GET /api/projects/:id` - 프로젝트 상세
- `DELETE /api/projects/:id` - 프로젝트 삭제

### Interview
- `GET /api/projects/:id/interview` - 인터뷰 상태
- `POST /api/projects/:id/interview/next` - 다음 질문
- `POST /api/projects/:id/interview/answer` - 답변 제출
- `POST /api/projects/:id/interview/transition` - 단계 전환

### RFP
- `GET /api/projects/:id/rfp` - RFP 조회
- `POST /api/projects/:id/rfp/generate` - RFP 생성
- `GET /api/projects/:id/rfp/preview` - RFP 미리보기

## License

MIT
