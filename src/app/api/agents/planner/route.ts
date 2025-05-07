
// src/app/api/agents/planner/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface PlannerInput {
  deconstructedSubTasks: Array<{ id: string; description: string; agent: string }>;
  analysisSummary: string;
  originalPrompt: string;
  hasImageContext: boolean;
}

// Simulate planning logic
function createExecutionPlan(analyzerOutput: PlannerInput): any {
  let planDetails = `Execution plan based on: "${analyzerOutput.analysisSummary}". `;
  
  // For FORK_JOIN, Orkes expects an array of task inputs for parallel branches.
  // Each element in this array corresponds to one branch of the fork.
  const parallelTasksToExecute: any[] = [];

  analyzerOutput.deconstructedSubTasks.forEach(subTask => {
    // Map agent type from analyzer to a specific task name in Orkes workflow
    let taskReferenceName;
    let taskInput = { promptFragment: subTask.description, originalPrompt: analyzerOutput.originalPrompt, hasImageContext: analyzerOutput.hasImageContext };

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
      case "ExecutorText": // A generic text processing/synthesis agent
        taskReferenceName = "execute_text_synthesis_task";
         taskInput = { ...taskInput, contextData: "General context from planner." }; // Example additional input
        break;
      default:
        console.warn(`[PlannerAgent] Unknown agent type: ${subTask.agent} for task ${subTask.id}. Skipping.`);
        return; // Skip this subTask if agent mapping is unclear
    }
    
    parallelTasksToExecute.push({
        name: taskReferenceName, // This is the taskDefinition name in Orkes
        taskReferenceName: `${subTask.id}_${taskReferenceName}`, // Unique reference for this instance in the workflow
        input: taskInput
    });
    planDetails += `Scheduled ${subTask.agent} for: "${subTask.description}". `;
  });
  
  if (parallelTasksToExecute.length === 0) {
    planDetails += "No executable tasks planned based on analyzer output. Consider a fallback or default action.";
  } else {
     planDetails += `Total ${parallelTasksToExecute.length} executor tasks scheduled for parallel execution.`;
  }

  return {
    executionPlan: parallelTasksToExecute, // This will be used by FORK_JOIN_DYNAMIC task
    planSummary: planDetails,
    originalPrompt: analyzerOutput.originalPrompt,
    hasImageContext: analyzerOutput.hasImageContext,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Orkes worker input can be complex. Often, the direct output of the previous task is available.
    // Assuming 'analyzer_output' is the output variable name from the Analyzer task in Orkes.
    const analyzerOutput: PlannerInput = body.input;

    if (!analyzerOutput || !analyzerOutput.deconstructedSubTasks) {
      return NextResponse.json({ error: "Missing or invalid analyzer_output in request body" }, { status: 400 });
    }
    
    console.log("[PlannerAgent] Received analyzer output:", JSON.stringify(analyzerOutput, null, 2));
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    const plan = createExecutionPlan(analyzerOutput);
    
    console.log("[PlannerAgent] Plan created:", JSON.stringify(plan, null, 2));
    return NextResponse.json({ ...plan });

  } catch (error: any) {
    console.error("[PlannerAgent] Error:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}
