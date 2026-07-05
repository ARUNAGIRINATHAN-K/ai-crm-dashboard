import Groq from 'groq-sdk';
import {
  LeadSummaryResponse,
  EmailGenerationResponse,
  PipelineInsightsResponse,
} from '../types/ai.types';

/**
 * Instantiates the Groq client.
 */
const getClient = (): Groq => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY environment variable is not configured or is using default placeholder.');
  }
  return new Groq({ apiKey });
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

  const prompt = `
    Synthesize interaction logs and metadata into a clean JSON status report.
    The JSON object must have the following structure: { "summary": "string", "keyPoints": ["string"], "sentiment": "positive" | "neutral" | "negative", "recommendedNextSteps": ["string"] }.

    Deal Name: ${leadName}
    Deal Value: $${value}
    Stage: ${stage}
    Contact Name: ${contactName} (Company: ${companyName})
    
    Interaction Logs:
    ${notes.length > 0 ? notes.map((n, i) => `Log [${i + 1}]: ${n}`).join('\n') : 'No previous log messages recorded.'}
  `;

  const result = await client.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const responseContent = result.choices[0]?.message?.content;
  if (!responseContent) {
    throw new Error('Failed to generate summary from AI.');
  }

  return JSON.parse(responseContent) as LeadSummaryResponse;
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

  const prompt = `
    Write a personalized professional outreach email on behalf of a sales rep.
    Return a JSON object with this structure: { "subject": "string", "body": "string" }.
    In the body, use double line breaks for paragraphs and use a placeholder like [Your Name] for the signature.

    Recipient Name: ${contactName}
    Recipient Company: ${companyName}
    Deal Context: ${leadName}
    
    Deal logs / context:
    ${notes.length > 0 ? notes.map(n => `- ${n}`).join('\n') : 'No previous logs recorded.'}

    Rep email objective instruction: ${promptInstruction}
  `;

  const result = await client.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const responseContent = result.choices[0]?.message?.content;
  if (!responseContent) {
    throw new Error('Failed to generate email draft from AI.');
  }

  return JSON.parse(responseContent) as EmailGenerationResponse;
};

/**
 * Analyze a user's pipeline deals list to evaluate risks and generate sales advice.
 */
export const generatePipelineInsights = async (
  leads: Array<{ name: string; value: number; stage: string }>
): Promise<PipelineInsightsResponse> => {
  const client = getClient();

  const prompt = `
    Evaluate the following active sales pipeline deals list and provide recommendations.
    Return a JSON object with this structure: { "healthScore": number, "summary": "string", "risks": ["string"], "suggestions": ["string"] }.

    ${leads.length > 0 
      ? leads.map((l, i) => `Deal [${i + 1}]: ${l.name}, Value: $${l.value}, Stage: ${l.stage}`).join('\n') 
      : 'No active deals recorded in the pipeline at this moment.'}
  `;

  const result = await client.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const responseContent = result.choices[0]?.message?.content;
  if (!responseContent) {
    throw new Error('Failed to generate pipeline insights from AI.');
  }

  return JSON.parse(responseContent) as PipelineInsightsResponse;
};
