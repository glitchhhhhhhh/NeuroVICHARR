
// src/app/api/agents/analyzer/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simulate NLP deconstruction
function deconstructPrompt(prompt: string, imageDataUri?: string): any {
  const subTasks = [];
  let analysisDetails = `Analyzed prompt: "${prompt}". `;

  if (imageDataUri) {
    analysisDetails += "Image context was provided and considered. ";
  } else {
    analysisDetails += "No image context provided. ";
  }

  // Simple keyword-based deconstruction (can be replaced with actual NLP)
  if (prompt.toLowerCase().includes("report") || prompt.toLowerCase().includes("summary")) {
    subTasks.push({ id: "task_data_gathering", description: "Gather relevant data for the report/summary.", agent: "ExecutorWebSearch" });
    subTasks.push({ id: "task_report_writing", description: "Write the report/summary based on gathered data.", agent: "ExecutorText" });
    analysisDetails += "Identified need for data gathering and report writing. ";
  } else if (prompt.toLowerCase().includes("image") || prompt.toLowerCase().includes("picture") || prompt.toLowerCase().includes("generate art")) {
    subTasks.push({ id: "task_image_generation", description: `Generate image based on prompt: "${prompt}"`, agent: "ExecutorImage" });
    analysisDetails += "Identified need for image generation. ";
  } else if (prompt.toLowerCase().includes("code") || prompt.toLowerCase().includes("script") || prompt.toLowerCase().includes("develop")) {
    subTasks.push({ id: "task_code_generation", description: `Generate code/script for: "${prompt}"`, agent: "ExecutorCode" });
    analysisDetails += "Identified need for code generation. ";
  } else {
    subTasks.push({ id: "task_general_research", description: `General research and information synthesis for: "${prompt}"`, agent: "ExecutorWebSearch" });
    subTasks.push({ id: "task_general_synthesis", description: "Synthesize findings from research.", agent: "ExecutorText" });
    analysisDetails += "Identified need for general research and synthesis. ";
  }
  
  // Add a mandatory ethical check conceptual task
  // This will be handled by the EthicalChecker agent later in the workflow
  // subTasks.push({ id: "task_ethical_review_initial", description: "Initial ethical review of the deconstructed plan.", agent: "EthicalChecker" });

  return {
    deconstructedSubTasks: subTasks,
    analysisSummary: analysisDetails + `Decomposed into ${subTasks.length} primary sub-task(s).`,
    originalPrompt: prompt,
    hasImageContext: !!imageDataUri,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mainPrompt, imageDataUri } = body.input; // Orkes worker input is often in `body.input`

    if (!mainPrompt) {
      return NextResponse.json({ error: "Missing mainPrompt in request body" }, { status: 400 });
    }

    console.log(`[AnalyzerAgent] Received prompt: ${mainPrompt}, Image provided: ${!!imageDataUri}`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const analysisResult = deconstructPrompt(mainPrompt, imageDataUri);

    console.log("[AnalyzerAgent] Analysis complete:", analysisResult);
    // Orkes HTTP task expects a specific output structure from workers
    return NextResponse.json({
      // Typically, Orkes workers output key-value pairs.
      // The 'output' field often contains the data to be passed to the next task.
      ...analysisResult // Spread the result directly for Orkes to pick up
    });

  } catch (error: any) {
    console.error("[AnalyzerAgent] Error:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}
