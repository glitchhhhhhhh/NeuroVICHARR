
// src/app/api/agents/result-synthesizer/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ai as genkitAi } from '@/ai/genkit';

interface SynthesizerInput {
  originalPrompt: string;
  hasImageContext: boolean;
  analysisSummary?: string; // From Analyzer
  planSummary?: string; // From Planner
  executorOutputs: any[]; // Array of outputs from various executor tasks
  ethicalCheckResult?: any; // From EthicalChecker
}

// Simulate result synthesis
async function synthesizeResults(input: SynthesizerInput): Promise<any> {
  console.log(`[ResultSynthesizer] Synthesizing results for prompt: "${input.originalPrompt}"`);
  console.log("[ResultSynthesizer] Executor Outputs:", JSON.stringify(input.executorOutputs, null, 2));
  console.log("[ResultSynthesizer] Ethical Check:", JSON.stringify(input.ethicalCheckResult, null, 2));

  let synthesizedAnswer = `Synthesis for prompt: "${input.originalPrompt}".\n`;
  if (input.hasImageContext) {
    synthesizedAnswer += "Image context was considered.\n";
  }
  if (input.analysisSummary) {
    synthesizedAnswer += `\nAnalysis: ${input.analysisSummary}\n`;
  }
  if (input.planSummary) {
    synthesizedAnswer += `Plan: ${input.planSummary}\n`;
  }

  synthesizedAnswer += "\nKey findings from execution:\n";
  input.executorOutputs.forEach((out, index) => {
    if (out) { // Check if output is not null/undefined
      const taskRef = out.taskReferenceName || `executor_${index + 1}`;
      synthesizedAnswer += `\n--- Output from ${taskRef} ---\n`;
      if (out.generatedCode) synthesizedAnswer += `Generated Code (snippet):\n\`\`\`${out.language || ''}\n${out.generatedCode.substring(0,150)}...\n\`\`\`\n`;
      if (out.imageDataUri) synthesizedAnswer += `Generated Image: [Image data present - will be displayed in UI]\n`;
      if (out.imageUrl) synthesizedAnswer += `Generated Image (mock URL): ${out.imageUrl}\n`; // For mock image executor
      if (out.synthesizedText) synthesizedAnswer += `Synthesized Text: ${out.synthesizedText.substring(0,200)}...\n`;
      if (out.searchResults && Array.isArray(out.searchResults)) {
        synthesizedAnswer += `Web Search Summary: ${out.summary}\nTop result: ${out.searchResults[0]?.title || 'N/A'}\n`;
      }
      if (out.error) synthesizedAnswer += `Error in this task: ${out.error}\n`;
    }
  });
  
  if (input.ethicalCheckResult) {
    synthesizedAnswer += `\n\nEthical Compliance: ${input.ethicalCheckResult.isCompliant ? 'Pass' : 'Fail'}.\n`;
    if (!input.ethicalCheckResult.isCompliant && input.ethicalCheckResult.issuesFound?.length > 0) {
      synthesizedAnswer += `Issues: ${input.ethicalCheckResult.issuesFound.join(', ')}\n`;
    }
  }

  let workflowExplanation = `The prompt "${input.originalPrompt}" was processed. `;
  workflowExplanation += input.analysisSummary || "It was analyzed. ";
  workflowExplanation += input.planSummary || "A plan was formulated. ";
  workflowExplanation += ` ${input.executorOutputs?.length || 0} executor tasks were run. `;
  if (input.ethicalCheckResult) {
     workflowExplanation += `An ethical review was performed (Compliant: ${input.ethicalCheckResult.isCompliant}). `;
  }
  workflowExplanation += "Results were then synthesized.";

  // For a more sophisticated synthesis, use an LLM
  const useLLMSynthesis = !process.env.USE_MOCK_ORKES_CLIENT && process.env.GENAI_API_KEY;

  if (useLLMSynthesis) {
    try {
      const llmPrompt = `
      Original User Prompt: ${input.originalPrompt}
      ${input.hasImageContext ? "User provided image context." : ""}

      Analysis Summary: ${input.analysisSummary || "Not available."}
      Execution Plan Summary: ${input.planSummary || "Not available."}

      Individual Agent Outputs:
      ${input.executorOutputs.map((out, i) => {
        if (!out) return `Agent ${i+1}: No output received.`;
        let outputString = `Agent ${out.taskReferenceName || `Executor ${i+1}`}:\n`;
        if(out.generatedCode) outputString += `  Code: ${out.generatedCode.substring(0,100)}...\n`;
        if(out.imageDataUri || out.imageUrl) outputString += `  Image: [Image generated]\n`;
        if(out.synthesizedText) outputString += `  Text: ${out.synthesizedText.substring(0,100)}...\n`;
        if(out.searchResults) outputString += `  WebSearch: ${out.summary}\n`;
        if(out.error) outputString += `  Error: ${out.error}\n`;
        return outputString;
      }).join("\n")}

      Ethical Check Result: Compliant: ${input.ethicalCheckResult?.isCompliant}, Issues: ${input.ethicalCheckResult?.issuesFound?.join(', ') || 'None'}

      Based on all the above, provide a comprehensive, synthesized answer for the original user prompt. Combine insights and present a coherent response. Explain the workflow taken to arrive at this answer.
      `;
      const llmResponse = await genkitAi.generate({prompt: llmPrompt});
      // This assumes the LLM might return a structured response or just text.
      // For simplicity, we'll use the text part. A schema could be defined for better structure.
      synthesizedAnswer = llmResponse.text || "LLM-based synthesis failed, using basic aggregation.";
      workflowExplanation = "The prompt was processed through multiple AI agents. An LLM synthesized the final response based on their collective outputs and an ethical review.";

    } catch (e: any) {
      console.error("[ResultSynthesizer] LLM Synthesis Error:", e.message);
      synthesizedAnswer += "\n(LLM-based final synthesis failed, using basic aggregated data.)";
    }
  }


  // The final output that NeuroSynapseOutput expects
  return {
    originalPrompt: input.originalPrompt,
    hasImageContext: input.hasImageContext,
    decomposedTasks: input.executorOutputs?.map((eo, i) => ({ // This needs to be structured better. Orkes passes ${orkes.input.decomposedTasks}
        id: eo?.taskReferenceName || `exec_task_${i}`,
        taskDescription: eo?.promptFragment || "Executor Task",
        assignedAgent: eo?.taskReferenceName?.split('_')[1] || "Executor", // infer from taskRef
        status: eo?.status || "UNKNOWN",
        resultSummary: eo?.imageDataUri ? "[Image Generated]" : eo?.generatedCode ? "[Code Generated]" : eo?.synthesizedText || eo?.summary || JSON.stringify(eo).substring(0,100)+"..."
    })) || [],
    synthesizedAnswer: synthesizedAnswer,
    workflowExplanation: workflowExplanation,
    // workflowDiagramData would ideally come from Orkes execution history if fetched
    workflowDiagramData: { 
        nodes: [{id: 'input', label: 'User Prompt', type: 'input'}, {id: 'synthesizer', label: 'Result Synthesizer', type: 'process'}, {id: 'output', label: 'Final Output', type: 'output'}],
        edges: [{id: 'e1', source: 'input', target: 'synthesizer', animated: true}, {id: 'e2', source: 'synthesizer', target: 'output', animated: true}]
    },
    toolUsages: [], // Populate if tools were used by executors
    ethicalCompliance: input.ethicalCheckResult || { isCompliant: true, confidenceScore: 0.8, issuesFound: ["Ethical check step might have been skipped or failed if data is missing."]},
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Input to synthesizer is the collection of outputs from all preceding (forked) tasks.
    // Orkes typically makes these available under keys like `task_ref_name.output` or a custom combined input.
    // For simplicity, we'll assume the Orkes workflow maps these into `body.input.executorOutputs`.
    const input: SynthesizerInput = body.input;

    if (!input || !input.originalPrompt || !input.executorOutputs) {
      return NextResponse.json({ error: "Missing or invalid input for result synthesizer" }, { status: 400 });
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

    const finalResult = await synthesizeResults(input);
    
    console.log("[ResultSynthesizer] Synthesis complete.");
    return NextResponse.json({ ...finalResult });

  } catch (error: any) {
    console.error("[ResultSynthesizer] Error:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}
