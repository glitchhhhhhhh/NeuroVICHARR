
'use server';
/**
 * @fileOverview Neuro Synapse AI flow for complex prompt processing.
 * Leverages Orkes Conductor to orchestrate various AI agents.
 *
 * - neuroSynapse - A function that orchestrates the Neuro Synapse process via Orkes.
 * - NeuroSynapseInput - The input type for the neuroSynapse function.
 * - NeuroSynapseOutput - The return type for the neuroSynapse function.
 */

import { z } from 'genkit';
import { getOrkesClient } from '@/services/orkes-client'; // Orkes client
import type { Workflow, Task } from "@conductorcam/conductor-javascript"; 

// Define a schema for individual sub-tasks (reflects potential output from agents)
const SubTaskSchema = z.object({
  id: z.string().describe('A unique identifier for the sub-task (e.g., task_ref_name_from_orkes).'),
  taskDescription: z.string().describe('A clear, concise description of the sub-task.'),
  assignedAgent: z.string().describe('The type of virtual agent or task definition name used.'),
  status: z.enum(['PLANNED', 'PENDING', 'IN_PROGRESS', 'RUNNING', 'COMPLETED', 'FAILED', 'TIMED_OUT', 'TERMINATED', 'CANCELED', 'CANCELLED', 'SKIPPED', 'COMPLETED_WITH_ERRORS', 'UNKNOWN']).describe('The current status of the sub-task in Orkes.'),
  resultSummary: z.string().describe('A brief summary of the sub-task\'s outcome. Defaults to "Task details not available or task did not produce a summary." if not applicable or provided.'),
  outputData: z.any().optional().describe("Raw output data from the task."),
});
export type SubTask = z.infer<typeof SubTaskSchema>;

const ToolUsageSchema = z.object({
  toolName: z.string().describe('The name of the tool used (simulated or actual).'),
  toolInput: z.any().optional().describe('The input provided to the tool.'),
  toolOutput: z.any().optional().describe('The output received from the tool.'),
});
export type ToolUsage = z.infer<typeof ToolUsageSchema>;

const EthicalComplianceSchema = z.object({
  isCompliant: z.boolean().describe('Whether the overall output is ethically compliant.'),
  issuesFound: z.array(z.string()).optional().describe('A list of ethical issues identified, if any.'),
  confidenceScore: z.number().min(0).max(1).optional().describe('Confidence in the ethical assessment.'),
  remediationSuggestions: z.array(z.string()).optional().describe('Suggestions for remediating ethical issues.'),
});
export type EthicalCompliance = z.infer<typeof EthicalComplianceSchema>;


const NeuroSynapseInputSchema = z.object({
  mainPrompt: z.string().describe('The complex user prompt to be processed by Neuro Synapse.'),
  imageDataUri: z.string().optional().describe("Optional image data for context, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  userContext: z.object({
      recentSearches: z.array(z.string()).optional(),
      visitedPages: z.array(z.string()).optional(),
      currentFocus: z.string().optional(),
  }).optional().describe("User's recent activity for 'Magic Mode' or prompt suggestions."),
});
export type NeuroSynapseInput = z.infer<typeof NeuroSynapseInputSchema>;

const NeuroSynapseOutputSchema = z.object({
  originalPrompt: z.string().describe('The original prompt received from the user.'),
  hasImageContext: z.boolean().describe('Whether image context was provided and considered.'),
  orkesWorkflowId: z.string().optional().describe("The ID of the Orkes workflow execution."),
  orkesWorkflowStatus: z.string().optional().describe("The status of the Orkes workflow execution."),
  decomposedTasks: z.array(SubTaskSchema).describe('An array of sub-tasks as processed by Orkes agents.'),
  synthesizedAnswer: z.string().describe('The final, synthesized answer compiled from the results of all sub-tasks.'),
  workflowExplanation: z.string().describe('An explanation of how the prompt was decomposed, processed, and results synthesized through the orchestrated workflow.'),
  workflowDiagramData: z.object({ 
    nodes: z.array(z.object({ id: z.string(), label: z.string(), type: z.enum(['input', 'image_input', 'process', 'output', 'agent', 'tool', 'decision', 'fork', 'join']) })),
    edges: z.array(z.object({ id: z.string(), source: z.string(), target: z.string(), animated: z.boolean().optional() })),
  }).describe('Data structured for rendering a visual workflow diagram, reflecting the AI\'s process through Orkes.'),
  toolUsages: z.array(ToolUsageSchema).optional().describe('Information about any tools used by agents during the process.'),
  ethicalCompliance: EthicalComplianceSchema.describe('Details from the ethical compliance check performed during the workflow.'),
  agentActivityLog: z.array(z.string()).optional().describe("Log of agent activities and decision points."),
});
export type NeuroSynapseOutput = z.infer<typeof NeuroSynapseOutputSchema>;


