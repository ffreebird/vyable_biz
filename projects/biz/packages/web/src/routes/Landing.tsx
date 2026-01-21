import { useNavigate } from 'react-router-dom';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Vyable <span className="text-blue-600">Biz</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">AI Agent를 위한 완벽한 지시서 생성기</p>
        <p className="mt-2 text-sm text-gray-500">
          비개발자도 쉽게, AI가 이해하는 프로젝트 정의서를 만들어보세요.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="btn-primary text-base px-6 py-3"
          >
            시작하기
          </button>
        </div>

        <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
          <div className="card">
            <div className="text-2xl">💬</div>
            <h3 className="mt-2 font-semibold text-gray-900">대화형 인터뷰</h3>
            <p className="mt-1 text-sm text-gray-600">
              AI가 질문하고, 당신은 답하기만 하면 됩니다.
            </p>
          </div>
          <div className="card">
            <div className="text-2xl">📋</div>
            <h3 className="mt-2 font-semibold text-gray-900">자동 RFP 생성</h3>
            <p className="mt-1 text-sm text-gray-600">
              답변을 바탕으로 체계적인 프로젝트 정의서가 만들어집니다.
            </p>
          </div>
          <div className="card">
            <div className="text-2xl">🤖</div>
            <h3 className="mt-2 font-semibold text-gray-900">AI Agent 연동</h3>
            <p className="mt-1 text-sm text-gray-600">
              생성된 지시서로 바로 개발을 시작할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
