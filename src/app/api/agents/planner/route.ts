import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AnalyzerOutputSchema } from '../analyzer/route'; // Assuming AnalyzerOutput is exported

const PlannerInputSchema = z.object({
  originalPrompt: z.string(),
  analysisResult: AnalyzerOutputSchema, // Use the defined schema
});

const TaskSchema = z.object({
  taskName: z.string().describe("A descriptive name for the task."),
  agentType: z.enum(["CodeGenerator", "ImageGenerator", "Evaluator", "WebSearcher", "GenericExecutor"]),
  inputParameters: z.record(z.any()).describe("Parameters to be passed to the agent executing this task."),
  dependsOn: z.array(z.string()).optional().describe("IDs of tasks that must complete before this one starts."),
});
export type Task = z.infer<typeof TaskSchema>;

const PlannerOutputSchema = z.object({
  executionPlan: z.array(TaskSchema),
  overallStrategy: z.string(),
});
export type PlannerOutput = z.infer<typeof PlannerOutputSchema>;

export async function POST(request: NextRequest) {
  console.log("[Agent: Planner] Received request");
  try {
    const body = await request.json();
    const parsedInput = PlannerInputSchema.parse(body);
    console.log("[Agent: Planner] Input:", parsedInput);

    // Mock planning logic
    const executionPlan: Task[] = [];
    let overallStrategy = "Based on the analysis, the following plan has been devised: ";

    executionPlan.push({
        taskName: "MainContentGeneration",
        agentType: "GenericExecutor", // This could be CodeGenerator or other specialized executor
        inputParameters: { prompt: `Generate content based on: ${parsedInput.originalPrompt} and analysis: ${parsedInput.analysisResult.analysisSummary}` },
    });
    overallStrategy += "Generate main content. ";

    if (parsedInput.analysisResult.isImageAnalysisRequired || parsedInput.originalPrompt.toLowerCase().includes("visualize")) {
      executionPlan.push({
        taskName: "ImageGeneration",
        agentType: "ImageGenerator",
        inputParameters: { prompt: `Create a visual for: ${parsedInput.originalPrompt}` },
        dependsOn: [] // Can run in parallel
      });
      overallStrategy += "Generate a supporting image. ";
    }
    
    if (parsedInput.originalPrompt.toLowerCase().includes("evaluate") || parsedInput.originalPrompt.toLowerCase().includes("review")) {
         executionPlan.push({
            taskName: "Evaluation",
            agentType: "Evaluator",
            inputParameters: { contentToEvaluateRef: "MainContentGeneration.output" }, // Reference output of another task
            dependsOn: ["MainContentGeneration"] 
         });
         overallStrategy += "Evaluate the generated content. ";
    }


    const output: PlannerOutput = {
      executionPlan,
      overallStrategy,
    };
    console.log("[Agent: Planner] Output:", output);
    return NextResponse.json(output);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("[Agent: Planner] Zod Error:", error.errors);
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("[Agent: Planner] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create plan" }, { status: 500 });
  }
}