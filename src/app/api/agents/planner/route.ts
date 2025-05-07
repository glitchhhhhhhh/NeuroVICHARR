// src/app/api/agents/planner/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserContext } from '@/ai/flows/interpret-user-intent-flow';

interface PlannerInput {
  deconstructedSubTasks: Array<{ id: string; description: string; agent: string }>;
  analysisSummary: string;
  originalPrompt: string;
  hasImageContext: boolean;
  userContext?: UserContext; // Expect userContext from Analyzer output
  userContextProvided?: boolean; // Flag from analyzer
}

// Simulate planning logic
function createExecutionPlan(analyzerOutput: PlannerInput): any {
  let planDetails = `Execution plan based on: "${analyzerOutput.analysisSummary}". `;
  if (analyzerOutput.userContextProvided) {
    planDetails += `User context was considered during planning. `;
  }
  
  const parallelTasksToExecute: any[] = [];

  analyzerOutput.deconstructedSubTasks.forEach(subTask => {
    let taskReferenceName;
    let taskInput: any = { 
        promptFragment: subTask.description, 
        originalPrompt: analyzerOutput.originalPrompt, 
        hasImageContext: analyzerOutput.hasImageContext 
    };
    // Pass userContext to executor tasks if it was provided to the planner
    if (analyzerOutput.userContext) {
        taskInput.userContext = analyzerOutput.userContext;
    }


    switch (subTask.agent) {
      case "ExecutorWebSearch":
        taskReferenceName = "execute_web_search_task";
        break;
      case "ExecutorImage":
        taskReferenceName = "execute_image_generation_task";
        break;
      case "ExecutorCode":
        taskReferenceName = "execute_code_generation_task";
        break;
      case "ExecutorText": 
        taskReferenceName = "execute_text_synthesis_task";
         taskInput = { ...taskInput, contextData: "General context from planner." }; 
        break;
      default:
        console.warn(`[PlannerAgent] Unknown agent type: ${subTask.agent} for task ${subTask.id}. Defaulting to text synthesis.`);
        taskReferenceName = "execute_text_synthesis_task"; // Fallback
        taskInput.promptFragment = `Address this with general text synthesis: ${subTask.description}`;
        break; 
    }
    
    parallelTasksToExecute.push({
        name: taskReferenceName, 
        taskReferenceName: `${subTask.id}_${taskReferenceName}_${Date.now()%10000}`, // Ensure more unique taskRefName
        input: taskInput
    });
    planDetails += `Scheduled ${subTask.agent} (as ${taskReferenceName}) for: "${subTask.description}". `;
  });
  
  if (parallelTasksToExecute.length === 0) {
    planDetails += "No specific executor tasks planned based on analyzer output. The ResultSynthesizer will attempt a direct response.";
    // It might be useful to still provide a default task for the synthesizer to work with
    // or ensure the synthesizer can handle an empty executionPlan.
    // For now, an empty executionPlan means the '0' case in the DECISION task will be taken.
  } else {
     planDetails += `Total ${parallelTasksToExecute.length} executor tasks scheduled for parallel execution.`;
  }

  return {
    executionPlan: parallelTasksToExecute, 
    planSummary: planDetails,
    originalPrompt: analyzerOutput.originalPrompt, // Pass through for synthesizer
    hasImageContext: analyzerOutput.hasImageContext, // Pass through
    userContext: analyzerOutput.userContext, // Pass through user context
    analysisSummary: analyzerOutput.analysisSummary, // Pass through for synthesizer
    deconstructedSubTasks: analyzerOutput.deconstructedSubTasks, // Pass through for synthesizer diagram
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const analyzerOutput: PlannerInput = body.input || body;

    if (!analyzerOutput || !analyzerOutput.deconstructedSubTasks || !analyzerOutput.originalPrompt) {
      return NextResponse.json({ error: "Missing or invalid analyzer_output in request body" }, { status: 400 });
    }
    
    console.log("[PlannerAgent] Received analyzer output:", JSON.stringify(analyzerOutput).substring(0, 300) + "...");
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    const plan = createExecutionPlan(analyzerOutput);
    
    console.log("[PlannerAgent] Plan created. Summary:", plan.planSummary);
    return NextResponse.json(plan); // Return the whole plan object as Orkes task output

  } catch (error: any) {
    console.error("[PlannerAgent] Error:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}