const WORKFLOW_NAME = "neuro_synapse_workflow_v1";
const POLLING_INTERVAL_MS = 3000; 
const MAX_POLLING_ATTEMPTS = 40; 

function transformOrkesTaskToSubTask(orkesTask: Task): SubTask {
  let resultSummary = "Task details not available or task did not produce a summary.";
  const defaultTaskDescription = orkesTask.taskDefName || orkesTask.workflowTask?.name || orkesTask.taskType || "Orkes Task";

  if (orkesTask.outputData) {
      if (typeof orkesTask.outputData === 'string') {
          resultSummary = orkesTask.outputData.substring(0, 150) + (orkesTask.outputData.length > 150 ? "..." : "");
      } else if (typeof orkesTask.outputData === 'object' && orkesTask.outputData !== null) {
          const outputData = orkesTask.outputData as Record<string, any>;
          const summaryFields = ['summary', 'synthesizedText', 'generatedCode', 'imageUrl', 'message', 'error'];
          let foundSummary = false;
          for (const field of summaryFields) {
              if (typeof outputData[field] === 'string' && outputData[field].length > 0) {
                  resultSummary = outputData[field].substring(0, 150) + (outputData[field].length > 150 ? "..." : "");
                  foundSummary = true;
                  break;
              }
          }
          if (!foundSummary) {
             const stringifiedOutput = JSON.stringify(orkesTask.outputData);
             resultSummary = stringifiedOutput.substring(0, 150) + (stringifiedOutput.length > 150 ? "..." : "");
          }
      } else if (orkesTask.reasonForIncompletion) {
        resultSummary = `Task Incomplete: ${orkesTask.reasonForIncompletion.substring(0,150)}...`;
      }
  } else if (orkesTask.reasonForIncompletion) {
      resultSummary = `Task Incomplete: ${orkesTask.reasonForIncompletion.substring(0,150)}...`;
  }

  if (resultSummary.trim() === "") {
    resultSummary = "Task completed without a textual summary.";
  }


  return {
    id: orkesTask.taskReferenceName || orkesTask.taskId || `unknown_task_${Date.now()}`,
    taskDescription: defaultTaskDescription,
    assignedAgent: orkesTask.taskDefName || "Unknown Agent", 
    status: (orkesTask.status as SubTask['status']) || "UNKNOWN",
    resultSummary: resultSummary,
    outputData: orkesTask.outputData,
  };
}


