
import { OrkesConductorClient, type OrkesConductorClientConfig, type TaskDef, type WorkflowDef } from "@conductorcam/conductor-javascript";

// Ensure environment variables are loaded
import dotenv from 'dotenv';
dotenv.config();

let orkesClientInstance: OrkesConductorClient | MockOrkesConductorClient | null = null;

/**
 * MOCK IMPLEMENTATION of OrkesConductorClient for local development without real Orkes connection.
 * This allows the UI and flow logic to be developed, but no actual Orkes calls are made.
 */
class MockOrkesConductorClient {
  private mockWorkflows: Map<string, any> = new Map();
  private mockTasks: Map<string, any> = new Map();
  private workflowCounter = 0;

  constructor(config?: OrkesConductorClientConfig) {
    console.warn("MockOrkesConductorClient initialized. Network calls to Orkes will be simulated. Config (if any):", config ? "Provided" : "Not Provided");
  }

  public get workflowResource() {
    return {
      startWorkflow: async (params: { name: string; input: any; version?: number }): Promise<string> => { // Changed to return string directly
        console.log(`[MockOrkes] Starting workflow: ${params.name}`, params.input);
        this.workflowCounter++;
        const workflowId = `mock_wf_${Date.now()}_${this.workflowCounter}`;
        
        const initialTasks = [
            { id: "mock_analyzer_task", taskDescription: "Analyze user prompt", assignedAgent: "AnalyzerAgent", status: "RUNNING", resultSummary: "Analyzing...", outputData: {} },
        ];

        this.mockWorkflows.set(workflowId, {
          workflowId: workflowId,
          status: "RUNNING",
          input: params.input,
          name: params.name,
          tasks: initialTasks.map(t => ({...t, taskReferenceName: t.id, taskDefName: t.assignedAgent, workflowTask: {name: t.taskDescription}})),
          output: {},
          startTime: Date.now(),
          reasonForIncompletion: null,
        });
        
        // Simulate async processing
        setTimeout(() => {
          const wf = this.mockWorkflows.get(workflowId);
          if (wf && wf.status === "RUNNING") {
            wf.status = "COMPLETED";
            wf.tasks[0].status = "COMPLETED";
            wf.tasks[0].resultSummary = "Mock analysis complete.";
            wf.tasks.push(
                { id: "mock_planner_task", taskDescription: "Plan execution", assignedAgent: "PlannerAgent", status: "COMPLETED", resultSummary: "Plan generated.", outputData: { planSummary: "Mock execution plan."} , taskReferenceName: "mock_planner_task", taskDefName: "PlannerAgent", workflowTask: {name: "Plan execution"}},
                { id: "mock_executor_task_1", taskDescription: "Execute sub-task 1", assignedAgent: "ExecutorText", status: "COMPLETED", resultSummary: "Sub-task 1 done.", outputData: { synthesizedText: "Mock text result 1"} , taskReferenceName: "mock_executor_task_1", taskDefName: "ExecutorText", workflowTask: {name: "Execute sub-task 1"}},
                { id: "mock_ethical_check_task", taskDescription: "Ethical review", assignedAgent: "EthicalChecker", status: "COMPLETED", resultSummary: "Ethical check passed.", outputData: { isCompliant: true, issuesFound:[], confidenceScore: 0.95} , taskReferenceName: "mock_ethical_check_task", taskDefName: "EthicalChecker", workflowTask: {name: "Ethical review"}},
                { id: "mock_synthesizer_task", taskDescription: "Synthesize results", assignedAgent: "ResultSynthesizer", status: "COMPLETED", resultSummary: "Final answer synthesized.", outputData: {} , taskReferenceName: "mock_synthesizer_task", taskDefName: "ResultSynthesizer", workflowTask: {name: "Synthesize results"}}
            );

            // Simulate output based on input (very simplified) for NeuroSynapseOutputSchema
            const synthesizedAnswerDetails = { 
                originalPrompt: params.input?.mainPrompt || 'N/A',
                hasImageContext: !!params.input?.imageDataUri,
                synthesizedAnswer: `Mock synthesized answer for prompt: '${params.input?.mainPrompt || 'Not provided.'}' The process involved analyzing the prompt, creating a plan, executing sub-tasks (like text generation), performing an ethical review, and finally combining all results.`,
                workflowExplanation: "Mock Workflow Explanation: The user's prompt was first analyzed to understand its core components. A plan was then formulated to address these components using specialized agents. For instance, a text generation agent might have been invoked. All outputs were then reviewed for ethical compliance before being synthesized into this final response. The workflow diagram visually represents this orchestrated process.",
                // Decomposed tasks are already in wf.tasks, they will be transformed by neuro-synapse-flow
                toolUsages: [{ toolName: "MockSearchTool", toolInput: { query: "example" }, toolOutput: { results: ["Mock result 1"] } }],
                ethicalCompliance: { isCompliant: true, issuesFound: [], confidenceScore: 0.95, remediationSuggestions: [] },
                workflowDiagramData: {
                    nodes: [
                        {id: 'input_prompt', label: 'User Prompt', type: 'input' as const}, 
                        {id: 'analyzer', label: 'Analyzer Agent', type: 'agent' as const},
                        {id: 'planner', label: 'Planner Agent', type: 'agent'as const},
                        {id: 'executor_text', label: 'Text Executor', type: 'agent'as const},
                        {id: 'ethical_checker', label: 'Ethical Check', type: 'process' as const},
                        {id: 'synthesizer', label: 'Result Synthesizer', type: 'agent'as const},
                        {id: 'final_output', label: 'Final Output', type: 'output'as const}
                    ],
                    edges: [
                        {id: 'e_input_analyzer', source: 'input_prompt', target: 'analyzer', animated: true},
                        {id: 'e_analyzer_planner', source: 'analyzer', target: 'planner', animated: true},
                        {id: 'e_planner_executor', source: 'planner', target: 'executor_text', animated: true},
                        {id: 'e_executor_ethical', source: 'executor_text', target: 'ethical_checker', animated: true},
                        {id: 'e_ethical_synthesizer', source: 'ethical_checker', target: 'synthesizer', animated: true},
                        {id: 'e_synthesizer_output', source: 'synthesizer', target: 'final_output', animated: true}
                    ]
                }
            };
             // Set the output for the synthesizer task, which becomes the workflow output
            wf.tasks.find((t:any) => t.id === "mock_synthesizer_task")!.outputData = synthesizedAnswerDetails;

            // Orkes workflow output is typically the output of the last task or explicitly defined outputParameters.
            // We'll simulate the workflow definition where the synthesizer's output is mapped to 'finalAnswer'.
            wf.output = { 
                finalAnswer: synthesizedAnswerDetails
            };
            console.log(`[MockOrkes] Workflow ${workflowId} COMPLETED (simulated).`);
          }
        }, 2000 + Math.random() * 1500); // Simulate 2-3.5 seconds processing
        return workflowId; // Return only the ID as string
      },
      getWorkflow: async (workflowId: string, includeTasks: boolean = false): Promise<Workflow> => {
        console.log(`[MockOrkes] Getting workflow: ${workflowId}, Include Tasks: ${includeTasks}`);
        const wfData = this.mockWorkflows.get(workflowId);
        if (!wfData) {
          const error: any = new Error(`Mock workflow ${workflowId} not found.`);
          error.response = { status: 404, data: `Workflow with id ${workflowId} not found.` }; // Simulate Orkes client error structure
          throw error;
        }
        // Simulate task progression if still "RUNNING" after a short delay
        if (wfData.status === "RUNNING" && (Date.now() - wfData.startTime > 1000)) {
           if (wfData.tasks.length === 1 && wfData.tasks[0].id === "mock_analyzer_task") {
               wfData.tasks[0].status = "COMPLETED";
               wfData.tasks[0].resultSummary = "Mock analysis complete.";
               wfData.tasks.push({ id: "mock_planner_task", taskDescription: "Plan execution", assignedAgent: "PlannerAgent", status: "IN_PROGRESS", resultSummary: "Planning...", outputData:{}, taskReferenceName: "mock_planner_task", taskDefName: "PlannerAgent", workflowTask: {name: "Plan execution"}});
           }
        }
        
        const workflowInstance: Workflow = {
            workflowId: wfData.workflowId,
            status: wfData.status,
            input: wfData.input,
            workflowName: wfData.name,
            tasks: includeTasks ? wfData.tasks : [], // Ensure tasks match Orkes Task type if possible
            output: wfData.output,
            startTime: new Date(wfData.startTime).toISOString(),
            reasonForIncompletion: wfData.reasonForIncompletion,
            // Add other fields if NeuroSynapse flow depends on them, e.g. version, variables
        };
        return workflowInstance;
      },
    };
  }
   public get metadataResource() { 
    return {
      registerTaskDefs: async (taskDefs: TaskDef[]): Promise<any> => {
        console.log(`[MockOrkes] Registering task definitions:`, taskDefs.map(t => t.name));
        taskDefs.forEach(td => this.mockTasks.set(td.name!, td));
        return { success: true, message: "Task definitions registered (mock)." };
      },
      updateWorkflowDefs: async (workflowDefs: WorkflowDef[]): Promise<any> => { 
        workflowDefs.forEach(wd => console.log(`[MockOrkes] Registering/Updating workflow definition: ${wd.name}`));
        return { success: true, message: "Workflow definitions registered/updated (mock)." };
      },
      getWorkflowDef: async (name: string, version?: number): Promise<WorkflowDef | undefined> => {
        console.log(`[MockOrkes] Getting workflow definition: ${name}`);
        // This is a simplified mock; in reality, workflow defs are stored separately.
        // We'll return a generic structure if a workflow with this name was "started".
        const foundWf = Array.from(this.mockWorkflows.values()).find(wf => wf.name === name);
        if (foundWf) {
            return { name: foundWf.name, version: version || 1, tasks: [], ownerEmail: 'mock@example.com' };
        }
        return undefined;
      },
      getTaskDef: async (taskDefName: string): Promise<TaskDef | undefined> => {
        console.log(`[MockOrkes] Getting task definition: ${taskDefName}`);
        return this.mockTasks.get(taskDefName);
      }
    };
  }
}


