# Vyable Biz - 기술 스택 (MVP)

> RFP 인터뷰 엔진 구현에 필요한 핵심 기술만 정리
> **현재 단계: 로컬 개발/테스트 (배포 X)**

---

## 1. 프로젝트 구조

```
vyable-biz/
├── packages/
│   ├── api/        # 백엔드 API
│   ├── web/        # 프론트엔드
│   └── shared/     # 공유 타입/스키마
├── data/           # 로컬 SQLite 파일
└── docs/
```

---

## 2. 핵심 기술 스택

### 런타임 & 패키지 관리

| 기술 | 용도 |
|------|------|
| **Bun** | 런타임 + 패키지 매니저 + Workspaces |

### 백엔드 (@vyable/api)

| 기술 | 용도 | 비고 |
|------|------|------|
| **Bun** | 서버 런타임 | (배포 시 → Cloudflare Workers) |
| **Hono** | 경량 웹 프레임워크 | 그대로 유지 |
| **SQLite** | 로컬 데이터베이스 | (배포 시 → Cloudflare D1) |
| **Drizzle ORM** | 타입 안전 ORM | 그대로 유지 |
| **better-sqlite3** | SQLite 드라이버 | (배포 시 → D1 드라이버) |

### 프론트엔드 (@vyable/web)

| 기술 | 용도 |
|------|------|
| **React 19** | UI 라이브러리 |
| **Vite** | 빌드 + 개발 서버 |
| **Tailwind CSS 4** | 스타일링 |
| **React Router** | 라우팅 |

### 공유 모듈 (@vyable/shared)

| 기술 | 용도 |
|------|------|
| **TypeScript** | 타입 시스템 |
| **Zod** | 스키마 검증 |

### AI 엔진

| 모델 | 용도 |
|------|------|
| **Gemini 3.0 Flash** | 인터뷰 진행, 답변 검증, Gap Detection |
| **Claude Opus 4.5** | RFP/Recipe 최종 생성 |

### 개발 도구

| 기술 | 용도 |
|------|------|
| **Biome** | 린트 + 포맷팅 |

---

## 3. 로컬 vs 배포 비교

| 영역 | 로컬 (현재) | 배포 (추후) |
|------|-------------|-------------|
| API 런타임 | Bun | Cloudflare Workers |
| 데이터베이스 | SQLite (파일) | Cloudflare D1 |
| 웹 호스팅 | Vite dev server | Cloudflare Pages |
| DB 드라이버 | better-sqlite3 | D1 driver |

> Hono + Drizzle은 두 환경 모두 호환되므로 코드 변경 최소화

---

## 4. 주요 패키지

```json
// packages/api/package.json
{
  "dependencies": {
    "hono": "^4.x",
    "drizzle-orm": "^0.x",
    "better-sqlite3": "^11.x",
    "@google/generative-ai": "^0.x",
    "@anthropic-ai/sdk": "^0.x"
  },
  "devDependencies": {
    "drizzle-kit": "^0.x"
  }
}

// packages/web/package.json
{
  "dependencies": {
    "react": "^19.x",
    "react-dom": "^19.x",
    "react-router-dom": "^7.x"
  },
  "devDependencies": {
    "vite": "^6.x",
    "tailwindcss": "^4.x",
    "@vitejs/plugin-react": "^4.x"
  }
}

// packages/shared/package.json
{
  "dependencies": {
    "zod": "^3.x"
  }
}
```

---

## 5. 환경 변수

```env
# .env.local

# API Keys
GEMINI_API_KEY=
ANTHROPIC_API_KEY=

# Database (로컬)
DATABASE_URL=file:./data/vyable.db

# Server
API_PORT=3001
WEB_PORT=5173
```

---

## 6. 개발 명령어

```bash
# 설치
bun install

# DB 마이그레이션
bun run db:generate   # 스키마 → SQL 생성
bun run db:migrate    # 마이그레이션 실행

# 개발 서버
bun dev           # 전체 (API + Web)
bun dev:api       # API만 (localhost:3001)
bun dev:web       # Web만 (localhost:5173)

# 테스트
bun test

# 린트
bun run lint
```

---

## 7. 로컬 개발 아키텍처

```
┌─────────────────┐     ┌─────────────────┐
│   Web (Vite)    │────▶│   API (Bun)     │
│  localhost:5173 │     │  localhost:3001 │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼─────┐           ┌───────▼───────┐
              │  SQLite   │           │   AI APIs     │
              │ (로컬 파일)│           │ Gemini/Claude │
              └───────────┘           └───────────────┘
```