export async function neuroSynapse(input: NeuroSynapseInput): Promise<NeuroSynapseOutput> {
  console.log("[Neuro Synapse Flow] Received input:", input.mainPrompt, "Image provided:", !!input.imageDataUri);
  const orkesClient = getOrkesClient();
  let workflowId: string | undefined = undefined;

  try {
    const workflowInput = {
      mainPrompt: input.mainPrompt,
      imageDataUri: input.imageDataUri,
      userContext: input.userContext 
    };
    
    console.log(`[Neuro Synapse Flow] Starting Orkes workflow '${WORKFLOW_NAME}' with input summary:`, JSON.stringify(workflowInput).substring(0, 200) + "...");
    
    const startResponse = await orkesClient.workflowResource.startWorkflow({
        name: WORKFLOW_NAME,
        version: 1, 
        input: workflowInput,
    });

    if (typeof startResponse === 'string') { // Orkes client may return just the ID string
        workflowId = startResponse;
    } else if (typeof startResponse === 'object' && startResponse !== null && 'workflowId' in startResponse && typeof (startResponse as any).workflowId === 'string') {
        workflowId = (startResponse as { workflowId: string }).workflowId;
    } else {
        // Attempt to handle if full Workflow object with executionId is returned by startWorkflow
        // This depends on the Orkes client version and specific method behavior.
        // Conductor-javascript startWorkflow typically returns just the workflowId string.
        // If startWorkflow is typed to return Promise<WorkflowExecutionResponse> which might be { executionId: string }
        // Then use executionId
        if (typeof startResponse === 'object' && startResponse !== null && 'executionId' in startResponse && typeof (startResponse as any).executionId === 'string') {
            workflowId = (startResponse as { executionId: string }).executionId;
        } else {
            console.error("[Neuro Synapse Flow] Unexpected start workflow response structure:", startResponse);
            throw new Error("Failed to start Orkes workflow: Unexpected response format. Expected string workflowId or object with workflowId/executionId.");
        }
    }
    
    if (!workflowId) {
        throw new Error("Failed to start Orkes workflow: No workflowId received or workflowId is invalid.");
    }
    console.log(`[Neuro Synapse Flow] Orkes workflow started with ID: ${workflowId}`);

    let attempts = 0;
    let workflowExecution: Workflow | null = null;

    while (attempts < MAX_POLLING_ATTEMPTS) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
      console.log(`[Neuro Synapse Flow] Polling Orkes workflow ${workflowId}, attempt ${attempts}`);
      
      try {
        workflowExecution = await orkesClient.workflowResource.getWorkflow(workflowId, true); // true to include tasks
      } catch (pollError: any) {
        console.error(`[Neuro Synapse Flow] Error polling workflow ${workflowId}: ${pollError.message}. Retrying...`);
        if (attempts >= MAX_POLLING_ATTEMPTS) {
             throw new Error(`Failed to get workflow status after ${MAX_POLLING_ATTEMPTS} attempts. Last error: ${pollError.message}`);
        }
        continue; 
      }

      if (!workflowExecution) {
          console.warn(`[Neuro Synapse Flow] Workflow ${workflowId} not found during polling. This might be a temporary issue.`);
          if (attempts >= MAX_POLLING_ATTEMPTS) {
             throw new Error(`Workflow ${workflowId} could not be retrieved after ${MAX_POLLING_ATTEMPTS} attempts.`);
          }
          continue;
      }
      
      console.log(`[Neuro Synapse Flow] Workflow ${workflowId} status: ${workflowExecution.status}`);

      if (["COMPLETED", "FAILED", "TIMED_OUT", "TERMINATED", "CANCELLED", "CANCELED"].includes(workflowExecution.status?.toUpperCase() || "")) {
        break;
      }
    }

    if (!workflowExecution || !["COMPLETED", "FAILED", "TIMED_OUT", "TERMINATED", "CANCELLED", "CANCELED"].includes(workflowExecution.status?.toUpperCase() || "")) {
      throw new Error(`Orkes workflow ${workflowId} did not complete within the expected time. Final status: ${workflowExecution?.status || 'UNKNOWN'}`);
    }
    
    if (workflowExecution.status?.toUpperCase() !== "COMPLETED") {
        throw new Error(`Orkes workflow ${workflowId} ended with status ${workflowExecution.status}. Reason: ${workflowExecution.reasonForIncompletion || 'Not specified.'}`);
    }

    const finalOutputData = workflowExecution.output || {};
    
    // The workflow YAML defines outputParameters like `finalAnswer` or `directAnswer`
    // These keys will contain the output of the synthesizer agent.
    const resultKey = finalOutputData.finalAnswer ? 'finalAnswer' : finalOutputData.directAnswer ? 'directAnswer' : null;
    
    let synthesizedAgentOutput: Partial<NeuroSynapseOutput> = {};
    if (resultKey && typeof finalOutputData[resultKey] === 'object' && finalOutputData[resultKey] !== null) {
        synthesizedAgentOutput = finalOutputData[resultKey];
    } else if (Object.keys(finalOutputData).length > 0 && !resultKey) {
        // If no specific key, but output has data, assume the raw output is the synthesizer's output
        console.warn("[Neuro Synapse Flow] Workflow output structure might not match expected 'finalAnswer' or 'directAnswer'. Using raw workflow output for synthesized data.");
        synthesizedAgentOutput = finalOutputData as Partial<NeuroSynapseOutput>;
    }

    const defaultEthicalCompliance: EthicalCompliance = {
      isCompliant: false,
      issuesFound: ["Ethical compliance data missing from workflow output or in unexpected format."],
      confidenceScore: 0.0,
      remediationSuggestions: []
    };
    
    const ethicalComplianceData = synthesizedAgentOutput.ethicalCompliance || finalOutputData.overallEthicalCompliance || defaultEthicalCompliance;


    const output: NeuroSynapseOutput = {
      originalPrompt: input.mainPrompt,
      hasImageContext: !!input.imageDataUri,
      orkesWorkflowId: workflowId,
      orkesWorkflowStatus: workflowExecution.status || "UNKNOWN",
      decomposedTasks: workflowExecution.tasks?.map(transformOrkesTaskToSubTask) || [],
      synthesizedAnswer: synthesizedAgentOutput.synthesizedAnswer || "Orkes workflow completed, but the final synthesized answer is missing or in an unexpected format. Please check Orkes execution logs.",
      workflowExplanation: synthesizedAgentOutput.workflowExplanation || "Workflow explanation not provided by the synthesizer agent.",
      workflowDiagramData: synthesizedAgentOutput.workflowDiagramData || { 
          nodes: [{ id: 'default_node', label: 'Workflow Diagram Unavailable', type: 'process' as const }],
          edges: [] 
      },
      toolUsages: synthesizedAgentOutput.toolUsages || [],
      ethicalCompliance: ethicalComplianceData,
      agentActivityLog: workflowExecution.tasks?.map(t => `Task ${t.taskReferenceName || t.workflowTask?.name || t.taskId} (${t.taskDefName || t.taskType || 'N/A'}) status: ${t.status || 'N/A'}`),
    };
    
    console.log("[Neuro Synapse Flow] Orchestration successful. Final Output Preview:", JSON.stringify(output, null, 2).substring(0,500) + "...");
    return output;

  } catch (error: any) {
    console.error("[Neuro Synapse Flow] Error during Orkes orchestration:", error);
    let errorMessage = "Unknown error during Orkes orchestration.";
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    if (error.response && error.response.data) { 
        console.error("[Neuro Synapse Flow] Orkes API Error Response:", JSON.stringify(error.response.data, null, 2));
        if (error.response.data.message) errorMessage += ` - Orkes: ${error.response.data.message}`;
    } else if (error.body) { 
        try {
            const errorBody = typeof error.body === 'string' ? error.body : await error.text(); 
            console.error("[Neuro Synapse Flow] Orkes API Error Body:", errorBody);
            errorMessage += ` - Orkes Body: ${errorBody.substring(0,100)}...`;
        } catch (parseError) {
            console.error("[Neuro Synapse Flow] Orkes API Error (unparseable body):", errorMessage);
        }
    }
    
    return {
      originalPrompt: input.mainPrompt,
      hasImageContext: !!input.imageDataUri,
      orkesWorkflowId: workflowId,
      orkesWorkflowStatus: "FAILED_IN_CLIENT",
      decomposedTasks: [{
        id: "error_task",
        taskDescription: "Neuro Synapse orchestration process encountered a critical error.",
        assignedAgent: "SystemOrchestrator",
        status: "FAILED",
        resultSummary: errorMessage,
        outputData: { error: errorMessage }
      }],
      synthesizedAnswer: `Neuro Synapse process failed: ${errorMessage}`,
      workflowExplanation: `An error occurred while orchestrating with Orkes. Details: ${errorMessage}`,
      workflowDiagramData: {
        nodes: [{ id: 'error_node', label: 'Orchestration Error', type: 'process' as const }],
        edges: [],
      },
      toolUsages: [],
      ethicalCompliance: {
          isCompliant: false,
          issuesFound: ["System error during orchestration prevented full ethical assessment.", errorMessage],
          confidenceScore: 0.0,
          remediationSuggestions: []
      },
      agentActivityLog: [`Error: ${errorMessage}`]
    };
  }
}
