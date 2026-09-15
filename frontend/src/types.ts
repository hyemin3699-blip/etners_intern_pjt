export interface Employee {
  id: number;
  name: string;
  company: string;
  department?: string;
  employeeNo?: string;
  consultationCount: number;
}

export type InquiryStatus = '대기' | '진행중' | '완료';

export interface ConversationMessage {
  from: 'customer' | 'agent';
  text: string;
}

export type DocumentType = 'parental_leave' | 'family_event' | 'family_allowance' | 'overtime' | 'welfare_point';

export interface DocumentStatus {
  name: string;
  state: 'requested' | 'completed';
  values?: Record<string, string>;
  signature?: string | null;
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
  documentType?: DocumentType;
  documentStatus?: DocumentStatus;
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

export type EvidenceScope = 'common' | 'company';

export interface EvidenceDocument {
  id: number;
  scope: EvidenceScope;
  company: string | null;
  category: string;
  name: string;
  description: string;
  fileName: string;
  uploadedAt: string;
  sectionCount: number;
}

export interface EvidenceSection {
  page: number;
  section: string;
  content: string;
}

export interface EvidenceDocumentDetail extends EvidenceDocument {
  sections: EvidenceSection[];
}

export interface EvidenceMatch {
  documentId: number;
  documentName: string;
  category: string;
  page: number;
  section: string;
  evidence: string;
  relevance: number;
}

export interface EvidenceSearchResponse {
  documents: EvidenceMatch[];
}

export interface RegisteredFaq {
  id: number;
  company: string | null;
  category: string;
  topic: string;
  question: string;
  answer: string;
  createdAt: string;
}
