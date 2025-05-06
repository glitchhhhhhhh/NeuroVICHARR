
'use server';
/**
 * @fileOverview Implements the Neuro Synapse functionality for decomposing complex prompts.
 *
 * - decomposePrompt - A function that takes a complex prompt and breaks it down into subtasks.
 * - DecomposePromptInput - The input type for the decomposePrompt function.
 * - DecomposePromptOutput - The return type for the decomposePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SubtaskSchema = z.object({
  taskId: z.string().describe('A unique identifier for the subtask.'),
  description: z.string().describe('A detailed description of the subtask.'),
  assignedAgent: z.string().optional().describe('The type of AI agent best suited for this subtask (e.g., "Data Analyst", "Creative Writer", "Web Researcher").'),
  dependencies: z.array(z.string()).optional().describe('A list of task IDs that this subtask depends on.'),
});

const DecomposePromptInputSchema = z.object({
  complexPrompt: z.string().describe('The complex user prompt that needs to be decomposed.'),
  context: z.string().optional().describe('Any additional context or background information relevant to the prompt.'),
});
export type DecomposePromptInput = z.infer<typeof DecomposePromptInputSchema>;

const DecomposePromptOutputSchema = z.object({
  originalPrompt: z.string().describe('The original complex prompt provided by the user.'),
  subtasks: z.array(SubtaskSchema).describe('An array of decomposed subtasks.'),
  summary: z.string().describe('A brief summary of how the prompt was decomposed and the overall strategy.'),
});
export type DecomposePromptOutput = z.infer<typeof DecomposePromptOutputSchema>;

export async function decomposePrompt(input: DecomposePromptInput): Promise<DecomposePromptOutput> {
  return neuroSynapseDecompositionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'neuroSynapseDecompositionPrompt',
  input: {schema: DecomposePromptInputSchema},
  output: {schema: DecomposePromptOutputSchema},
  prompt: `You are the Neuro Synapse, an advanced AI prompt decomposition engine.
Your task is to break down a complex user prompt into a series of smaller, manageable subtasks.
Each subtask should be clearly defined and, where possible, assigned to a conceptual AI agent type best suited to handle it.
Also, identify any dependencies between subtasks.

Complex Prompt:
"{{{complexPrompt}}}"

{{#if context}}
Additional Context:
"{{{context}}}"
{{/if}}

Analyze the complex prompt and provide:
1. The original prompt.
2. A list of subtasks, each with:
    - taskId: A unique identifier (e.g., "task_001", "task_002").
    - description: A clear and concise description of what needs to be done.
    - assignedAgent: (Optional) Suggest a type of AI agent (e.g., "Data Analyst", "Creative Writer", "Code Generator", "Web Researcher", "Image Generator").
    - dependencies: (Optional) A list of task IDs that this task depends on. For example, if task_002 needs the output of task_001, then task_002 would have ["task_001"] in its dependencies.
3. A brief summary of your decomposition strategy.

Ensure the subtasks are logical and cover all aspects of the original prompt.
The goal is to create a plan that allows multiple specialized AI agents to work in parallel or sequentially to fulfill the user's request.
Think about the flow of information and what each conceptual agent would need to do.
`,
});

const neuroSynapseDecompositionFlow = ai.defineFlow(
  {
    name: 'neuroSynapseDecompositionFlow',
    inputSchema: DecomposePromptInputSchema,
    outputSchema: DecomposePromptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    // Ensure the output is not null, which can happen if the model fails to generate valid JSON according to the schema.
    if (!output) {
        throw new Error("The AI model failed to generate a valid decomposition. Please try a different prompt or refine your input.");
    }
    return {
        ...output,
        originalPrompt: input.complexPrompt, // Ensure original prompt is always part of the output
    };
  }
);
