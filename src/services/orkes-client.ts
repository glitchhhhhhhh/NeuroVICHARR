/**
 * @fileOverview Mock Orkes Conductor Client.
 * In a real application, this would be replaced by the official Orkes Conductor SDK.
 * This mock helps simulate workflow interactions for development purposes.
 */

interface OrkesConductorClientConfig {
  keyId: string;
  keySecret: string;
  serverUrl: string;
}

interface WorkflowInput {
  [key: string]: any;
}

interface StartWorkflowRequest {
  name: string;
  version?: number;
  input: WorkflowInput;
  correlationId?: string;
  // taskToDomain?: { [key: string]: string }; // For task domain mapping
}

interface WorkflowExecution {
  workflowId: string;
  status: string; // RUNNING, COMPLETED, FAILED, TIMED_OUT, TERMINATED, PAUSED
  output?: any;
  input?: any;
  tasks?: any[]; // For detailed task information if requested
  // ... other properties
}

// This is a simplified mock. A real SDK would have more comprehensive error handling and features.
class OrkesConductorClient {
  private config: OrkesConductorClientConfig;

  constructor(config: OrkesConductorClientConfig) {
    this.config = config;
    if (!config.serverUrl || !config.keyId || !config.keySecret) {
      console.warn(
        'OrkesConductorClient: Missing serverUrl, keyId, or keySecret. Using mock mode without actual API calls.'
      );
    }
  }

  public workflowResource = {
    startWorkflow: async (request: StartWorkflowRequest): Promise<{ workflowId: string }> => {
      console.log(`[Mock Orkes Client] Attempting to start workflow: ${request.name}`);
      console.log(`[Mock Orkes Client] Server URL (mocked context): ${this.config.serverUrl}`);
      // In a real client, you would make an HTTP POST request here
      // For example:
      // const response = await fetch(`${this.config.serverUrl}/api/workflow`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'X-Authorization': await this.generateToken(), // Or however Orkes auth works
      //   },
      //   body: JSON.stringify(request),
      // });
      // if (!response.ok) throw new Error(`Failed to start workflow: ${response.statusText}`);
      // const responseData = await response.text(); // Orkes API might return text/plain for workflowId
      // return { workflowId: responseData };

      // Mock implementation:
      const mockWorkflowId = `mock_wf_${Date.now()}_${request.name.replace(/\s/g, '_')}`;
      console.log(`[Mock Orkes Client] Started workflow ${request.name} with ID: ${mockWorkflowId} and input:`,request.input);
      global.MOCK_ORKES_WORKFLOWS = global.MOCK_ORKES_WORKFLOWS || {};
      global.MOCK_ORKES_WORKFLOWS[mockWorkflowId] = {
        status: 'RUNNING',
        input: request.input,
        output: null,
        startTime: Date.now(),
      };
      return Promise.resolve({ workflowId: mockWorkflowId });
    },

    getWorkflow: async (workflowId: string, includeTasks?: boolean): Promise<WorkflowExecution> => {
      console.log(`[Mock Orkes Client] Getting status for workflow ID: ${workflowId}`);
      // In a real client, you would make an HTTP GET request here
      // For example:
      // const response = await fetch(`${this.config.serverUrl}/api/workflow/${workflowId}?includeTasks=${!!includeTasks}`, {
      //   method: 'GET',
      //   headers: { 'X-Authorization': await this.generateToken() },
      // });
      // if (!response.ok) throw new Error(`Failed to get workflow: ${response.statusText}`);
      // return await response.json();
      
      // Mock implementation:
      const workflow = global.MOCK_ORKES_WORKFLOWS?.[workflowId];
      if (!workflow) {
        return Promise.reject(new Error(`Mock workflow with ID ${workflowId} not found.`));
      }

      // Simulate workflow progression
      const elapsedTime = Date.now() - workflow.startTime;
      if (workflow.status === 'RUNNING' && elapsedTime > 5000) { // Simulate completion after 5s
        workflow.status = 'COMPLETED';
        
        // Define example statuses for decomposed tasks
        const taskStatuses: ('PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'TIMED_OUT' | 'CANCELLED')[] = [
            'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED'
        ];
        // Randomly fail one task for demonstration, or make it timed out, etc.
        const randomIndex = Math.floor(Math.random() * taskStatuses.length);
        if (Math.random() < 0.15) taskStatuses[randomIndex] = 'FAILED';
        else if (Math.random() < 0.05) taskStatuses[randomIndex] = 'TIMED_OUT';


        workflow.output = {
          finalAnswer: `Synthesized answer for prompt: '${workflow.input?.prompt || 'Unknown'}'. Image provided: ${!!workflow.input?.imageDataUri}. (This is a mock response from a simulated Orkes workflow.)`,
          workflowExplanation: "The Orkes workflow was **simulated locally**. User input was 'analyzed', a 'plan' was formed, tasks (code, image, eval) were 'forked & joined', an 'ethical check' was performed, and the final result 'synthesized'. No actual calls to an Orkes Cloud instance were made in this mock execution.",
          decomposedTasks: [
            { id: "analyze_prompt_ref", taskDescription: "Analyze user prompt", assignedAgent: "AnalyzerAgent", status: taskStatuses[0], resultSummary: taskStatuses[0] === 'COMPLETED' ? "Prompt analysis complete." : (taskStatuses[0] === 'FAILED' ? "Analysis failed due to an internal error." : "Analysis timed out.")},
            { id: "plan_execution_ref", taskDescription: "Plan execution strategy", assignedAgent: "PlannerAgent", status: taskStatuses[1], resultSummary: "Execution plan generated."},
            { id: "execute_code_gen_ref", taskDescription: "Execute: Code Generation", assignedAgent: "CodeGenerator", status: taskStatuses[2], resultSummary: "Mock code generated successfully."},
            { id: "execute_image_gen_ref", taskDescription: "Execute: Image Generation", assignedAgent: "ImageGenerator", status: taskStatuses[3], resultSummary: "Mock image data URI produced."},
            { id: "execute_eval_ref", taskDescription: "Execute: Evaluation", assignedAgent: "Evaluator", status: taskStatuses[4], resultSummary: "Evaluation completed with score: 0.85."},
            { id: "ethical_check_ref", taskDescription: "Ethical Compliance Check", assignedAgent: "EthicalCheckerAgent", status: taskStatuses[5], resultSummary: "Compliance: true. Issues: None"},
            { id: "synthesize_final_result_ref", taskDescription: "Synthesize Final Result", assignedAgent: "ResultSynthesizerAgent", status: taskStatuses[6], resultSummary: "Final answer compiled and ready."}
          ],
           workflowDiagramData: { 
            nodes: [
              { id: 'userInput', label: 'User Input', type: 'input' },
              { id: 'analyzer', label: 'Analyzer Agent', type: 'agent' },
              { id: 'planner', label: 'Planner Agent', type: 'agent' },
              { id: 'code_gen', label: 'Code Generator', type: 'agent' },
              { id: 'image_gen', label: 'Image Generator', type: 'agent' },
              { id: 'evaluator', label: 'Evaluator Agent', type: 'agent' },
              { id: 'ethical_checker', label: 'Ethical Checker', type: 'agent'},
              { id: 'result_synthesizer', label: 'Result Synthesizer', type: 'agent' },
              { id: 'finalOutput', label: 'Final Output', type: 'output' },
            ],
            edges: [
              { id: 'e1', source: 'userInput', target: 'analyzer', animated: true },
              { id: 'e2', source: 'analyzer', target: 'planner', animated: true },
              { id: 'e3', source: 'planner', target: 'code_gen', animated: true },
              { id: 'e4', source: 'planner', target: 'image_gen', animated: true },
              { id: 'e5', source: 'planner', target: 'evaluator', animated: true },
              { id: 'e6', source: 'code_gen', target: 'ethical_checker', animated: true },
              { id: 'e7', source: 'image_gen', target: 'ethical_checker', animated: true },
              { id: 'e8', source: 'evaluator', target: 'ethical_checker', animated: true },
              { id: 'e9', source: 'ethical_checker', target: 'result_synthesizer', animated: true },
              { id: 'e10', source: 'result_synthesizer', target: 'finalOutput', animated: true },
            ],
          },
          toolUsages: [], 
          ethicalComplianceDetails: { isCompliant: true, issuesFound: [] },
        };
         console.log(`[Mock Orkes Client] Workflow ${workflowId} COMPLETED (simulated).`);
      } else if (workflow.status === 'RUNNING') {
         console.log(`[Mock Orkes Client] Workflow ${workflowId} still RUNNING (simulated).`);
      }


      return Promise.resolve({
        workflowId,
        status: workflow.status,
        output: workflow.output,
        input: workflow.input,
        tasks: workflow.status === 'COMPLETED' ? [{name: 'Mock Task', status: 'COMPLETED'}] : [], // Simplified tasks
      });
    },

    // Other useful methods might include:
    // terminateWorkflow: async (workflowId: string, reason?: string): Promise<void> => {},
    // pauseWorkflow: async (workflowId: string): Promise<void> => {},
    // resumeWorkflow: async (workflowId: string): Promise<void> => {},
    // searchWorkflows: async (query: any): Promise<any> => {}, // For searching workflows
  };