export function getOrkesClient(): OrkesConductorClient | MockOrkesConductorClient {
  const useMock = process.env.USE_MOCK_ORKES_CLIENT === 'true';

  if (useMock) {
    if (!orkesClientInstance || !(orkesClientInstance instanceof MockOrkesConductorClient)) {
      console.warn("USE_MOCK_ORKES_CLIENT is true. Using MOCK Orkes Client. No real Orkes calls will be made.");
      orkesClientInstance = new MockOrkesConductorClient();
    }
    return orkesClientInstance;
  }

  // If not using mock, or if instance is mock and shouldn't be, re-initialize
  if (!orkesClientInstance || (orkesClientInstance instanceof MockOrkesConductorClient && !useMock) ) {
    const serverUrl = process.env.ORKES_SERVER_URL;
    const keyId = process.env.ORKES_KEY_ID;
    const keySecret = process.env.ORKES_KEY_SECRET;

    if (!serverUrl || !keyId || !keySecret) {
      console.error(
        "ORKES_SERVER_URL, ORKES_KEY_ID, or ORKES_KEY_SECRET environment variables are not set for REAL Orkes client. Falling back to MOCK."
      );
      console.warn("Using MOCK Orkes Client due to missing credentials for real instance. No real Orkes calls will be made.");
      orkesClientInstance = new MockOrkesConductorClient(); // Fallback explicitly
      return orkesClientInstance;
    }
    
    try {
      orkesClientInstance = new OrkesConductorClient({
        serverUrl: serverUrl,
        keyId: keyId,
        keySecret: keySecret,
      });
      console.log("Real OrkesConductorClient initialized successfully.");
    } catch (error) {
        console.error("Failed to initialize REAL OrkesConductorClient:", error);
        console.warn("Falling back to MOCK Orkes Client due to initialization error.");
        orkesClientInstance = new MockOrkesConductorClient(); // Fallback on error too
    }
  }
  return orkesClientInstance;
}


export async function registerNeuroVicharWorkflowWithOrkes(workflowDef: WorkflowDef, taskDefs: TaskDef[]) {
  const client = getOrkesClient(); // This will get mock or real based on env
  try {
    // In mock client, these just log. In real client, they make API calls.
    await client.metadataResource.updateWorkflowDefs([workflowDef]); 
    if (taskDefs && taskDefs.length > 0) {
        await client.metadataResource.registerTaskDefs(taskDefs); 
    }
    
    if (client instanceof MockOrkesConductorClient) {
        console.log("[MockOrkes] NeuroVichar workflow and tasks (mock) registration functions called.");
    } else {
        console.log("NeuroVichar workflow and tasks registration attempted with Orkes Cloud.");
    }
  } catch (error) {
    console.error("Error during 'registerNeuroVicharWorkflowWithOrkes':", error);
  }
}
