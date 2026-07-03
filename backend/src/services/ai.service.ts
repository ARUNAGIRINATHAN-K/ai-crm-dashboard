import { GoogleGenerativeAI, FunctionDeclarationSchemaType } from '@google/generative-ai';
import {
  LeadSummaryResponse,
  EmailGenerationResponse,
  PipelineInsightsResponse,
} from '../types/ai.types';

// Structured Schema Definition for Lead Summary
const leadSummarySchema = {
  type: FunctionDeclarationSchemaType.OBJECT,
  properties: {
    summary: {
      type: FunctionDeclarationSchemaType.STRING,
      description: 'A concise 2-3 sentence summary of the lead status and core details.',
    },
    keyPoints: {
      type: FunctionDeclarationSchemaType.ARRAY,
      items: { type: FunctionDeclarationSchemaType.STRING },
      description: 'Bullet points highlighting key pain points, timeline, budget, or important details.',
    },
    sentiment: {
      type: FunctionDeclarationSchemaType.STRING,
      enum: ['positive', 'neutral', 'negative'],
      description: 'The overall client sentiment inferred from interaction logs.',
    },
    recommendedNextSteps: {
      type: FunctionDeclarationSchemaType.ARRAY,
      items: { type: FunctionDeclarationSchemaType.STRING },
      description: 'Actionable next steps recommended to drive progress with this lead.',
    },
  },
  required: ['summary', 'keyPoints', 'sentiment', 'recommendedNextSteps'],
};

// Structured Schema Definition for Outreach Email Drafts
const emailGenerationSchema = {
  type: FunctionDeclarationSchemaType.OBJECT,
  properties: {
    subject: {
      type: FunctionDeclarationSchemaType.STRING,
      description: 'A professional and catchy email subject line tailored to the context.',
    },
    body: {
      type: FunctionDeclarationSchemaType.STRING,
      description: 'The full email body. Use double line breaks between paragraphs, keep paragraphs short, and use placeholder signatures like [Your Name].',
    },
  },
  required: ['subject', 'body'],
};

// Structured Schema Definition for Pipeline Insights
const pipelineInsightsSchema = {
  type: FunctionDeclarationSchemaType.OBJECT,
  properties: {
    healthScore: {
      type: FunctionDeclarationSchemaType.INTEGER,
      description: 'An overall numeric score (0 to 100) reflecting the current pipeline health and likelihood of conversion.',
    },
    summary: {
      type: FunctionDeclarationSchemaType.STRING,
      description: 'Executive summary detailing current performance, deal velocities, and overall pipeline state.',
    },
    risks: {
      type: FunctionDeclarationSchemaType.ARRAY,
      items: { type: FunctionDeclarationSchemaType.STRING },
      description: 'Identified risk factors in the pipeline (e.g., stagnant deals, low pipeline coverage, high-value deal blockages).',
    },
    suggestions: {
      type: FunctionDeclarationSchemaType.ARRAY,
      items: { type: FunctionDeclarationSchemaType.STRING },
      description: 'Practical, actionable changes and recommendations to improve closing rates.',
    },
  },
  required: ['healthScore', 'summary', 'risks', 'suggestions'],
};

/**
 * Instantiates the GoogleGenerativeAI client.
 */
const getClient = (): GoogleGenerativeAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY environment variable is not configured or is using default placeholder.');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generate a smart status summary for a lead based on metadata and notes.
 */
export const generateLeadSummary = async (
  leadName: string,
  value: number,
  stage: string,
  contactName: string,
  companyName: string,
  notes: string[]
): Promise<LeadSummaryResponse> => {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: leadSummarySchema as any,
      temperature: 0.2,
    },
  });

  const prompt = `
    Synthesize interaction logs and metadata into a clean status report.
    Deal Name: ${leadName}
    Deal Value: $${value}
    Stage: ${stage}
    Contact Name: ${contactName} (Company: ${companyName})
    
    Interaction Logs:
    ${notes.length > 0 ? notes.map((n, i) => `Log [${i + 1}]: ${n}`).join('\n') : 'No previous log messages recorded.'}
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return JSON.parse(responseText) as LeadSummaryResponse;
};

/**
 * Compose a tailored client outreach email based on the CRM deal history.
 */
export const generateEmailDraft = async (
  leadName: string,
  contactName: string,
  companyName: string,
  promptInstruction: string,
  notes: string[]
): Promise<EmailGenerationResponse> => {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: emailGenerationSchema as any,
      temperature: 0.7,
    },
  });

  const prompt = `
    Write a personalized professional outreach email on behalf of a sales rep.
    Recipient Name: ${contactName}
    Recipient Company: ${companyName}
    Deal Context: ${leadName}
    
    Deal logs / context:
    ${notes.length > 0 ? notes.map(n => `- ${n}`).join('\n') : 'No previous logs recorded.'}

    Rep email objective instruction: ${promptInstruction}
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return JSON.parse(responseText) as EmailGenerationResponse;
};

/**
 * Analyze a user's pipeline deals list to evaluate risks and generate sales advice.
 */
export const generatePipelineInsights = async (
  leads: Array<{ name: string; value: number; stage: string }>
): Promise<PipelineInsightsResponse> => {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: pipelineInsightsSchema as any,
      temperature: 0.3,
    },
  });

  const prompt = `
    Evaluate the following active sales pipeline deals list and provide recommendations:
    ${leads.length > 0 
      ? leads.map((l, i) => `Deal [${i + 1}]: ${l.name}, Value: $${l.value}, Stage: ${l.stage}`).join('\n') 
      : 'No active deals recorded in the pipeline at this moment.'}
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return JSON.parse(responseText) as PipelineInsightsResponse;
};
