import type { Option, ValidationResult } from '@vyable/shared';
import { PHASE_CONFIG, STEP_CONFIG, checkLogicalSeed, isLogicalSeedValid } from '@vyable/shared';
import type { InterviewStep, Project } from '../../db/schema';
import { generateWithGemini } from './gemini';

interface GeneratedQuestion {
  text: string;
  options?: Option[];
  hint?: string;
}

class InterviewEngine {
  async generateQuestion(
    stepNumber: number,
    project: Project,
    previousSteps: InterviewStep[]
  ): Promise<GeneratedQuestion> {
    const stepConfig = STEP_CONFIG[stepNumber];
    if (!stepConfig) {
      throw new Error(`Invalid step number: ${stepNumber}`);
    }

    const context = this.buildContext(previousSteps);

    const prompt = `
당신은 AI 비즈니스 컨설턴트입니다. 사용자가 만들고 싶은 서비스에 대해 인터뷰를 진행합니다.

## 핵심 원칙
- "질문의 목적은 정보 수집이 아니라 사고 촉발이다"
- 사용자 결정만 묻는다 (결정할 수 없는 것은 묻지 않는다)
- Yes/No가 아닌 선택을 준다
- 먼저 제안하고 선택받는다
- 놓친 관점을 드러낸다

## 현재 컨텍스트
프로젝트: ${project.name}
단계: ${stepNumber}번 - ${stepConfig.name}
Phase: ${PHASE_CONFIG[stepConfig.phase].label}

## 이전 답변
${context}

## 질문 생성 요청
${stepNumber}번 단계(${stepConfig.name})에 맞는 질문을 생성하세요.
질문 타입: ${stepConfig.questionType}

응답 형식 (JSON):
{
  "text": "질문 내용",
  "options": [{"id": "1", "label": "옵션1", "hint": "힌트"}], // single_select, multi_select인 경우
  "hint": "질문에 대한 보조 설명" // 선택사항
}
`;

    try {
      const response = await generateWithGemini(prompt);
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return this.getFallbackQuestion(stepNumber);
    }
  }

  async validateAnswer(
    stepNumber: number,
    answer: string | string[],
    attempts: number,
    project: Project
  ): Promise<ValidationResult> {
    const stepConfig = STEP_CONFIG[stepNumber];
    if (!stepConfig) {
      return { valid: false, reason: 'Invalid step number' };
    }

    if (stepNumber === 1) {
      return this.validateServiceDefinition(answer as string, attempts);
    }

    if (stepNumber === 5) {
      return this.validateValueProposition(answer as string, attempts, project);
    }

    return { valid: true };
  }

  private async validateServiceDefinition(
    answer: string,
    attempts: number
  ): Promise<ValidationResult> {
    if (!answer || answer.trim().length < 5) {
      return {
        valid: false,
        reason: '너무 짧은 답변입니다.',
        inquiry: {
          question: '조금 더 구체적으로 설명해주실 수 있나요?',
          attempt: attempts + 1,
          maxAttempts: 2,
        },
      };
    }

    const elements = checkLogicalSeed(answer);

    if (isLogicalSeedValid(elements)) {
      return { valid: true };
    }

    if (attempts >= 2) {
      return { valid: true };
    }

    const missing: string[] = [];
    if (!elements.target) missing.push('[누가]');
    if (!elements.action) missing.push('[무엇을]');
    if (!elements.value) missing.push('[왜/어떤 결과]');

    return {
      valid: false,
      reason: `${missing.join(', ')}에 대한 정보가 부족합니다.`,
      inquiry: {
        question: `${missing.join(', ')}에 대해 조금 더 알려주시겠어요? 예: "${elements.target ? '' : '누가 사용하고, '}${elements.action ? '' : '무엇을 하는 '}서비스인가요?"`,
        attempt: attempts + 1,
        maxAttempts: 2,
      },
    };
  }

  private async validateValueProposition(
    answer: string,
    attempts: number,
    _project: Project
  ): Promise<ValidationResult> {
    const priceKeywords = ['싸서', '무료', '저렴', '가격', '비용'];
    const isPriceBased = priceKeywords.some((keyword) => answer.includes(keyword));

    if (isPriceBased && attempts < 3) {
      const questions = [
        '가격 외에 다른 이유가 있을까요?',
        '가격이 싼 이유가 있나요? (예: 중간 유통 제거)',
      ];

      if (attempts < 2) {
        return {
          valid: false,
          reason: '가격 기반 가치 제안은 모방이 쉽습니다.',
          inquiry: {
            question: questions[attempts] || questions[0],
            attempt: attempts + 1,
            maxAttempts: 3,
          },
        };
      }
    }

    return { valid: true };
  }

