'use server';
/**
 * @fileOverview Neuro Synapse AI flow for decomposing complex prompts, delegating to virtual agents, and synthesizing results.
 * It can now use tools like fetching news headlines and optionally process an input image for context.
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
  assignedAgent: z.string().describe('The type of virtual agent best suited to handle this sub-task (e.g., "Data Analyst", "Creative Writer", "Fact Checker", "VisualContextAnalyzer").'),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).describe('The current status of the sub-task.'),
  resultSummary: z.string().optional().nullable().describe('A brief summary of the sub-task\'s outcome if completed. Can be null if not applicable yet.'),
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
  imageDataUri: z.string().optional().describe("Optional image data for context, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type NeuroSynapseInput = z.infer<typeof NeuroSynapseInputSchema>;

const NeuroSynapseOutputSchema = z.object({
  originalPrompt: z.string().describe('The original prompt received from the user.'),
  hasImageContext: z.boolean().describe('Whether image context was provided and considered.'),
  decomposedTasks: z.array(SubTaskSchema).describe('An array of sub-tasks identified and delegated by Neuro Synapse.'),
  synthesizedAnswer: z.string().describe('The final, synthesized answer compiled from the results of all sub-tasks.'),
  workflowExplanation: z.string().describe('An explanation of how the prompt was decomposed, processed (including image analysis if applicable), and how the results were synthesized.'),
  workflowDiagramData: z.object({
    nodes: z.array(z.object({ id: z.string(), label: z.string(), type: z.enum(['input', 'image_input', 'process', 'output', 'agent', 'tool']) })),
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
  tools: [getTopNewsHeadlines],
  prompt: `You are Neuro Synapse, an advanced AI orchestration system. Your primary function is to receive a complex user prompt, and an OPTIONAL image for context. You will intelligently decompose the prompt into smaller, manageable sub-tasks, and then "virtually" delegate these tasks to specialized AI agents.
If the user's prompt asks about current events, news, or recent happenings, you MUST use the 'getTopNewsHeadlines' tool to fetch relevant information.
If an image is provided ({{{imageDataUri}}}), you MUST analyze its content and incorporate this visual context into your decomposition, task assignment (potentially to a "VisualContextAnalyzer" agent), and synthesis. The image context should enrich the understanding and response to the main prompt.

User's Main Prompt:
{{{mainPrompt}}}

{{#if imageDataUri}}
Visual Context Provided:
Image: {{media url=imageDataUri}}
You MUST analyze this image and incorporate its meaning into your response. Create a specific sub-task for analyzing the image context and assign it to a "VisualContextAnalyzer" or similar agent.
{{else}}
Visual Context Provided: None.
{{/if}}

Instructions:
1.  **Decomposition**: Analyze the main prompt AND THE IMAGE (if provided). Identify 3 to 5 distinct sub-tasks required to fully address it.
    *   If an image is provided, one sub-task MUST be dedicated to analyzing the image and extracting relevant insights. Assign this to a "VisualContextAnalyzer" agent.
    *   For each sub-task: Assign a unique ID, write a taskDescription, assign an "assignedAgent" (e.g., "DataExtractionAgent", "SentimentAnalysisAgent", "NewsAnalysisAgent", "VisualContextAnalyzer"), and set status to "pending". The 'resultSummary' should be null or an empty string if the task is pending or processing.
2.  **Tool Usage (If Applicable)**:
    *   If 'getTopNewsHeadlines' is used, integrate its output.
    *   Document tool usage in 'toolUsages'. Add a 'tool' node in the workflow diagram.
3.  **Virtual Processing (Simulated)**: For each sub-task:
    *   Change status: "pending" -> "processing" -> "completed".
    *   Generate a "resultSummary" (1-2 sentences) ONLY when the task status is "completed". If it's the image analysis task, the summary should describe what was understood from the image. If the task is 'pending' or 'processing', resultSummary should be null or an empty string.
4.  **Synthesis**: Based on resultSummaries (including image analysis if any) and tool outputs, formulate a "synthesizedAnswer". This answer MUST reflect insights from both text prompt and image context if provided.
5.  **Workflow Explanation**: Detail prompt breakdown, agent roles, tool contributions, AND HOW THE IMAGE (if provided) influenced the process and final answer.
6.  **Workflow Diagram Data**:
    *   Nodes: 'input' (mainPrompt), 'image_input' (if imageDataUri is present), 'process' (Neuro Synapse, ensure this node has id: "neuroSynapse"), 'agent' nodes for sub-tasks, 'tool' nodes (if used), 'output' (finalAnswer).
    *   If 'imageDataUri' is present, add an 'image_input' node (e.g., { id: 'imageContext', label: 'Image Context', type: 'image_input' }) and connect it to the main 'neuroSynapse' process node.
    *   Edges: Connect nodes logically (e.g., 'mainPrompt' & 'imageContext' (if present) to 'neuroSynapse', 'neuroSynapse' to agents/tools, agents/tools to 'neuroSynapse', 'neuroSynapse' to 'finalAnswer'). All edges animated. Each edge needs a unique id, e.g., "edge-1", "edge-2".
7.  **Tool Usage Reporting**: If the getTopNewsHeadlines tool or any other tool is invoked, populate the toolUsages array in the output. Each entry should specify toolName, toolInput (what was passed to the tool), and toolOutput (what the tool returned).

Output Format:
Ensure your entire response is a single JSON object matching the NeuroSynapseOutputSchema.

Example Sub-Task for Image Analysis:
{
  "id": "task-img-001",
  "taskDescription": "Analyze the provided image of a city skyline at night to identify architectural styles, mood, and potential points of interest relevant to the user's query about urban innovation.",
  "assignedAgent": "VisualContextAnalyzer",
  "status": "completed",
  "resultSummary": "The image depicts a modern, densely populated city at night with illuminated skyscrapers, suggesting themes of technological advancement and high-density living. Prominent features include a unique spiral tower and extensive transportation networks."
}
Example Sub-Task (Pending):
{
  "id": "task-data-002",
  "taskDescription": "Extract key financial data from the latest quarterly report.",
  "assignedAgent": "DataExtractionAgent",
  "status": "pending",
  "resultSummary": null 
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
    
    // Ensure the main process node has the ID "neuroSynapse"
    const workflowData = llmResponse.output.workflowDiagramData;
    if (workflowData && workflowData.nodes) {
      const processNode = workflowData.nodes.find(node => node.type === 'process');
      if (processNode && processNode.id !== 'neuroSynapse') {
        // Attempt to correct if a process node exists with a different ID
        // This is a fallback, the prompt should ideally enforce this.
        const neuroSynapseNode = workflowData.nodes.find(node => node.id === 'neuroSynapse');
        if(!neuroSynapseNode && processNode) {
           // If no node with 'neuroSynapse' ID exists, rename the first 'process' node.
           processNode.id = 'neuroSynapse';
           // Update edges targeting the old processNode.id to 'neuroSynapse'
           if (workflowData.edges) {
             workflowData.edges.forEach(edge => {
               if (edge.source === processNode.label || edge.target === processNode.label || edge.source === "Process" || edge.target === "Process") { // common LLM mistakes
                 if (edge.source !== "input" && edge.source !== "imageContext" && edge.source !== "output" && !edge.source.startsWith("agent-") && !edge.source.startsWith("tool-") ) edge.source = 'neuroSynapse';
                 if (edge.target !== "input" && edge.target !== "imageContext" && edge.target !== "output" && !edge.target.startsWith("agent-") && !edge.target.startsWith("tool-") ) edge.target = 'neuroSynapse';
               }
             });
           }
        }
      } else if (!processNode) {
        // If no process node, add one. This is less ideal.
        workflowData.nodes.push({ id: 'neuroSynapse', label: 'Neuro Synapse Process', type: 'process' });
      }
    }


    return {
      ...llmResponse.output,
      originalPrompt: input.mainPrompt,
      hasImageContext: !!input.imageDataUri, // Explicitly set based on input
      workflowDiagramData: workflowData, 
    };
  }
);

