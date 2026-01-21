import type { AnswerState } from './project';

export interface RFPField {
  content: string | null;
  state: AnswerState;
  sourceStep?: number;
}

export interface RFPSection {
  id: string;
  name: string;
  fields: Record<string, RFPField>;
}

export interface RFPProblemDefinition {
  problem: RFPField;
  target: RFPField;
  situation: RFPField;
  unsolvedResult: RFPField;
}

export interface RFPExistingSolution {
  currentMethod: RFPField;
  limitation: RFPField;
  differentiation: RFPField;
}

export interface RFPCompetitor {
  name: string;
  type: 'direct' | 'indirect';
  strengths: string;
  weaknesses: string;
}

export interface RFPCompetitorAnalysis {
  competitors: RFPCompetitor[];
  position: RFPField;
  keyDifferentiation: RFPField;
}

export interface RFPChannel {
  path: RFPField;
  requiredFeatures: RFPField;
}

export interface RFPUserType {
  name: string;
  definition: string;
  purpose: string;
}

export interface RFPUserDefinition {
  types: RFPUserType[];
  relationships: RFPField;
}

export interface RFPUserGoal {
  type: string;
  goal: string;
  successCondition: string;
  obstacles: string;
}

export interface RFPFeature {
  name: string;
  description: string;
  linkedGoal?: string;
  withoutIt?: string;
  expectedEffect?: string;
  priority?: 'high' | 'medium' | 'low';
  excludeReason?: string;
  future?: 'planned' | 'permanent';
}

export interface RFPFunctionScope {
  core: RFPFeature[];
  niceToHave: RFPFeature[];
  outOfScope: RFPFeature[];
}

export interface RFPRevenueModel {
  source: RFPField;
  payer: RFPField;
  method: RFPField;
  price: RFPField;
  freeLimit: RFPField;
}

export interface RFPCostItem {
  item: string;
  estimatedAmount: string;
  type: 'fixed' | 'variable';
}

export interface RFPOperatingCost {
  items: RFPCostItem[];
  monthlyLimit: RFPField;
}

export interface RFPPlatform {
  platform: RFPField;
  detail: RFPField;
  reason: RFPField;
}

export interface RFPExternalDependency {
  system: string;
  purpose: string;
  integrationMethod: string;
  confirmed: boolean;
  replaceable: boolean;
}

export interface RFPRegulation {
  law: string;
  impact: string;
  requiredAction: string;
}

export interface RFPDataConstraint {
  requiredData: RFPField;
  source: RFPField;
  license: RFPField;
  updateCycle: RFPField;
}

export interface RFPMetric {
  name: string;
  definition: string;
  target: string;
  measurementTime: string;
}

export interface RFPHypothesis {
  hypothesis: string;
  ifTrue: string;
  ifFalse: string;
}

export interface RFPTerm {
  term: string;
  definition: string;
  notThis: string;
  relatedTerms: string;
}

export interface RFPScenario {
  userType: string;
  journey: string[];
  intersectionPoints: string;
}

export interface RFPDeferredItem {
  item: string;
  decisionDeadline: string;
  temporaryAssumption: string;
}

export interface RFPBranding {
  serviceName: RFPField;
  slogan: RFPField;
  toneAndManner: RFPField;
}

export interface RFP {
  id: string;
  projectId: string;
  version: string;
  completionRate: number;

  problemDefinition: {
    problem: RFPProblemDefinition;
    existingSolution: RFPExistingSolution;
    competitorAnalysis: RFPCompetitorAnalysis;
    channels: RFPChannel;
  };

  userDefinition: {
    types: RFPUserDefinition;
    goals: RFPUserGoal[];
  };

  functionScope: RFPFunctionScope;

  revenueCost: {
    revenue: RFPRevenueModel;
    cost: RFPOperatingCost;
  };

  technicalConstraints: {
    platform: RFPPlatform;
    externalDependencies: RFPExternalDependency[];
    regulations: RFPRegulation[];
    dataConstraints: RFPDataConstraint;
  };

  successDefinition: {
    metrics: RFPMetric[];
    mvpHypothesis: RFPHypothesis;
  };

  glossary: RFPTerm[];
  scenarios: RFPScenario[];
  deferredItems: RFPDeferredItem[];
  branding: RFPBranding;

  createdAt: Date;
  updatedAt: Date;
}

export interface GenerateRFPRequest {
  projectId: string;
}

export interface RFPResponse extends Omit<RFP, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}