  private buildContext(steps: InterviewStep[]): string {
    if (steps.length === 0) return '(아직 없음)';

    return steps
      .filter((s) => s.answer)
      .map((s) => {
        const config = STEP_CONFIG[s.stepNumber];
        return `- ${config?.name || s.stepNumber}: ${s.answer}`;
      })
      .join('\n');
  }

  private getFallbackQuestion(stepNumber: number): GeneratedQuestion {
    const fallbacks: Record<number, GeneratedQuestion> = {
      // Phase 1: Seed (제품 정의)
      1: {
        text: '어떤 서비스를 만들고 싶으신가요?',
        hint: '누가 사용하고, 무엇을 하는 서비스인지 알려주세요.',
      },
      2: {
        text: '이 서비스를 사용해야 하는 사람은 누구인가요?',
        options: [
          { id: 'single', label: '한 부류의 사람들이 각자 이용합니다', hint: '예: 메모앱 사용자' },
          {
            id: 'multi',
            label: '서로 다른 역할을 가진 사람들이 연결됩니다',
            hint: '예: 판매자-구매자',
          },
          { id: 'unknown', label: '잘 모르겠어요' },
        ],
      },
      3: {
        text: '이 서비스에서 어떤 동작들이 필요한가요?',
        hint: '각 기능에 대해 [필수/나중에/불필요/미정] 상태를 선택해주세요.',
        options: [
          { id: 'signup', label: '회원가입/로그인', status: 'required' },
          { id: 'profile', label: '프로필 관리', status: 'required' },
          { id: 'search', label: '검색', status: 'required' },
          { id: 'notification', label: '알림', status: 'later' },
          { id: 'settings', label: '설정', status: 'later' },
        ],
      },
      4: {
        text: '이 동작들 중 가장 핵심이 되는 하나는 무엇인가요?',
        hint: '이 기능이 없으면 서비스가 성립하지 않는 것을 선택하세요.',
      },
      5: {
        text: '고객들이 이 서비스를 이용해야 하는 이유는 무엇인가요?',
        hint: '가격 외의 이유를 생각해보세요. 고객이 얻는 결과에 초점을 맞춰주세요.',
      },
      6: {
        text: '이 서비스의 실행 환경은 어디인가요?',
        options: [
          { id: 'web', label: '웹 (PC/모바일 브라우저)' },
          { id: 'app', label: '모바일 앱 (iOS/Android)' },
          { id: 'both', label: '둘 다 (웹 + 앱)' },
          { id: 'undecided', label: '아직 정하지 않았어요' },
        ],
      },

      // Phase 2: Sprout (시장 검증)
      7: {
        text: '비슷한 서비스를 알고 계신가요?',
        hint: 'AI가 경쟁 서비스를 검색해 제시해 드릴게요.',
        options: [
          { id: 'yes', label: '네, 알고 있어요' },
          { id: 'search', label: 'AI가 찾아주세요' },
          { id: 'none', label: '경쟁 서비스가 없어요' },
          { id: 'unknown', label: '잘 모르겠어요' },
        ],
      },
      8: {
        text: '경쟁 서비스들 대신 이 서비스를 사용해야 하는 이유는 무엇인가요?',
        hint: '경쟁사의 약점이나 이 서비스만의 강점을 생각해보세요.',
      },
      9: {
        text: '사용자는 이 서비스를 통해 최종적으로 어떤 상태가 되길 바라나요?',
        hint: '행위가 아닌 결과/상태로 표현해주세요. 예: "시간을 절약한다" → "여유로운 일상"',
      },
      10: {
        text: '이 서비스의 수익 모델은 어떻게 되나요?',
        options: [
          { id: 'subscription', label: '구독 (월/연 정기 결제)' },
          { id: 'per-use', label: '건당 결제 (사용할 때마다)' },
          { id: 'commission', label: '수수료 (거래 시 일정 비율)' },
          { id: 'ad', label: '광고' },
          { id: 'free', label: '무료 (수익화 계획 없음)' },
          { id: 'undecided', label: '아직 정하지 않았어요' },
        ],
      },

      // Phase 3: Tree (사업 운영)
      11: {
        text: '고객이 이 서비스를 처음 알게 되는 곳은 어디일까요?',
        options: [
          { id: 'search', label: '검색 (구글, 네이버에서 검색해서)' },
          { id: 'sns', label: 'SNS (인스타, 유튜브, 틱톡 등)' },
          { id: 'referral', label: '지인 추천 (입소문, 공유)' },
          { id: 'ad', label: '광고 (온라인/오프라인)' },
          { id: 'undecided', label: '아직 정하지 않았어요' },
        ],
      },
      12: {
        text: '이 서비스가 잘 되고 있다는 걸 어떻게 알 수 있을까요?',
        hint: '측정 가능한 숫자로 생각해보세요.',
        options: [
          { id: 'users', label: '활성 사용자 수 (DAU/MAU)' },
          { id: 'revenue', label: '거래액/매출' },
          { id: 'retention', label: '재방문율/재구매율' },
          { id: 'conversion', label: '전환율' },
          { id: 'undecided', label: '아직 모르겠어요' },
        ],
      },
      13: {
        text: '첫 버전으로 확인하고 싶은 게 뭔가요?',
        options: [
          { id: 'problem', label: '사람들이 진짜 이 문제를 겪는지 (문제 검증)' },
          { id: 'solution', label: '이 방식으로 해결이 되는지 (솔루션 검증)' },
          { id: 'payment', label: '돈을 낼 의향이 있는지 (지불 의향 검증)' },
          { id: 'retention', label: '계속 쓸 의향이 있는지 (리텐션 검증)' },
          { id: 'undecided', label: '아직 정하지 않았어요' },
        ],
      },
      14: {
        text: '이 서비스에서 외부 연동이 필요한 부분이 있나요?',
        options: [
          { id: 'payment', label: '결제 (카드, 간편결제)' },
          { id: 'login', label: '로그인 (소셜 로그인)' },
          { id: 'notification', label: '알림 (푸시, 문자, 이메일)' },
          { id: 'map', label: '지도/위치' },
          { id: 'storage', label: '파일 저장 (이미지, 동영상)' },
          { id: 'undecided', label: '아직 정하지 않았어요' },
        ],
      },
      15: {
        text: '서비스 시작할 때 미리 준비해야 하는 데이터가 있나요?',
        options: [
          { id: 'yes', label: '네, 있어요' },
          { id: 'no', label: '아니요, 사용자가 직접 채워요' },
          { id: 'unknown', label: '아직 모르겠어요' },
        ],
      },
      16: {
        text: '이 서비스를 운영하면서 발생할 비용은 어떤 게 있을까요?',
        options: [
          { id: 'server', label: '서버/호스팅' },
          { id: 'appstore', label: '앱스토어 수수료' },
          { id: 'pg', label: 'PG 수수료' },
          { id: 'storage', label: '스토리지 비용' },
          { id: 'api', label: '외부 API 비용' },
          { id: 'undecided', label: '아직 고려하지 않았어요' },
        ],
      },
      17: {
        text: '이 서비스와 관련된 법적 규제나 인허가가 있을까요?',
        options: [
          { id: 'yes', label: '네, 있어요' },
          { id: 'no', label: '아니요, 해당 없어요' },
          { id: 'unknown', label: '잘 모르겠어요' },
        ],
      },

      // Phase Final (마무리)
      18: {
        text: '그 외에 이 서비스를 이해하는데 필요한 내용이 있나요?',
        hint: '참고 서비스, 제약 조건, 확장 계획 등 자유롭게 적어주세요. (선택사항)',
      },
      19: {
        text: '지금까지 정리한 내용 중 추가로 확인이 필요한 부분이 있어요.',
        hint: 'AI가 논리적 공백을 감지하여 질문합니다.',
      },
      20: {
        text: '지금까지 정리한 RFP를 확정할까요?',
        options: [
          { id: 'confirm', label: '네, 확정합니다' },
          { id: 'edit', label: '수정하고 싶은 부분이 있어요' },
          { id: 'later', label: '나중에 다시 할게요' },
        ],
      },
    };

    return fallbacks[stepNumber] || { text: '다음 질문입니다.' };
  }
}

export const interviewEngine = new InterviewEngine();
