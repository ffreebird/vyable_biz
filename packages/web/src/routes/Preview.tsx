import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

interface PreviewSection {
  id: string;
  name: string;
  status: string;
  preview: string;
}

export function Preview() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [sections, setSections] = useState<PreviewSection[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const loadPreview = async () => {
      try {
        const data = await api.rfp.preview(projectId);
        setSections(data.sections);
        setProgress(data.overallProgress);
      } catch (err) {
        setError(err instanceof Error ? err.message : '프리뷰를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [projectId]);

  const handleGenerate = async () => {
    if (!projectId) return;

    setGenerating(true);
    setError(null);

    try {
      await api.rfp.generate(projectId);
      navigate('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'RFP 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      complete: 'bg-green-100 text-green-700',
      partial: 'bg-yellow-100 text-yellow-700',
      missing: 'bg-gray-100 text-gray-500',
    };
    const labels = {
      complete: '완료',
      partial: '부분',
      missing: '미정',
    };
    return (
      <span
        className={clsx(
          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
          styles[status as keyof typeof styles] || styles.missing
        )}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">RFP 프리뷰</h1>
            <p className="text-sm text-gray-500">완성도: {progress}%</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/projects/${projectId}/interview`)}
              className="btn-secondary"
            >
              인터뷰 수정
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || progress < 30}
              className="btn-primary"
            >
              {generating ? '생성 중...' : 'RFP 생성'}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b bg-white px-4 pb-4">
        <div className="mx-auto max-w-4xl">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={clsx(
                'h-full transition-all',
                progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {progress >= 80
              ? '🟢 RFP가 충분히 완성되었습니다.'
              : progress >= 50
                ? '🟡 추가 정보가 필요한 항목이 있습니다.'
                : progress >= 30
                  ? '🟠 미정 항목이 많습니다. 개발 시 결정이 필요할 수 있습니다.'
                  : '🔴 아직 정해진 정보가 부족합니다.'}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {error && <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className={clsx('card', section.status === 'missing' && 'opacity-60')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-gray-500">{section.id}</div>
                  <h3 className="font-semibold text-gray-900">{section.name}</h3>
                </div>
                {getStatusBadge(section.status)}
              </div>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">{section.preview}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