  // In a real SDK, token generation for auth would be handled here or by the SDK internally.
  // private async generateToken(): Promise<string> {
  //   // This is highly Orkes-specific. Consult Orkes documentation for actual token generation.
  //   // It might involve an API call to an auth endpoint with keyId and keySecret.
  //   // For example:
  //   // const tokenResponse = await fetch(`${this.config.serverUrl}/token`, {
  //   //  method: 'POST',
  //   //  body: JSON.stringify({ keyId: this.config.keyId, keySecret: this.config.keySecret })
  //   // });
  //   // const tokenData = await tokenResponse.json();
  //   // return tokenData.token;
  //   return 'mock_jwt_token';
  // }
}

let orkesClientInstance: OrkesConductorClient | null = null;

export function getOrkesClient(): OrkesConductorClient {
  if (!orkesClientInstance) {
    const serverUrl = process.env.ORKES_SERVER_URL;
    const keyId = process.env.ORKES_KEY_ID;
    const keySecret = process.env.ORKES_KEY_SECRET;

    // if (!serverUrl || !keyId || !keySecret) {
    //   console.error("ORKES_SERVER_URL, ORKES_KEY_ID, or ORKES_KEY_SECRET environment variables are not set. Orkes client cannot be initialized for real calls. Using full mock mode.");
    // }
    
    orkesClientInstance = new OrkesConductorClient({
      serverUrl: serverUrl || "https://play.orkes.io/api", // Default to play for mock
      keyId: keyId || "mockKeyId",
      keySecret: keySecret || "mockKeySecret",
    });
  }
  return orkesClientInstance;
}

// Add a simple global store for mock workflows if not already present
declare global {
  var MOCK_ORKES_WORKFLOWS: Record<string, any> | undefined;
}
if (typeof global.MOCK_ORKES_WORKFLOWS === 'undefined') {
  global.MOCK_ORKES_WORKFLOWS = {};
}