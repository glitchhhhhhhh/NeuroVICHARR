'use server';
/**
 * @fileOverview Neuro Synapse AI flow using Orkes Conductor for orchestration.
 * It starts an Orkes workflow which calls various AI agent microservices.
 *
 * - neuroSynapse - A function that orchestrates the Neuro Synapse process via Orkes.
 * - NeuroSynapseInput - The input type for the neuroSynapse function.
 * - NeuroSynapseOutput - The return type for the neuroSynapse function.
 */

import { z } from 'genkit';
import { getOrkesClient } from '@/services/orkes-client'; // Mock Orkes client

// Define a schema for individual sub-tasks (consistent with existing UI if possible)
const SubTaskSchema = z.object({
  id: z.string().describe('A unique identifier for the sub-task (e.g., Orkes task ID or ref name).'),
  taskDescription: z.string().describe('A clear, concise description of the sub-task.'),
  assignedAgent: z.string().describe('The type of virtual agent or Orkes task name.'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'TIMED_OUT', 'CANCELLED']).describe('The current status of the sub-task.'),
  resultSummary: z.string().optional().nullable().describe('A brief summary of the sub-task\'s outcome if completed.'),
});
export type SubTask = z.infer<typeof SubTaskSchema>;

const ToolUsageSchema = z.object({ // Keep if agents might still report tool usage
  toolName: z.string().describe('The name of the tool used.'),
  toolInput: z.any().optional().describe('The input provided to the tool.'),
  toolOutput: z.any().optional().describe('The output received from the tool.'),
});
export type ToolUsage = z.infer<typeof ToolUsageSchema>;

export const NeuroSynapseInputSchema = z.object({
  mainPrompt: z.string().describe('The complex user prompt to be processed by Neuro Synapse.'),
  imageDataUri: z.string().optional().describe("Optional image data for context, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type NeuroSynapseInput = z.infer<typeof NeuroSynapseInputSchema>;

// This output schema should align with what the ResultSynthesizer agent (and Orkes workflow) produces.
export const NeuroSynapseOutputSchema = z.object({
  originalPrompt: z.string().describe('The original prompt received from the user.'),
  hasImageContext: z.boolean().describe('Whether image context was provided and considered.'),
  decomposedTasks: z.array(SubTaskSchema).describe('An array of sub-tasks representing Orkes tasks and their status/results.'),
  synthesizedAnswer: z.string().describe('The final, synthesized answer compiled from the results of all sub-tasks.'),
  workflowExplanation: z.string().describe('An explanation of how the prompt was decomposed and processed by the Orkes workflow.'),
  workflowDiagramData: z.object({
    nodes: z.array(z.object({ id: z.string(), label: z.string(), type: z.enum(['input', 'image_input', 'process', 'output', 'agent', 'tool']) })),
    edges: z.array(z.object({ id: z.string(), source: z.string(), target: z.string(), animated: z.boolean().optional() })),
  }).describe('Data structured for rendering a visual workflow diagram, reflecting Orkes execution.'),
  toolUsages: z.array(ToolUsageSchema).optional().describe('Information about any tools used by agents during the workflow.'),
  orkesWorkflowId: z.string().optional().describe('The ID of the Orkes workflow execution.'),
  ethicalComplianceDetails: z.any().optional().describe('Details from the ethical compliance check.'),
});
export type NeuroSynapseOutput = z.infer<typeof NeuroSynapseOutputSchema>;


export async function neuroSynapse(input: NeuroSynapseInput): Promise<NeuroSynapseOutput> {
  const orkesClient = getOrkesClient();
  const ngrokBaseUrl = process.env.NGROK_BASE_URL;

  if (!ngrokBaseUrl) {
    throw new Error("NGROK_BASE_URL environment variable is not set. Orkes workflow requires this to call back to local agent services.");
  }
  
  const workflowName = "neuro_synapse_workflow_v1"; // Matches YAML
  const workflowInput = {
    prompt: input.mainPrompt,
    imageDataUri: input.imageDataUri,
    ngrokBaseUrl: ngrokBaseUrl, // Pass ngrok URL to the workflow
  };

  try {
    console.log(`Starting Orkes workflow '${workflowName}' with input:`, workflowInput);
    const { workflowId } = await orkesClient.workflowResource.startWorkflow({
      name: workflowName,
      input: workflowInput,
      // version: 1 // Optional, if you have multiple versions
    });
    console.log(`Orkes workflow started with ID: ${workflowId}`);

    // Poll for completion (in a real app, use webhooks or a more robust polling strategy)
    let workflowExecution;
    const maxAttempts = 20; // ~100 seconds with 5s interval
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      workflowExecution = await orkesClient.workflowResource.getWorkflow(workflowId, true); // true to include tasks
      console.log(`Polling Orkes workflow ${workflowId}, Status: ${workflowExecution.status}`);

      if (['COMPLETED', 'FAILED', 'TIMED_OUT', 'TERMINATED'].includes(workflowExecution.status || '')) {
        break;
      }
      attempts++;
    }

    if (!workflowExecution || !['COMPLETED', 'FAILED', 'TIMED_OUT', 'TERMINATED'].includes(workflowExecution.status || '')) {
      throw new Error(`Orkes workflow ${workflowId} did not complete in the expected time. Last status: ${workflowExecution?.status}`);
    }

    if (workflowExecution.status !== 'COMPLETED' || !workflowExecution.output) {
        console.error("Orkes workflow execution failed or has no output:", workflowExecution);
      throw new Error(`Orkes workflow ${workflowId} did not complete successfully. Status: ${workflowExecution.status}. Output: ${JSON.stringify(workflowExecution.output)}`);
    }
    
    console.log("Orkes workflow completed. Output:", workflowExecution.output);

    // Transform Orkes workflow output to NeuroSynapseOutputSchema
    // The ResultSynthesizer agent's output should ideally match this structure.
    // If not, this is where you'd map it.
    // The mock Orkes client already produces output somewhat aligned.
    const outputData = workflowExecution.output;

    return {
      originalPrompt: input.mainPrompt,
      hasImageContext: !!input.imageDataUri,
      decomposedTasks: outputData.decomposedTasks || [], // Assuming ResultSynthesizer provides this
      synthesizedAnswer: outputData.finalAnswer || "No synthesized answer from workflow.",
      workflowExplanation: outputData.workflowExplanation || "Workflow executed by Orkes Conductor.",
      workflowDiagramData: outputData.workflowDiagramData || { nodes: [], edges: [] }, // Crucial for UI
      toolUsages: outputData.toolUsages || [],
      orkesWorkflowId: workflowId,
      ethicalComplianceDetails: outputData.ethicalComplianceDetails,
    };

  } catch (error: any) {
    console.error("Error in neuroSynapse (Orkes) flow:", error);
    // Return a structured error that the UI can handle
    return {
      originalPrompt: input.mainPrompt,
      hasImageContext: !!input.imageDataUri,
      decomposedTasks: [{
        id: "error_task",
        taskDescription: "Workflow orchestration failed.",
        assignedAgent: "System",
        status: "FAILED",
        resultSummary: error.message,
      }],
      synthesizedAnswer: `Neuro Synapse (Orkes) process failed: ${error.message}`,
      workflowExplanation: `An error occurred while trying to execute the Orkes workflow. ${error.message}`,
      workflowDiagramData: {
        nodes: [{ id: 'error', label: 'Error Occurred', type: 'output' }],
        edges: [],
      },
      toolUsages: [],
      orkesWorkflowId: undefined,
    };
  }
}