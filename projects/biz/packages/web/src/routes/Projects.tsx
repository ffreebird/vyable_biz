import type { ProjectResponse } from '@vyable/shared';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.projects.list();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;

    try {
      const project = await api.projects.create({ name: newProjectName });
      navigate(`/projects/${project.id}/interview`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.projects.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      interviewing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
    };
    const labels = {
      draft: '시작 전',
      interviewing: '진행 중',
      completed: '완료',
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}
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
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">프로젝트</h1>
          <button type="button" onClick={() => setCreating(true)} className="btn-primary">
            + 새 프로젝트
          </button>
        </div>

        {creating && (
          <div className="mt-6 card">
            <h2 className="font-semibold text-gray-900">새 프로젝트 만들기</h2>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="프로젝트 이름"
                className="input flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <button type="button" onClick={handleCreate} className="btn-primary">
                만들기
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setNewProjectName('');
                }}
                className="btn-secondary"
              >
                취소
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {projects.length === 0 ? (
            <div className="card text-center text-gray-500">
              아직 프로젝트가 없습니다. 새 프로젝트를 만들어보세요!
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="card flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    {getStatusBadge(project.status)}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">완성도: {project.completionRate}%</p>
                </div>
                <div className="flex gap-2">
                  {project.status === 'completed' ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/projects/${project.id}/preview`)}
                      className="btn-primary"
                    >
                      RFP 보기
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(`/projects/${project.id}/interview`)}
                      className="btn-primary"
                    >
                      {project.status === 'draft' ? '시작하기' : '이어하기'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(project.id)}
                    className="btn-secondary text-red-600 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
