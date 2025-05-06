'use server';
/**
 * @fileOverview Neuro Synapse AI flow for decomposing complex prompts, delegating to virtual agents, and synthesizing results.
 * It can now use tools like fetching news headlines.
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

const ToolUsageSchema = z.object({
  toolName: z.string().describe('The name of the tool used.'),
  toolInput: z.any().optional().describe('The input provided to the tool.'),
  toolOutput: z.any().optional().describe('The output received from the tool.'),
});
export type ToolUsage = z.infer<typeof ToolUsageSchema>;

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
    nodes: z.array(z.object({ id: z.string(), label: z.string(), type: z.enum(['input', 'process', 'output', 'agent', 'tool']) })),
    edges: z.array(z.object({ id: z.string(), source: z.string(), target: z.string(), animated: z.boolean().optional() })),
  }).describe('Data structured for rendering a visual workflow diagram.'),
  toolUsages: z.array(ToolUsageSchema).optional().describe('Information about any tools used during the process.'),
});
export type NeuroSynapseOutput = z.infer<typeof NeuroSynapseOutputSchema>;


export async function neuroSynapse(input: NeuroSynapseInput): Promise<NeuroSynapseOutput> {
  return neuroSynapseFlow(input);
}

// Define a tool to get top news headlines
const getTopNewsHeadlines = ai.defineTool(
  {
    name: 'getTopNewsHeadlines',
    description: 'Returns a list of current top news headlines on various topics like world events, technology, and business. Use this if the user asks about current events or news.',
    inputSchema: z.object({
        category: z.string().optional().describe("Optional category like 'technology', 'business', 'sports', 'world'.")
    }),
    outputSchema: z.array(z.object({
        headline: z.string().describe("The news headline."),
        source: z.string().describe("The news source (e.g., 'Tech Times', 'Global News Agency')."),
        summary: z.string().optional().describe("A brief summary of the news article if available.")
    })),
  },
  async (input) => {
    // Stubbed implementation
    console.log('Tool getTopNewsHeadlines called with input:', input);
    const headlines = [
      { headline: "Global Summit Addresses Climate Change Urgently", source: "World News Today", summary: "Leaders from 150 nations convene to discuss new targets for emission reductions and green energy initiatives."},
      { headline: "Tech Giant Unveils Next-Generation Quantum Processor", source: "FutureTech Magazine", summary: "The new 'Phoenix QX' processor promises exponential speed-ups for complex computations, potentially revolutionizing AI and drug discovery."},
      { headline: "Stock Market Hits Record High Amidst Economic Optimism", source: "Financial Chronicle", summary: "Positive economic indicators and strong corporate earnings reports have fueled a bull run, pushing major indices to unprecedented levels."},
      { headline: "Breakthrough in Cancer Research: New Therapy Shows Promise", source: "Health & Science Journal"},
      { headline: "SpaceX Launches Starlink Satellites, Expanding Global Coverage", source: "AstroNews"},
    ];
    if (input?.category) {
        return headlines.filter(h => h.source.toLowerCase().includes(input.category!) || h.headline.toLowerCase().includes(input.category!)).slice(0,3);
    }
    return headlines.slice(0, Math.floor(Math.random() * 3) + 2); // Return 2-4 random headlines
  }
);


const prompt = ai.definePrompt({
  name: 'neuroSynapsePrompt',
  input: {schema: NeuroSynapseInputSchema},
  output: {schema: NeuroSynapseOutputSchema},
  tools: [getTopNewsHeadlines], // Make the tool available to the prompt
  prompt: `You are Neuro Synapse, an advanced AI orchestration system. Your primary function is to receive a complex user prompt, intelligently decompose it into smaller, manageable sub-tasks, and then "virtually" delegate these tasks to specialized AI agents. If the user's prompt asks about current events, news, or recent happenings, you MUST use the 'getTopNewsHeadlines' tool to fetch relevant information and incorporate it into your response. Finally, you synthesize the "results" from these agents (and any tools used) into a coherent, comprehensive final answer and provide an explanation of your workflow.

User's Main Prompt:
{{{mainPrompt}}}

Instructions:
1.  **Decomposition**: Analyze the main prompt. Identify 3 to 5 distinct sub-tasks required to fully address it. For each sub-task:
    *   Assign a unique ID (e.g., "task-001", "task-002").
    *   Write a clear taskDescription.
    *   Assign a plausible "assignedAgent" type (e.g., "DataExtractionAgent", "SentimentAnalysisAgent", "NewsAnalysisAgent", "ContentGenerationAgent", "KnowledgeBaseAgent", "SummarizationAgent").
    *   Initially, set the status to "pending".
2.  **Tool Usage (If Applicable)**:
    *   If the 'getTopNewsHeadlines' tool is used, ensure its output is integrated into a relevant sub-task's resultSummary or directly into the synthesizedAnswer.
    *   Document the usage of any tool in the 'toolUsages' array, including toolName, input, and output. Add a node of type 'tool' in the workflow diagram for each tool used, and connect it appropriately.
3.  **Virtual Processing (Simulated)**: For each sub-task, simulate its processing. This means:
    *   Change its status to "processing", then to "completed".
    *   Generate a brief, plausible "resultSummary" (1-2 sentences) as if the assigned agent completed the task. This summary should be relevant to the taskDescription and incorporate tool outputs if applicable.
4.  **Synthesis**: Based on the (simulated) resultSummaries from all completed sub-tasks and any tool outputs, formulate a "synthesizedAnswer" to the original user prompt. This answer should be comprehensive and directly address the user's query.
5.  **Workflow Explanation**: Provide a "workflowExplanation" detailing:
    *   How you broke down the main prompt.
    *   Which (virtual) agents handled which sub-tasks.
    *   If any tools were used, explain what they did and how their output contributed.
    *   How the individual results contributed to the final synthesized answer.
6.  **Workflow Diagram Data**: Generate data for a workflow diagram.
    *   Nodes:
        *   One 'input' node for the main prompt (e.g., { id: 'mainPrompt', label: 'User Prompt', type: 'input' }).
        *   One 'process' node for Neuro Synapse itself (e.g., { id: 'neuroSynapse', label: 'Neuro Synapse Orchestrator', type: 'process' }).
        *   For each sub-task, create an 'agent' node representing the assigned agent (e.g., { id: 'agent-task-001', label: 'Agent: DataExtractionAgent', type: 'agent' }).
        *   If a tool is used, create a 'tool' node (e.g., { id: 'tool-getTopNews', label: 'Tool: Get News', type: 'tool' }).
        *   One 'output' node for the synthesized answer (e.g., { id: 'finalAnswer', label: 'Synthesized Answer', type: 'output' }).
    *   Edges:
        *   From 'mainPrompt' to 'neuroSynapse'.
        *   From 'neuroSynapse' to each 'agent-task-XXX' node.
        *   If a tool is used, from 'neuroSynapse' to the 'tool-XXX' node, and from 'tool-XXX' node back to 'neuroSynapse' or to a relevant agent task node.
        *   From each 'agent-task-XXX' node back to 'neuroSynapse' (representing results).
        *   From 'neuroSynapse' to 'finalAnswer'.
        *   All edges should have an id (e.g., "edge-1") and animated set to true.
7. **Tool Usage Reporting**: If the \`getTopNewsHeadlines\` tool or any other tool is invoked, populate the \`toolUsages\` array in the output. Each entry should specify \`toolName\`, \`toolInput\` (what was passed to the tool), and \`toolOutput\` (what the tool returned).

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

Example Tool Usage:
{
  "toolName": "getTopNewsHeadlines",
  "toolInput": {"category": "technology"},
  "toolOutput": [{"headline": "AI Breakthrough Announced", "source": "Tech News Daily", "summary": "New AI model surpasses human performance..."}]
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
    const llmResponse = await prompt(input);

    if (!llmResponse.output) {
      throw new Error('Neuro Synapse failed to generate a response.');
    }
    
    // Ensure the output includes the original prompt
    // And also reconstruct toolUsages if Genkit provides it in a structured way (it might be part of response.usage.tools)
    // For now, assuming the LLM itself constructs the toolUsages array as per the prompt instructions.
    // If Genkit's `response.usage.tools` is available and populated, we might prefer that for accuracy.
    // const toolCalls = llmResponse.usage?.tools; // Example: this path may vary based on Genkit version/structure

    return {
      ...llmResponse.output,
      originalPrompt: input.mainPrompt,
      // toolUsages: llmResponse.output.toolUsages || (toolCalls ? toolCalls.map(tc => ({ toolName: tc.tool, toolInput: tc.input, toolOutput: tc.output })) : undefined),
    };
  }
);
