'use server';
/**
 * @fileOverview AI flow for interpreting user intent via a neural interface.
 * It takes a natural language query and optional user context to suggest actions.
 *
 * - interpretUserIntent - A function that orchestrates the user intent interpretation.
 * - InterpretUserIntentInput - The input type for the interpretUserIntent function.
 * - InterpretUserIntentOutput - The return type for the interpretUserIntent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UserContextSchema = z.object({
  recentSearches: z.array(z.string()).optional().describe('List of recent search queries made by the user.'),
  visitedPages: z.array(z.string()).optional().describe('List of recently visited page paths/URLs.'),
  currentFocus: z.string().optional().describe('The current area or feature the user might be focused on (e.g., "image generation", "data analysis").'),
  preferredTone: z.enum(['formal', 'casual', 'technical']).optional().describe('User preferred communication tone.'),
});
export type UserContext = z.infer<typeof UserContextSchema>;

const InterpretUserIntentInputSchema = z.object({
  userQuery: z.string().describe('The natural language query or statement of intent from the user.'),
  userContext: UserContextSchema.optional().describe('Optional context about the user activity and preferences to help refine intent interpretation.'),
});
export type InterpretUserIntentInput = z.infer<typeof InterpretUserIntentInputSchema>;

const InterpretUserIntentOutputSchema = z.object({
  originalQuery: z.string().describe('The original query received from the user.'),
  interpretation: z.string().describe("The AI's understanding of the user's core intent."),
  suggestedActionType: z.enum(['NAVIGATE', 'EXECUTE_FLOW', 'CLARIFY', 'INFORM', 'NONE'])
    .describe('The type of action the AI suggests based on the interpretation.'),
  suggestedActionDetail: z.string().optional().describe('Details for the action, e.g., a URL for NAVIGATE, a flow name or parameters for EXECUTE_FLOW, or a clarifying question.'),
  confidence: z.number().min(0).max(1).describe('A score (0-1) indicating the AI\'s confidence in its interpretation and suggestion.'),
  explanation: z.string().describe('A brief explanation of how the AI arrived at this interpretation and suggestion, considering the context if provided.'),
  refinedPrompt: z.string().optional().describe("If applicable, a refined prompt that could be used for another AI system (e.g., Neuro Synapse or Image Generation)."),
});
export type InterpretUserIntentOutput = z.infer<typeof InterpretUserIntentOutputSchema>;


export async function interpretUserIntent(input: InterpretUserIntentInput): Promise<InterpretUserIntentOutput> {
  return interpretUserIntentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretUserIntentPrompt',
  input: {schema: InterpretUserIntentInputSchema},
  output: {schema: InterpretUserIntentOutputSchema},
  prompt: `You are an advanced AI assistant powering a Neural Interface for the "NeuroVichar" application.
Your primary role is to interpret a user's natural language query, even if it's vague or conversational, and translate it into a clear intent and an actionable suggestion.
You MUST consider any provided 'userContext' (recent searches, visited pages, current focus, preferred tone) to personalize your interpretation and make more relevant suggestions.

User's Query:
"{{{userQuery}}}"

{{#if userContext}}
User's Context:
  {{#if userContext.recentSearches}}
  - Recent Searches: {{#each userContext.recentSearches}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}
  {{/if}}
  {{#if userContext.visitedPages}}
  - Visited Pages: {{#each userContext.visitedPages}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}
  {{/if}}
  {{#if userContext.currentFocus}}
  - Current Focus: "{{userContext.currentFocus}}"
  {{/if}}
  {{#if userContext.preferredTone}}
  - Preferred Tone: "{{userContext.preferredTone}}"
  {{/if}}
{{else}}
User's Context: Not provided.
{{/if}}

Application Features:
- / (Dashboard): Overview of all features.
- /neuro-synapse: Complex problem decomposition and synthesis using AI agents and tools. Accepts a detailed prompt.
- /ai-image-generation: Generates images from text prompts.
- /parallel-processing: Information about system efficiency.
- /neural-interface: This current feature.
- /distributed-power: Information about system resilience.
- /sub-prompt-decomposition: Information about AI collaboration.
- /web-browsing: Summarize web pages. Agent can browse a URL and summarize.

Based on the user's query and context:
1.  **Interpretation**: Clearly state your understanding of the user's core goal or need.
2.  **Suggested Action Type**: Choose one from:
    *   NAVIGATE: If the user seems to want to go to a specific feature page.
    *   EXECUTE_FLOW: If the user's query implies running a specific AI function (e.g., "summarize this for me" could target /web-browsing, "create a picture of a cat" targets /ai-image-generation, "analyze this complex idea" targets /neuro-synapse).
    *   CLARIFY: If the intent is too ambiguous and you need more information.
    *   INFORM: If the user is asking a general question that can be answered directly.
    *   NONE: If no specific action seems appropriate or the query is conversational without a clear task.
3.  **Suggested Action Detail**:
    *   For NAVIGATE: Provide the application path (e.g., "/ai-image-generation").
    *   For EXECUTE_FLOW: Describe the flow and, if possible, extract key parameters. For example, for image generation, extract the image prompt; for web summarization, extract the URL.
    *   For CLARIFY: Pose a specific question to the user.
    *   For INFORM: Provide a concise answer.
4.  **Confidence**: Estimate your confidence (0.0 to 1.0) in this interpretation. Higher for clear, specific queries with matching context; lower for vague queries or conflicting context.
5.  **Explanation**: Briefly explain your reasoning. Mention how userContext (if available) influenced your decision.
6.  **Refined Prompt**: If the user's query is a good candidate for another feature (like Neuro Synapse or Image Generation), provide a well-structured prompt based on their input.

Example Output Snippet:
{
  "originalQuery": "I want to see how NeuroVichar breaks down big problems.",
  "interpretation": "User wants to understand and possibly use the Neuro Synapse feature for complex problem decomposition.",
  "suggestedActionType": "NAVIGATE",
  "suggestedActionDetail": "/neuro-synapse",
  "confidence": 0.9,
  "explanation": "The query directly mentions 'breaks down big problems', which aligns with the Neuro Synapse feature description. No conflicting context provided.",
  "refinedPrompt": "Explore the capabilities of Neuro Synapse in decomposing and analyzing complex scenarios, such as [insert user's specific problem domain if inferable or provide a placeholder]."
}

Ensure your entire response is a single JSON object matching the InterpretUserIntentOutputSchema.
If suggesting EXECUTE_FLOW for image generation, the 'suggestedActionDetail' should be the image prompt.
If suggesting EXECUTE_FLOW for web summarization, the 'suggestedActionDetail' should be the URL.
If suggesting EXECUTE_FLOW for Neuro Synapse, the 'suggestedActionDetail' should be the main prompt for Neuro Synapse.

Begin!
`,
});

const interpretUserIntentFlow = ai.defineFlow(
  {
    name: 'interpretUserIntentFlow',
    inputSchema: InterpretUserIntentInputSchema,
    outputSchema: InterpretUserIntentOutputSchema,
  },
  async (input: InterpretUserIntentInput) => {
    const llmResponse = await prompt(input);

    if (!llmResponse.output) {
      throw new Error('Neural Interface failed to generate an interpretation.');
    }

    // The LLM should construct the full output, including the originalQuery
    return {
      ...llmResponse.output,
      originalQuery: input.userQuery, // Ensure original query is always part of the output
    };
  }
);
