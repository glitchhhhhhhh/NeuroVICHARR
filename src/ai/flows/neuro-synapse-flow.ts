'use server';
/**
 * @fileOverview Neuro Synapse AI flow for decomposing complex prompts, delegating to virtual agents, and synthesizing results.
 *
 * - neuroSynapse - A function that orchestrates the Neuro Synapse process.
 * - NeuroSynapseInput - The input type for the neuroSynapse function.
 * - NeuroSynapseOutput - The return type for the neuroSynapse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define a schema for individual sub-tasks
const SubTaskSchema = z.object({
  id: z.string().describe('A unique identifier for the sub-task.'),
  taskDescription: z.string().describe('A clear, concise description of the sub-task.'),
  assignedAgent: z.string().describe('The type of virtual agent best suited to handle this sub-task (e.g., "Data Analyst", "Creative Writer", "Fact Checker").'),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).describe('The current status of the sub-task.'),
  resultSummary: z.string().optional().describe('A brief summary of the sub-task\'s outcome if completed.'),
});
export type SubTask = z.infer<typeof SubTaskSchema>;

const NeuroSynapseInputSchema = z.object({
  mainPrompt: z.string().describe('The complex user prompt to be processed by Neuro Synapse.'),
});
export type NeuroSynapseInput = z.infer<typeof NeuroSynapseInputSchema>;

const NeuroSynapseOutputSchema = z.object({
  originalPrompt: z.string().describe('The original prompt received from the user.'),
  decomposedTasks: z.array(SubTaskSchema).describe('An array of sub-tasks identified and delegated by Neuro Synapse.'),
  synthesizedAnswer: z.string().describe('The final, synthesized answer compiled from the results of all sub-tasks.'),
  workflowExplanation: z.string().describe('An explanation of how the prompt was decomposed, processed, and how the results were synthesized.'),
  workflowDiagramData: z.object({
    nodes: z.array(z.object({ id: z.string(), label: z.string(), type: z.enum(['input', 'process', 'output', 'agent']) })),
    edges: z.array(z.object({ id: z.string(), source: z.string(), target: z.string(), animated: z.boolean().optional() })),
  }).describe('Data structured for rendering a visual workflow diagram.'),
});
export type NeuroSynapseOutput = z.infer<typeof NeuroSynapseOutputSchema>;


export async function neuroSynapse(input: NeuroSynapseInput): Promise<NeuroSynapseOutput> {
  return neuroSynapseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'neuroSynapsePrompt',
  input: {schema: NeuroSynapseInputSchema},
  output: {schema: NeuroSynapseOutputSchema},
  prompt: `You are Neuro Synapse, an advanced AI orchestration system. Your primary function is to receive a complex user prompt, intelligently decompose it into smaller, manageable sub-tasks, and then "virtually" delegate these tasks to specialized AI agents. Finally, you synthesize the "results" from these agents into a coherent, comprehensive final answer and provide an explanation of your workflow.

User's Main Prompt:
{{{mainPrompt}}}

Instructions:
1.  **Decomposition**: Analyze the main prompt. Identify 3 to 5 distinct sub-tasks required to fully address it. For each sub-task:
    *   Assign a unique ID (e.g., "task-001", "task-002").
    *   Write a clear taskDescription.
    *   Assign a plausible "assignedAgent" type (e.g., "DataExtractionAgent", "SentimentAnalysisAgent", "ContentGenerationAgent", "KnowledgeBaseAgent", "SummarizationAgent").
    *   Initially, set the status to "pending".
2.  **Virtual Processing (Simulated)**: For each sub-task, simulate its processing. This means:
    *   Change its status to "processing", then to "completed".
    *   Generate a brief, plausible "resultSummary" (1-2 sentences) as if the assigned agent completed the task. This summary should be relevant to the taskDescription.
3.  **Synthesis**: Based on the (simulated) resultSummaries from all completed sub-tasks, formulate a "synthesizedAnswer" to the original user prompt. This answer should be comprehensive and directly address the user's query by integrating the insights from the sub-tasks.
4.  **Workflow Explanation**: Provide a "workflowExplanation" detailing:
    *   How you broke down the main prompt.
    *   Which (virtual) agents handled which sub-tasks.
    *   How the individual results contributed to the final synthesized answer.
5.  **Workflow Diagram Data**: Generate data for a workflow diagram.
    *   Nodes:
        *   One 'input' node for the main prompt (e.g., { id: 'mainPrompt', label: 'User Prompt', type: 'input' }).
        *   One 'process' node for Neuro Synapse itself (e.g., { id: 'neuroSynapse', label: 'Neuro Synapse Orchestrator', type: 'process' }).
        *   For each sub-task, create an 'agent' node representing the assigned agent (e.g., { id: 'agent-task-001', label: 'Agent: DataExtractionAgent', type: 'agent' }).
        *   One 'output' node for the synthesized answer (e.g., { id: 'finalAnswer', label: 'Synthesized Answer', type: 'output' }).
    *   Edges:
        *   From 'mainPrompt' to 'neuroSynapse'.
        *   From 'neuroSynapse' to each 'agent-task-XXX' node.
        *   From each 'agent-task-XXX' node back to 'neuroSynapse' (representing results).
        *   From 'neuroSynapse' to 'finalAnswer'.
        *   All edges should have an id (e.g., "edge-1") and animated set to true.

Output Format:
Ensure your entire response is a single JSON object matching the NeuroSynapseOutputSchema.

Example Sub-Task:
{
  "id": "task-001",
  "taskDescription": "Extract key financial figures from the provided annual report.",
  "assignedAgent": "DataExtractionAgent",
  "status": "completed",
  "resultSummary": "Successfully extracted Q4 revenue of $1.2M and net profit of $250k."
}

Begin!
`,
});


const neuroSynapseFlow = ai.defineFlow(
  {
    name: 'neuroSynapseFlow',
    inputSchema: NeuroSynapseInputSchema,
    outputSchema: NeuroSynapseOutputSchema,
  },
  async (input: NeuroSynapseInput) => {
    const { output } = await prompt(input);

    if (!output) {
      throw new Error('Neuro Synapse failed to generate a response.');
    }
    
    // Ensure the output includes the original prompt
    return {
      ...output,
      originalPrompt: input.mainPrompt,
    };
  }
);