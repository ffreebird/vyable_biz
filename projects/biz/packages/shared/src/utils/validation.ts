import type { AnswerState } from '../types/project';

export interface LogicalSeedElements {
  target: boolean;
  action: boolean;
  value: boolean;
}

export function checkLogicalSeed(input: string): LogicalSeedElements {
  const targetPatterns = [
    // Korean
    /프리랜서/,
    /농부/,
    /판매자/,
    /구매자/,
    /사용자/,
    /고객/,
    /학생/,
    /강사/,
    /누가/,
    /사람/,
    /기업/,
    /개인/,
    // English
    /freelancer/i,
    /user/i,
    /customer/i,
    /client/i,
    /seller/i,
    /buyer/i,
    /student/i,
    /teacher/i,
    /people/i,
    /business/i,
    /company/i,
    /individual/i,
  ];
  const actionPatterns = [
    // Korean
    /올리/,
    /파/,
    /사/,
    /매칭/,
    /거래/,
    /검색/,
    /등록/,
    /예약/,
    /주문/,
    /배달/,
    /연결/,
    /공유/,
    /무엇을/,
    /하는/,
    // English
    /upload/i,
    /sell/i,
    /buy/i,
    /match/i,
    /trade/i,
    /search/i,
    /register/i,
    /book/i,
    /order/i,
    /deliver/i,
    /connect/i,
    /share/i,
    /create/i,
    /post/i,
    /receive/i,
  ];
  const valuePatterns = [
    // Korean
    /받/,
    /얻/,
    /신선/,
    /편리/,
    /빠른/,
    /저렴/,
    /쉽/,
    /효율/,
    /절약/,
    /왜/,
    /위해/,
    /결과/,
    // English
    /get/i,
    /earn/i,
    /fresh/i,
    /convenient/i,
    /fast/i,
    /cheap/i,
    /easy/i,
    /efficient/i,
    /save/i,
    /work/i,
    /income/i,
    /benefit/i,
    /result/i,
  ];

  return {
    target: targetPatterns.some((pattern) => pattern.test(input)),
    action: actionPatterns.some((pattern) => pattern.test(input)),
    value: valuePatterns.some((pattern) => pattern.test(input)),
  };
}

export function isLogicalSeedValid(elements: LogicalSeedElements): boolean {
  const count = [elements.target, elements.action, elements.value].filter(Boolean).length;
  return count >= 2;
}

export function calculateCompletionRate(fields: Array<{ state: AnswerState }>): number {
  if (fields.length === 0) return 0;

  const confirmed = fields.filter((f) => f.state === 'confirmed').length;
  const inferred = fields.filter((f) => f.state === 'inferred').length;

  const score = confirmed * 1 + inferred * 0.5;
  return Math.round((score / fields.length) * 100);
}

export function getCompletionLevel(rate: number): 'high' | 'medium' | 'low' | 'critical' {
  if (rate >= 80) return 'high';
  if (rate >= 50) return 'medium';
  if (rate >= 30) return 'low';
  return 'critical';
}

export function isMinimumRequirementsMet(fields: Record<string, { state: AnswerState }>): boolean {
  const required = ['1.1.1', '1.2.1', '1.3.1'];
  return required.every(
    (key) => fields[key]?.state === 'confirmed' || fields[key]?.state === 'inferred'
  );
}

export function generateId(): string {
  return crypto.randomUUID();
}
