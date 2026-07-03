export interface LeadSummaryResponse {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  recommendedNextSteps: string[];
}

export interface EmailGenerationResponse {
  subject: string;
  body: string;
}

export interface PipelineInsightsResponse {
  healthScore: number; // Scale of 0 - 100 representing health of sales pipeline
  summary: string;
  risks: string[];
  suggestions: string[];
}
