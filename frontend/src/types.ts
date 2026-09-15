export interface Employee {
  id: number;
  name: string;
  company: string;
  consultationCount: number;
}

export type InquiryStatus = '대기' | '진행중' | '완료';

export interface ConversationMessage {
  from: 'customer' | 'agent';
  text: string;
}

export interface Inquiry {
  id: number;
  employeeId: number;
  name: string;
  company: string;
  question: string;
  category: string;
  topic: string;
  receivedAt: string;
  status: InquiryStatus;
  conversation?: ConversationMessage[];
}

export interface RecentConsultationItem {
  date: string;
  question: string;
}

export interface ContextResponse {
  summary: string;
  recentConsultations: RecentConsultationItem[];
  relatedConsultation: string;
  note: string;
}

export type Priority = '긴급' | '일반' | '낮음';

export interface RecommendationResponse {
  category: string;
  topic: string;
  summary: string;
  priority: Priority;
  recommendedActions: string[];
  caution: string;
}

export interface FaqCandidate {
  title: string;
  category: string;
  count: number;
  reason: string;
  hasExistingAnswer: boolean;
}

export interface CategoryDistributionItem {
  category: string;
  count: number;
}

export interface FaqAnalysisResponse {
  totalConsultations: number;
  repeatedConsultations: number;
  faqCandidateCount: number;
  categoryDistribution: CategoryDistributionItem[];
  faqCandidates: FaqCandidate[];
}

export interface FaqDraftResponse {
  question: string;
  answer: string;
  referenceCount: number;
  recentCount: number;
  answeredCount: number;
  recentConsultations: RecentConsultationItem[];
}
