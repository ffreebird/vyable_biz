import type { InterviewStateResponse, Phase, QuestionResponse } from '@vyable/shared';
import { PHASE_CONFIG } from '@vyable/shared';
import { clsx } from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

const PHASE_COLORS: Record<Phase, string> = {
  seed: 'bg-green-500',
  sprout: 'bg-yellow-500',
  tree: 'bg-orange-500',
  final: 'bg-blue-500',
};

export function Interview() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<InterviewStateResponse | null>(null);
  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transitionQuestion, setTransitionQuestion] = useState<string | null>(null);

  const loadQuestion = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const [stateData, questionData] = await Promise.all([
        api.interview.getState(projectId),
        api.interview.getNext(projectId),
      ]);
      setState(stateData);
      setQuestion(questionData);
      setAnswer('');
      setSelectedOptions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '질문을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  const handleSubmit = async () => {
    if (!projectId || !question) return;

    const answerValue =
      question.type === 'text_input'
        ? answer
        : question.type === 'single_select'
          ? selectedOptions[0]
          : selectedOptions;

    if (!answerValue || (Array.isArray(answerValue) && answerValue.length === 0)) {
      setError('답변을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await api.interview.submitAnswer(projectId, {
        stepNumber: question.step,
        answer: answerValue,
      });

      if (!result.success && result.validation.inquiry) {
        setError(result.validation.inquiry.question);
        return;
      }

      if (result.isComplete) {
        navigate(`/projects/${projectId}/preview`);
        return;
      }

      if (result.isPhaseTransition && result.transitionQuestion) {
        setTransitionQuestion(result.transitionQuestion);
        return;
      }

      loadQuestion();
    } catch (err) {
      setError(err instanceof Error ? err.message : '답변 제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransition = async (proceed: boolean) => {
    if (!projectId) return;

    try {
      await api.interview.transition(projectId, { proceed });
      setTransitionQuestion(null);
      loadQuestion();
    } catch (err) {
      setError(err instanceof Error ? err.message : '단계 전환에 실패했습니다.');
    }
  };

  const toggleOption = (optionId: string) => {
    if (question?.type === 'single_select') {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (transitionQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-lg text-center">
          <h2 className="text-xl font-bold text-gray-900">다음 단계로 진행할까요?</h2>
          <p className="mt-4 text-gray-600">{transitionQuestion}</p>
          <div className="mt-6 flex justify-center gap-4">
            <button type="button" onClick={() => handleTransition(true)} className="btn-primary">
              네, 진행합니다
            </button>
            <button type="button" onClick={() => handleTransition(false)} className="btn-secondary">
              아니요, 마무리할게요
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="border-b bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-900">{question?.phaseName} 단계</span>
            <span className="text-gray-500">
              {state?.progress.completed}/{state?.progress.total} 완료
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={clsx(
                'h-full transition-all',
                question?.phase && PHASE_COLORS[question.phase]
              )}
              style={{ width: `${state?.progress.percentage || 0}%` }}
            />
          </div>
          <div className="mt-2 flex gap-1">
            {(['seed', 'sprout', 'tree', 'final'] as Phase[]).map((phase) => (
              <div
                key={phase}
                className={clsx(
                  'flex-1 rounded px-2 py-1 text-center text-xs',
                  phase === question?.phase
                    ? 'bg-blue-100 font-medium text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                {PHASE_CONFIG[phase].label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="card">
          <div className="text-sm text-gray-500">Step {question?.step}</div>
          <h2 className="mt-2 text-xl font-bold text-gray-900">{question?.question}</h2>
          {question?.hint && <p className="mt-2 text-sm text-gray-500">{question.hint}</p>}

          <div className="mt-6">
            {question?.type === 'text_input' ? (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="답변을 입력해주세요..."
                className="input min-h-[120px] resize-none"
              />
            ) : (
              <div className="space-y-2">
                {question?.options?.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className={clsx(
                      'w-full rounded-lg border p-4 text-left transition-colors',
                      selectedOptions.includes(option.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                    {option.hint && <div className="mt-1 text-sm text-gray-500">{option.hint}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? '제출 중...' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
