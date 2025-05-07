// src/app/api/agents/analyzer/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserContext } from '@/ai/flows/interpret-user-intent-flow'; // For type reference

interface AnalyzerInput {
  mainPrompt: string;
  imageDataUri?: string;
  userContext?: UserContext; // Add userContext here
}

// Simulate NLP deconstruction
function deconstructPrompt(prompt: string, imageDataUri?: string, userContext?: UserContext): any {
  const subTasks = [];
  let analysisDetails = `Analyzed prompt: "${prompt}". `;

  if (imageDataUri) {
    analysisDetails += "Image context was provided and considered. ";
  } else {
    analysisDetails += "No image context provided. ";
  }

  if (userContext) {
    analysisDetails += `User context (focus: ${userContext.currentFocus || 'N/A'}) was considered. `;
    // Example: Modify sub-tasks based on context
    if (userContext.currentFocus === "AI Image Generation" && !prompt.toLowerCase().includes("image")) {
      // User is focused on images, but prompt isn't about it. Maybe add an image task?
      // This is a simplistic example. Real logic would be more nuanced.
    }
  }


  // Simple keyword-based deconstruction (can be replaced with actual NLP)
  if (prompt.toLowerCase().includes("report") || prompt.toLowerCase().includes("summary")) {
    subTasks.push({ id: "task_data_gathering", description: "Gather relevant data for the report/summary.", agent: "ExecutorWebSearch" });
    subTasks.push({ id: "task_report_writing", description: "Write the report/summary based on gathered data.", agent: "ExecutorText" });
    analysisDetails += "Identified need for data gathering and report writing. ";
  } else if (prompt.toLowerCase().includes("image") || prompt.toLowerCase().includes("picture") || prompt.toLowerCase().includes("generate art") || prompt.toLowerCase().includes("visual")) {
    subTasks.push({ id: "task_image_generation", description: `Generate image based on prompt: "${prompt}"`, agent: "ExecutorImage" });
    analysisDetails += "Identified need for image generation. ";
  } else if (prompt.toLowerCase().includes("code") || prompt.toLowerCase().includes("script") || prompt.toLowerCase().includes("develop") || prompt.toLowerCase().includes("program")) {
    subTasks.push({ id: "task_code_generation", description: `Generate code/script for: "${prompt}"`, agent: "ExecutorCode" });
    analysisDetails += "Identified need for code generation. ";
  } else if (prompt.toLowerCase().includes("search") || prompt.toLowerCase().includes("find") || prompt.toLowerCase().includes("look up")) {
     subTasks.push({ id: "task_web_search", description: `Perform web search for: "${prompt}"`, agent: "ExecutorWebSearch" });
     subTasks.push({ id: "task_search_synthesis", description: "Synthesize findings from web search.", agent: "ExecutorText" });
     analysisDetails += "Identified need for web searching and synthesis. ";
  }
  else {
    subTasks.push({ id: "task_general_research", description: `General research and information synthesis for: "${prompt}"`, agent: "ExecutorWebSearch" });
    subTasks.push({ id: "task_general_synthesis", description: "Synthesize findings from research.", agent: "ExecutorText" });
    analysisDetails += "Identified need for general research and synthesis. ";
  }
  
  // Fallback if no specific tasks identified
  if (subTasks.length === 0) {
     subTasks.push({ id: "task_fallback_comprehension", description: `Comprehensive analysis and response generation for: "${prompt}"`, agent: "ExecutorText" });
     analysisDetails += "Defaulting to comprehensive text analysis. ";
  }


  return {
    deconstructedSubTasks: subTasks,
    analysisSummary: analysisDetails + `Decomposed into ${subTasks.length} primary sub-task(s).`,
    originalPrompt: prompt,
    hasImageContext: !!imageDataUri,
    userContextProvided: !!userContext, // Indicate if context was received
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Orkes worker input is often in `body.input`. Adjust if your workflow sends it differently.
    const { mainPrompt, imageDataUri, userContext }: AnalyzerInput = body.input || body;


    if (!mainPrompt) {
      return NextResponse.json({ error: "Missing mainPrompt in request body" }, { status: 400 });
    }

    console.log(`[AnalyzerAgent] Received prompt: ${mainPrompt}, Image provided: ${!!imageDataUri}, UserContext: ${userContext ? 'Provided' : 'Not Provided'}`);
    if (userContext) {
        console.log("[AnalyzerAgent] UserContext details:", JSON.stringify(userContext).substring(0, 200) + "...");
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const analysisResult = deconstructPrompt(mainPrompt, imageDataUri, userContext);

    console.log("[AnalyzerAgent] Analysis complete:", analysisResult.analysisSummary);
    // Orkes HTTP task expects a specific output structure from workers
    return NextResponse.json({
      ...analysisResult // Spread the result directly for Orkes to pick up
    });

  } catch (error: any) {
    console.error("[AnalyzerAgent] Error:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}
