
// 'use server';
/**
 * @fileOverview A real-time data analysis AI agent that can browse the web and identify trends and insights.
 *
 * - realTimeDataAnalysis - A function that handles the real-time data analysis process.
 * - RealTimeDataAnalysisInput - The input type for the realTimeDataAnalysis function.
 * - RealTimeDataAnalysisOutput - The return type for the realTimeDataAnalysis function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {browseWebPage} from '@/services/web-browser';

const RealTimeDataAnalysisInputSchema = z.object({
  dataSource: z
    .string()
    .url()
    .describe('The URL of the data source to track (e.g., a news website or financial data provider).'),
  analysisType: z
    .string()
    .describe(
      'The type of analysis to perform on the data (e.g., trend analysis, sentiment analysis, anomaly detection).'
    ),
  keywords: z
    .string()
    .optional()
    .describe('Optional keywords to focus the analysis on.'),
});

export type RealTimeDataAnalysisInput = z.infer<typeof RealTimeDataAnalysisInputSchema>;

// Add webPageContent to the input schema for the prompt
const AnalyzeDataPromptInputSchema = RealTimeDataAnalysisInputSchema.extend({
  webPageContent: z.string().describe('The content of the web page fetched from the data source.'),
});


const RealTimeDataAnalysisOutputSchema = z.object({
  trends: z.array(
    z.object({
      trend: z.string(),
      description: z.string(),
    })
  ),
  insights: z.array(
    z.object({
      insight: z.string(),
      explanation: z.string(),
    })
  ),
  summary: z.string().describe('A concise summary of the analysis.'),
});

export type RealTimeDataAnalysisOutput = z.infer<typeof RealTimeDataAnalysisOutputSchema>;

export async function realTimeDataAnalysis(input: RealTimeDataAnalysisInput): Promise<RealTimeDataAnalysisOutput> {
  return realTimeDataAnalysisFlow(input);
}

const analyzeDataPrompt = ai.definePrompt({
  name: 'analyzeDataPrompt',
  input: {schema: AnalyzeDataPromptInputSchema}, // Use the extended schema
  output: {schema: RealTimeDataAnalysisOutputSchema},
  prompt: `You are an expert data analyst specializing in real-time web data analysis.

You will analyze the data from the provided data source to identify trends and insights based on the specified analysis type.

Data Source URL: {{{dataSource}}}
Analysis Type: {{{analysisType}}}
{{#if keywords}}Keywords: {{{keywords}}}{{/if}}

Web Page Content:
{{{webPageContent}}}

Analyze the data and provide a summary of the analysis, a list of identified trends, and a list of insights.
`,
});

const realTimeDataAnalysisFlow = ai.defineFlow(
  {
    name: 'realTimeDataAnalysisFlow',
    inputSchema: RealTimeDataAnalysisInputSchema,
    outputSchema: RealTimeDataAnalysisOutputSchema,
  },
  async input => {
    const webPage = await browseWebPage(input.dataSource);

    const {output} = await analyzeDataPrompt({
      ...input,
      webPageContent: webPage.content, // Pass the fetched content to the prompt
    });
    return output!;
  }
);
