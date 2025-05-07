import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { NeuroSynapseOutput, SubTask, ToolUsage } from '@/ai/flows/neuro-synapse-flow'; // Re-use existing types where possible

const AgentResultSchema = z.object({
  taskName: z.string(),
  agentType: z.string(),
  status: z.string(), // e.g., COMPLETED, FAILED
  output: z.any().optional(),
  error: z.string().optional(),
});

const SynthesizerInputSchema = z.object({
  originalPrompt: z.string(),
  hasImageContext: z.boolean().optional().default(false),
  analyzerOutput: z.any().optional(), // AnalyzerOutputSchema ideally
  plannerOutput: z.any().optional(), // PlannerOutputSchema ideally
  executorOutputs: z.array(AgentResultSchema), // Results from various executor tasks
  ethicalCheckerOutput: z.any(), // EthicalCheckerOutputSchema ideally
});

// The output should match NeuroSynapseOutput for frontend compatibility
const SynthesizerOutputSchema = z.object({
  originalPrompt: z.string(),
  hasImageContext: z.boolean(),
  decomposedTasks: z.array(z.object({ // This will be a representation of Orkes tasks
    id: z.string(),
    taskDescription: z.string(),
    assignedAgent: z.string(), // Orkes task name / agent type
    status: z.string(), // COMPLETED, FAILED etc.
    resultSummary: z.string().optional().nullable(),
  })),
  synthesizedAnswer: z.string(),
  workflowExplanation: z.string(),
  workflowDiagramData: z.object({ // Orkes could provide this, or synthesizer can build it
    nodes: z.array(z.object({ id: z.string(), label: z.string(), type: z.enum(['input', 'image_input', 'process', 'output', 'agent', 'tool']) })),
    edges: z.array(z.object({ id: z.string(), source: z.string(), target: z.string(), animated: z.boolean().optional() })),
  }),
  toolUsages: z.array(z.object({ // If tools were used by agents
      toolName: z.string(),
      toolInput: z.any().optional(),
      toolOutput: z.any().optional(),
  })).optional(),
});


export async function POST(request: NextRequest) {
  console.log("[Agent: ResultSynthesizer] Received request");
  try {
    const body = await request.json();
    const parsedInput = SynthesizerInputSchema.parse(body);
    console.log("[Agent: ResultSynthesizer] Input:", JSON.stringify(parsedInput, null, 2));

    // Mock synthesis logic
    let synthesizedAnswer = `Synthesized result for prompt: "${parsedInput.originalPrompt}".\n`;
    let workflowExplanation = "The workflow involved several agents orchestrated by Orkes Conductor:\n";
    
    const decomposedTasks: SubTask[] = [];
    let taskCounter = 1;

    if(parsedInput.analyzerOutput) {
        synthesizedAnswer += `Analyzer found: ${JSON.stringify(parsedInput.analyzerOutput.analysisSummary)}\n`;
        workflowExplanation += `- Analyzer processed the input. Result: ${parsedInput.analyzerOutput.analysisSummary}\n`;
        decomposedTasks.push({id: `orkes_task_${taskCounter++}`, taskDescription: "Analyze User Prompt", assignedAgent: "AnalyzerAgent", status: "COMPLETED", resultSummary: parsedInput.analyzerOutput.analysisSummary});
    }
    if(parsedInput.plannerOutput) {
        synthesizedAnswer += `Planner created ${parsedInput.plannerOutput.executionPlan?.length || 0} tasks. Strategy: ${parsedInput.plannerOutput.overallStrategy}\n`;
        workflowExplanation += `- Planner created a multi-step plan. Strategy: ${parsedInput.plannerOutput.overallStrategy}\n`;
         decomposedTasks.push({id: `orkes_task_${taskCounter++}`, taskDescription: "Plan Execution Strategy", assignedAgent: "PlannerAgent", status: "COMPLETED", resultSummary: `Plan created with ${parsedInput.plannerOutput.executionPlan?.length || 0} steps.`});
    }

    parsedInput.executorOutputs.forEach(execResult => {
      synthesizedAnswer += `Executor (${execResult.agentType} for ${execResult.taskName}) output: ${JSON.stringify(execResult.output || execResult.error || 'No output')}\n`;
      workflowExplanation += `- Executor task '${execResult.taskName}' (${execResult.agentType}) completed with status ${execResult.status}. Output (summary): ${JSON.stringify(execResult.output)?.substring(0,100) || 'N/A'}\n`;
      decomposedTasks.push({id: `orkes_task_${taskCounter++}`, taskDescription: `Execute: ${execResult.taskName}`, assignedAgent: execResult.agentType, status: execResult.status, resultSummary: JSON.stringify(execResult.output)?.substring(0,100) || execResult.error || 'Completed'});
    });

    if(parsedInput.ethicalCheckerOutput) {
        synthesizedAnswer += `Ethical Check: Compliant - ${parsedInput.ethicalCheckerOutput.isCompliant}. Issues: ${parsedInput.ethicalCheckerOutput.issuesFound?.join(', ') || 'None'}\n`;
        workflowExplanation += `- Ethical Checker reviewed the content. Compliant: ${parsedInput.ethicalCheckerOutput.isCompliant}.\n`;
         decomposedTasks.push({id: `orkes_task_${taskCounter++}`, taskDescription: "Ethical Compliance Check", assignedAgent: "EthicalCheckerAgent", status: "COMPLETED", resultSummary: `Compliant: ${parsedInput.ethicalCheckerOutput.isCompliant}. Issues: ${parsedInput.ethicalCheckerOutput.issuesFound?.join(', ') || 'None'}`});
    }
    
    // Construct mock workflowDiagramData (Orkes might provide its own execution graph data)
     const workflowDiagramData: NeuroSynapseOutput['workflowDiagramData'] = {
        nodes: [
            { id: 'userInput', label: 'User Input', type: 'input' },
            { id: 'orkesWorkflow', label: 'Orkes Conductor', type: 'process' },
            ...decomposedTasks.map(t => ({id: t.id, label: t.assignedAgent, type: 'agent' as 'agent'})), // simplify
            { id: 'finalOutput', label: 'Synthesized Output', type: 'output' },
        ],
        edges: [
            { id: 'e_in_orkes', source: 'userInput', target: 'orkesWorkflow', animated: true },
            // Simplified edges for mock
            ...decomposedTasks.map((t, i, arr) => ({
                id: `e_orkes_${t.id}`,
                source: i === 0 ? 'orkesWorkflow' : arr[i-1].id,
                target: t.id,
                animated: true
            })),
            { id: 'e_orkes_out', source: decomposedTasks.length > 0 ? decomposedTasks[decomposedTasks.length-1].id : 'orkesWorkflow', target: 'finalOutput', animated: true },
        ],
    };


    const output: NeuroSynapseOutput = {
      originalPrompt: parsedInput.originalPrompt,
      hasImageContext: parsedInput.hasImageContext || false,
      decomposedTasks,
      synthesizedAnswer,
      workflowExplanation,
      workflowDiagramData,
      toolUsages: [], // Populate if agents use tools and report them
    };
    console.log("[Agent: ResultSynthesizer] Output:", JSON.stringify(output, null, 2));
    return NextResponse.json(output);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("[Agent: ResultSynthesizer] Zod Error:", error.errors);
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("[Agent: ResultSynthesizer] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to synthesize result" }, { status: 500 });
  }
}