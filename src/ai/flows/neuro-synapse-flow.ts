'use server';
/**
 * @fileOverview Neuro Synapse AI flow for complex prompt processing.
 * It analyzes, plans, simulates execution, performs an ethical check, and synthesizes results.
 *
 * - neuroSynapse - A function that orchestrates the Neuro Synapse process.
 * - NeuroSynapseInput - The input type for the neuroSynapse function.
 * - NeuroSynapseOutput - The return type for the neuroSynapse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define a schema for individual sub-tasks
const SubTaskSchema = z.object({
  id: z.string().describe('A unique identifier for the sub-task (e.g., task-1).'),
  taskDescription: z.string().describe('A clear, concise description of the sub-task.'),
  assignedAgent: z.string().describe('The type of virtual agent assigned to this sub-task (e.g., "DataAnalyst", "CreativeWriter").'),
  status: z.enum(['PLANNED', 'SIMULATED_COMPLETE', 'SIMULATED_FAILED', 'ETHICAL_REVIEW_PENDING']).describe('The current status of the sub-task in the simulation.'),
  resultSummary: z.string().optional().nullable().describe('A brief summary of the sub-task\'s simulated outcome if completed.'),
});
export type SubTask = z.infer<typeof SubTaskSchema>;

const ToolUsageSchema = z.object({
  toolName: z.string().describe('The name of the tool used (simulated).'),
  toolInput: z.any().optional().describe('The input provided to the tool (simulated).'),
  toolOutput: z.any().optional().describe('The output received from the tool (simulated).'),
});
export type ToolUsage = z.infer<typeof ToolUsageSchema>;

const EthicalComplianceSchema = z.object({
  isCompliant: z.boolean().describe('Whether the overall output is ethically compliant.'),
  issuesFound: z.array(z.string()).optional().describe('A list of ethical issues identified, if any.'),
  confidenceScore: z.number().min(0).max(1).optional().describe('Confidence in the ethical assessment.'),
  remediationSuggestions: z.array(z.string()).optional().describe('Suggestions for remediating ethical issues.'),
});

const NeuroSynapseInputSchema = z.object({
  mainPrompt: z.string().describe('The complex user prompt to be processed by Neuro Synapse.'),
  imageDataUri: z.string().optional().describe("Optional image data for context, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type NeuroSynapseInput = z.infer<typeof NeuroSynapseInputSchema>;

const NeuroSynapseOutputSchema = z.object({
  originalPrompt: z.string().describe('The original prompt received from the user.'),
  hasImageContext: z.boolean().describe('Whether image context was provided and considered.'),
  decomposedTasks: z.array(SubTaskSchema).describe('An array of sub-tasks as planned and simulated by the AI.'),
  synthesizedAnswer: z.string().describe('The final, synthesized answer compiled from the results of all sub-tasks.'),
  workflowExplanation: z.string().describe('An explanation of how the prompt was decomposed, processed, and results synthesized by the AI.'),
  workflowDiagramData: z.object({
    nodes: z.array(z.object({ id: z.string(), label: z.string(), type: z.enum(['input', 'image_input', 'process', 'output', 'agent', 'tool']) })),
    edges: z.array(z.object({ id: z.string(), source: z.string(), target: z.string(), animated: z.boolean().optional() })),
  }).describe('Data structured for rendering a visual workflow diagram, reflecting the AI\'s simulated process.'),
  toolUsages: z.array(ToolUsageSchema).optional().describe('Information about any tools (simulated) used by agents during the process.'),
  ethicalCompliance: EthicalComplianceSchema.describe('Details from the ethical compliance check performed by the AI.'),
});
export type NeuroSynapseOutput = z.infer<typeof NeuroSynapseOutputSchema>;

export async function neuroSynapse(input: NeuroSynapseInput): Promise<NeuroSynapseOutput> {
  return neuroSynapseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'neuroSynapseOrchestratorPrompt',
  input: { schema: NeuroSynapseInputSchema },
  output: { schema: NeuroSynapseOutputSchema },
  prompt: `You are Neuro Synapse, an advanced AI orchestrator. Your task is to process a complex user prompt, potentially with image context, by performing the following steps:

1.  **Analyze Input**:
    *   Understand the core request in '{{{mainPrompt}}}'.
    *   Identify key entities, intents, and desired outcomes.
    *   If '{{#if imageDataUri}}imageDataUri is provided{{else}}no image data is provided{{/if}}', note whether image analysis is relevant. If an image is provided, incorporate its content into your analysis. Image: {{#if imageDataUri}}{{media url=imageDataUri}}{{else}}None{{/if}}.

2.  **Decompose and Plan (Sub-Tasks)**:
    *   Break down the main prompt into 3-5 logical sub-tasks.
    *   For each sub-task:
        *   Assign a unique ID (e.g., "task-1", "task-2").
        *   Write a clear 'taskDescription'.
        *   Assign a descriptive virtual 'assignedAgent' type (e.g., "KnowledgeResearcher", "CodeGenerator", "ImageAnalyst", "CreativeSynthesizer", "EthicalReviewer").
        *   Set initial 'status' to "PLANNED".

3.  **Simulate Execution**:
    *   For each PLANNED sub-task:
        *   Generate a plausible, concise 'resultSummary' as if the assigned virtual agent completed it. This summary should be a few sentences. Ensure this field is always a string, e.g., "Task simulation complete." or "Simulation indicated data insufficiency.".
        *   If the task involves simulated tool usage (e.g., a "WebSearcher" agent using a "searchEngine" tool), describe this in 'toolUsages' with 'toolName', 'toolInput' (simulated query), and 'toolOutput' (simulated search results summary).
        *   Update its 'status' to "SIMULATED_COMPLETE". If simulation is not feasible for a task, mark it "SIMULATED_FAILED" and explain why in the resultSummary. Make sure resultSummary is always a string, even if brief like "Simulation not applicable for this task." if it's SIMULATED_FAILED.

4.  **Perform Ethical Compliance Check**:
    *   Review the original prompt, your plan, and all simulated results.
    *   Determine if the overall process and potential output are ethically compliant ('isCompliant': true/false).
    *   List any 'issuesFound'.
    *   Provide a 'confidenceScore' (0.0-1.0) for your ethical assessment.
    *   Suggest 'remediationSuggestions' if non-compliant.

5.  **Synthesize Final Answer**:
    *   Based on all simulated sub-task results and the ethical check:
        *   If ethically compliant and all critical tasks succeeded: Craft a comprehensive 'synthesizedAnswer' addressing the original prompt.
        *   If not compliant or critical tasks failed: The 'synthesizedAnswer' should state this, explain the issues, and include remediation suggestions.

6.  **Explain Workflow**:
    *   Provide a 'workflowExplanation' detailing your analysis, planning, simulation steps (including how image context was used, if any), the ethical review, and how the final answer was synthesized.

7.  **Generate Workflow Diagram Data**:
    *   Create 'workflowDiagramData' with 'nodes' and 'edges' to visually represent your process:
        *   Nodes: Include 'input' (for mainPrompt), 'image_input' (if imageDataUri provided), one 'process' node for Neuro Synapse itself, 'agent' nodes for each virtual agent type you assigned, 'tool' nodes if any tools were simulated, and an 'output' node for the final answer.
        *   Edges: Connect nodes logically to show data flow (e.g., input -> Neuro Synapse -> agent-1 -> Neuro Synapse -> output). Ensure all edges have an 'id' and 'animated: true'.

Output MUST be a single JSON object matching the NeuroSynapseOutputSchema. Make sure all fields, especially 'resultSummary' within 'decomposedTasks', are present and correctly typed (strings for summaries).

User Prompt: {{{mainPrompt}}}
{{#if imageDataUri}}Image Provided: Yes (content is embedded above for your analysis).{{else}}Image Provided: No.{{/if}}

Begin Orchestration.
`,
});


const neuroSynapseFlow = ai.defineFlow(
  {
    name: 'neuroSynapseFlow',
    inputSchema: NeuroSynapseInputSchema,
    outputSchema: NeuroSynapseOutputSchema,
  },
  async (input: NeuroSynapseInput) => {
    try {
      console.log("[Neuro Synapse Flow] Received input:", input.mainPrompt, "Image provided:", !!input.imageDataUri);
      const llmResponse = await prompt(input);

      if (!llmResponse.output) {
        console.error("[Neuro Synapse Flow] LLM failed to generate a structured response.");
        throw new Error('Neuro Synapse AI failed to generate a response.');
      }
      
      console.log("[Neuro Synapse Flow] LLM Output received, processing...");
      
      const processedOutput = {
        ...llmResponse.output,
        decomposedTasks: (llmResponse.output.decomposedTasks || []).map(task => ({
          ...task,
          // Ensure resultSummary is always a string, even if it was null/undefined from LLM
          resultSummary: task.resultSummary === null || task.resultSummary === undefined ? "No summary provided." : String(task.resultSummary),
          // Ensure status is one of the allowed enum values, default to PLANNED if invalid
          status: ['PLANNED', 'SIMULATED_COMPLETE', 'SIMULATED_FAILED', 'ETHICAL_REVIEW_PENDING'].includes(task.status?.toUpperCase()) 
                  ? task.status.toUpperCase() as SubTask['status'] 
                  : 'PLANNED' as SubTask['status'],
        })),
         toolUsages: llmResponse.output.toolUsages || [], // Ensure toolUsages is an array
         ethicalCompliance: llmResponse.output.ethicalCompliance || { isCompliant: false, issuesFound: ["Ethical compliance data missing from LLM response."]},
      };
      
      console.log("[Neuro Synapse Flow] Validating processed output...");
      const validatedOutput = NeuroSynapseOutputSchema.parse({
        ...processedOutput,
        originalPrompt: input.mainPrompt,
        hasImageContext: !!input.imageDataUri,
      });
      console.log("[Neuro Synapse Flow] Output validated successfully.");
      return validatedOutput;

    } catch (error: any) {
      console.error("Error in neuroSynapseFlow:", error.message);
      if (error instanceof z.ZodError) {
          console.error("Zod validation errors:", error.errors);
      }
      // Return a structured error that the UI can attempt to handle
      return {
        originalPrompt: input.mainPrompt,
        hasImageContext: !!input.imageDataUri,
        decomposedTasks: [{
          id: "error_task",
          taskDescription: "Neuro Synapse process encountered a critical error.",
          assignedAgent: "SystemOrchestrator",
          status: "SIMULATED_FAILED" as const, 
          resultSummary: error.message || "Unknown error during processing.",
        }],
        synthesizedAnswer: `Neuro Synapse process failed: ${error.message || "Unknown error. Please check logs."}`,
        workflowExplanation: `An error occurred within the Neuro Synapse AI orchestrator. Details: ${error.message}`,
        workflowDiagramData: {
          nodes: [{ id: 'error', label: 'Processing Error', type: 'output' as const }],
          edges: [],
        },
        toolUsages: [],
        ethicalCompliance: {
            isCompliant: false,
            issuesFound: ["System error prevented full ethical assessment.", error.message],
            confidenceScore: 0.1,
        }
      };
    }
  }
);
