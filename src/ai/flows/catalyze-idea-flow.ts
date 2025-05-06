'use server';
/**
 * @fileOverview AI Idea Catalyst Flow for Neuro Synapse.
 * Helps users brainstorm and formulate complex prompts for Neuro Synapse.
 *
 * - catalyzeIdea - Function to generate research directions, agent suggestions, and a starter prompt.
 * - CatalyzeIdeaInput - Input type for catalyzeIdea.
 * - CatalyzeIdeaOutput - Output type for catalyzeIdea.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CatalyzeIdeaInputSchema = z.object({
  theme: z.string().describe('A general theme or topic for exploration.'),
});
export type CatalyzeIdeaInput = z.infer<typeof CatalyzeIdeaInputSchema>;

const CatalyzeIdeaOutputSchema = z.object({
  originalTheme: z.string().describe('The original theme provided by the user.'),
  potentialQuestions: z.array(z.string()).describe('A list of 3-5 complex questions or research directions related to the theme, suitable for deep AI analysis.'),
  suggestedAgents: z.array(z.string()).describe('A list of 2-3 virtual agent types (e.g., "Data Analyst", "Creative Strategist", "Technical Writer") that could contribute to exploring the theme.'),
  starterComplexPrompt: z.string().describe('A comprehensive "starter" prompt, derived from the theme and potential questions, designed for an advanced AI system like Neuro Synapse to explore the theme thoroughly.'),
  creativeAngle: z.string().optional().describe('A unique or creative angle to consider when exploring the theme.'),
});
export type CatalyzeIdeaOutput = z.infer<typeof CatalyzeIdeaOutputSchema>;

export async function catalyzeIdea(input: CatalyzeIdeaInput): Promise<CatalyzeIdeaOutput> {
  return catalyzeIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'catalyzeIdeaPrompt',
  input: {schema: CatalyzeIdeaInputSchema},
  output: {schema: CatalyzeIdeaOutputSchema},
  prompt: `You are an AI Idea Catalyst, specialized in helping users transform a general theme into a structured, complex prompt suitable for an advanced AI orchestration system like Neuro Synapse.

User's Theme:
"{{{theme}}}"

Your task is to:
1.  **Generate Potential Questions**: Based on the theme, generate 3-5 thought-provoking, complex questions or research directions that an AI could explore. These should go beyond simple queries and encourage deep analysis.
2.  **Suggest Agent Types**: Recommend 2-3 types of virtual AI agents (e.g., "Financial Analyst", "Historical Researcher", "Futures Forecaster", "Ethical Reviewer", "Scientific Illustrator") that would be valuable in addressing the generated questions or exploring the theme.
3.  **Formulate a Starter Complex Prompt**: Combine the theme, the potential questions, and the idea of using multiple agents into a single, comprehensive starter prompt. This prompt should clearly instruct an advanced AI system (like Neuro Synapse) to decompose the problem, assign tasks to different virtual agents, and synthesize a multifaceted answer. The prompt should encourage depth and breadth of exploration.
4.  **Identify a Creative Angle**: Suggest one unique or creative angle for exploring the theme that the user might not have considered.

Output Format:
Ensure your entire response is a single JSON object matching the CatalyzeIdeaOutputSchema.
The "starterComplexPrompt" should be phrased as if addressing an AI like Neuro Synapse directly. For example, start with "Analyze the theme of '...' by decomposing it into the following areas..."

Example Output Snippet (for theme: "The future of personalized medicine"):
{
  "originalTheme": "The future of personalized medicine",
  "potentialQuestions": [
    "What are the socio-economic impacts of widespread gene-based personalized treatments?",
    "How will data privacy and security be managed with vast amounts of individual health data for personalized medicine?",
    "What ethical frameworks are needed to ensure equitable access to personalized medicine?",
    "Explore the technological advancements in CRISPR and AI that will drive the next decade of personalized medicine."
  ],
  "suggestedAgents": ["Bioethicist", "Medical Data Scientist", "Genomics Researcher", "Healthcare Economist"],
  "starterComplexPrompt": "Analyze the theme of 'The future of personalized medicine' by decomposing it into key areas: socio-economic impacts of gene-based treatments, data privacy management for individual health data, ethical frameworks for equitable access, and technological advancements (CRISPR, AI). Assign virtual agents like a Bioethicist, Medical Data Scientist, Genomics Researcher, and Healthcare Economist to explore these facets. Synthesize their findings into a comprehensive report outlining challenges, opportunities, and future projections.",
  "creativeAngle": "Consider the philosophical implications: how might widespread personalized medicine change our understanding of 'normal' health or human identity?"
}

Begin!
`,
});

const catalyzeIdeaFlow = ai.defineFlow(
  {
    name: 'catalyzeIdeaFlow',
    inputSchema: CatalyzeIdeaInputSchema,
    outputSchema: CatalyzeIdeaOutputSchema,
  },
  async (input: CatalyzeIdeaInput) => {
    const llmResponse = await prompt(input);
    if (!llmResponse.output) {
      throw new Error('Idea Catalyst failed to generate a response.');
    }
    return {
      ...llmResponse.output,
      originalTheme: input.theme,
    };
  }
);
