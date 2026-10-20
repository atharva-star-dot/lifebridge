export type SeverityLevel = 'Critical' | 'Urgent' | 'Routine';

export type VerificationStatus = 'verified' | 'unverified' | 'conflicting';

export interface ExtractedEntities {
  people: string[];
  medications: string[];
  symptoms: string[];
  locations: string[];
  times: string[];
}

export interface ActionItem {
  id: string;
  action: string;
  reason: string;
  deadline: string;
  call_number?: string | null;
  map_query?: string | null;
  is_high_risk?: boolean;
}

export interface VerificationItem {
  claim: string;
  status: VerificationStatus;
  source_title?: string | null;
  source_url?: string | null;
  notes?: string | null;
}

export interface LifeBridgeAnalysis {
  intent: string;
  severity: SeverityLevel;
  urgency: string;
  extracted_entities: ExtractedEntities;
  actions: ActionItem[];
  verification: VerificationItem[];
  confidence_score: number;
  needs_human_confirmation: boolean;
  clarifying_questions: string[];
  language: string;
  disclaimer: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  sample_text: string;
  data: LifeBridgeAnalysis;
}

export type SupportedLanguage = 'en' | 'hi' | 'mr';
