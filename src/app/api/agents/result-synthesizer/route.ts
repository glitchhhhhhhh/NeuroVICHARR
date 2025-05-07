// src/app/api/agents/result-synthesizer/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ai as genkitAi } from '@/ai/genkit';
import type { NeuroSynapseOutput, SubTask, ToolUsage, EthicalCompliance, NeuroSynapseInput } from '@/ai/flows/neuro-synapse-flow'; // Import relevant types

interface ExecutorOutputItem {
  taskReferenceName?: string; // e.g. "execute_web_search_task_1_ref"
  // Specific fields from different executors
  generatedCode?: string;
  language?: string;
  imageDataUri?: string;
  imageUrl?: string; // for mock
  altText?: string;
  synthesizedText?: string;
  searchResults?: Array<{ title: string; snippet: string; url: string }>;
  summary?: string; // for web search summary
  status?: string;
  error?: string;
  promptFragment?: string; // The specific sub-prompt this executor worked on
  // Add any other fields specific to executor outputs
}

interface SynthesizerInput {
  originalPrompt: string;
  hasImageContext: boolean;
  userContext?: NeuroSynapseInput['userContext']; // From original workflow input
  analysisSummary?: string; // From Analyzer
  planSummary?: string; // From Planner
  // executorOutputs should be an array of actual outputs from the forked tasks
  // The FORK_JOIN_DYNAMIC task in Orkes outputs a map: { "taskRefName1": {output...}, "taskRefName2": {output...} }
  // We need to transform this map into an array in the workflow before calling this agent,
  // or handle the map transformation here if the workflow passes it as a map.
  // Assuming workflow passes it as an array: `jsonUtils.toJsonPath(fork_join_executors_ref.output, '$.*')`
  executorOutputs: ExecutorOutputItem[]; 
  ethicalCheckResult?: EthicalCompliance; 
  // For diagram generation, we might need info about the planned tasks from the planner
  plannedTasks?: Array<{ id: string; description: string; agent: string }>; // From Planner or Analyzer
  deconstructedSubTasks?: Array<{ id: string; description: string; agent: string }>; // From Analyzer
}

// Output from this agent should match parts of NeuroSynapseOutputSchema
type SynthesizerAgentOutput = Omit<NeuroSynapseOutput, 'orkesWorkflowId' | 'orkesWorkflowStatus'>;


function generateWorkflowDiagramData(
  originalPrompt: string,
  hasImageContext: boolean,
  analysisSummary: string | undefined,
  planSummary: string | undefined,
  executorOutputs: ExecutorOutputItem[],
  ethicalCheckResult: EthicalCompliance | undefined,
  deconstructedSubTasks?: Array<{ id: string; description: string; agent: string }>
): NeuroSynapseOutput['workflowDiagramData'] {
  const nodes: NeuroSynapseOutput['workflowDiagramData']['nodes'] = [];
  const edges: NeuroSynapseOutput['workflowDiagramData']['edges'] = [];
  let edgeCounter = 1;

  nodes.push({ id: 'user_input', label: 'User Input', type: 'input' });
  if (hasImageContext) {
    nodes.push({ id: 'image_context', label: 'Image Context', type: 'image_input' });
    edges.push({ id: `e${edgeCounter++}`, source: 'image_context', target: 'analyzer_agent', animated: true });
  }

  nodes.push({ id: 'analyzer_agent', label: 'Analyzer Agent', type: 'agent' });
  edges.push({ id: `e${edgeCounter++}`, source: 'user_input', target: 'analyzer_agent', animated: true });
  
  nodes.push({ id: 'planner_agent', label: 'Planner Agent', type: 'agent' });
  edges.push({ id: `e${edgeCounter++}`, source: 'analyzer_agent', target: 'planner_agent', animated: true });

  // Decision node based on whether there are tasks to fork
  const requiresFork = (deconstructedSubTasks && deconstructedSubTasks.length > 0) || (executorOutputs && executorOutputs.length > 0);
  nodes.push({ id: 'decision_fork', label: 'Fork Execution?', type: 'decision' });
  edges.push({ id: `e${edgeCounter++}`, source: 'planner_agent', target: 'decision_fork', animated: true });


  if (requiresFork) {
    nodes.push({ id: 'fork_node', label: 'Parallel Execution', type: 'fork' });
    edges.push({ id: `e${edgeCounter++}`, source: 'decision_fork', target: 'fork_node', animated: true });

    const taskRefsUsedInFork: string[] = [];
    (executorOutputs || deconstructedSubTasks || []).forEach((task, index) => {
      const taskRef = task.taskReferenceName || task.id || `exec_${index}`;
      if(taskRefsUsedInFork.includes(taskRef)) return; // Avoid duplicate nodes if taskRef is just from deconstructedSubTasks
      taskRefsUsedInFork.push(taskRef);

      let agentType: string = 'Executor';
      if ('assignedAgent' in task && typeof task.assignedAgent === 'string') agentType = task.assignedAgent;
      else if(task.taskReferenceName?.includes("image")) agentType = "ExecutorImage";
      else if(task.taskReferenceName?.includes("code")) agentType = "ExecutorCode";
      else if(task.taskReferenceName?.includes("web_search")) agentType = "ExecutorWebSearch";
      else if(task.taskReferenceName?.includes("text")) agentType = "ExecutorText";
      
      nodes.push({ id: taskRef, label: agentType, type: 'agent' });
      edges.push({ id: `e${edgeCounter++}`, source: 'fork_node', target: taskRef, animated: true });
      // Edge from executor to join node (implicitly, join happens before ethical check)
    });
    
    nodes.push({ id: 'join_node', label: 'Join Results', type: 'join' });
    taskRefsUsedInFork.forEach(taskRef => {
       edges.push({ id: `e${edgeCounter++}`, source: taskRef, target: 'join_node', animated: true });
    });
    
    nodes.push({ id: 'ethical_checker_agent_forked', label: 'Ethical Checker', type: 'agent' });
    edges.push({ id: `e${edgeCounter++}`, source: 'join_node', target: 'ethical_checker_agent_forked', animated: true });

    nodes.push({ id: 'synthesizer_agent_forked', label: 'Result Synthesizer', type: 'agent' });
    edges.push({ id: `e${edgeCounter++}`, source: 'ethical_checker_agent_forked', target: 'synthesizer_agent_forked', animated: true });
    
    nodes.push({ id: 'final_output_forked', label: 'Final Output', type: 'output' });
    edges.push({ id: `e${edgeCounter++}`, source: 'synthesizer_agent_forked', target: 'final_output_forked', animated: true });

  } else { // Direct path (no fork)
    nodes.push({ id: 'ethical_checker_agent_direct', label: 'Ethical Checker', type: 'agent' });
    edges.push({ id: `e${edgeCounter++}`, source: 'decision_fork', target: 'ethical_checker_agent_direct', animated: true });
    
    nodes.push({ id: 'synthesizer_agent_direct', label: 'Result Synthesizer', type: 'agent' });
    edges.push({ id: `e${edgeCounter++}`, source: 'ethical_checker_agent_direct', target: 'synthesizer_agent_direct', animated: true });

    nodes.push({ id: 'final_output_direct', label: 'Final Output', type: 'output' });
    edges.push({ id: `e${edgeCounter++}`, source: 'synthesizer_agent_direct', target: 'final_output_direct', animated: true });
  }
  
  return { nodes, edges };
}


// Simulate result synthesis
async function synthesizeResults(input: SynthesizerInput): Promise<SynthesizerAgentOutput> {
  console.log(`[ResultSynthesizer] Synthesizing results for prompt: "${input.originalPrompt}"`);
  console.log("[ResultSynthesizer] Executor Outputs received:", JSON.stringify(input.executorOutputs, null, 2).substring(0, 500) + "...");
  if (input.ethicalCheckResult) console.log("[ResultSynthesizer] Ethical Check received:", input.ethicalCheckResult);
  if (input.userContext) console.log("[ResultSynthesizer] User Context received:", input.userContext);


  const useLLMSynthesis = !process.env.USE_MOCK_ORKES_CLIENT && process.env.GENAI_API_KEY;

  let synthesizedAnswer: string;
  let workflowExplanation: string;
  let agentActivityLog: string[] = [];
  let toolUsages: ToolUsage[] = []; // Populate this if executors report tool usage

  // Start building agent activity log
  if(input.analysisSummary) agentActivityLog.push(`Analyzer: ${input.analysisSummary}`);
  if(input.planSummary) agentActivityLog.push(`Planner: ${input.planSummary}`);
  (input.executorOutputs || []).forEach((out, index) => {
    const taskRef = out.taskReferenceName || `executor_task_${index + 1}`;
    let summary = "Processed.";
    if(out.status === "COMPLETED_MOCK") summary = "Processed (Mock).";
    if(out.status === "FAILED") summary = `Failed: ${out.error || "Unknown error"}`;
    else if(out.summary) summary = out.summary;
    else if(out.synthesizedText) summary = `Generated text: ${out.synthesizedText.substring(0,50)}...`;
    else if(out.imageDataUri || out.imageUrl) summary = `Generated image.`;
    else if(out.generatedCode) summary = `Generated code snippet.`;
    agentActivityLog.push(`${taskRef}: ${summary}`);
    // Mock tool usage extraction for demonstration
    if (out.searchResults && out.searchResults.length > 0) {
      toolUsages.push({toolName: "WebSearchTool", toolInput: {query: out.promptFragment}, toolOutput: {summary: out.summary, firstResult: out.searchResults[0].title}});
    }
  });
  if(input.ethicalCheckResult) {
    agentActivityLog.push(`EthicalChecker: Compliant: ${input.ethicalCheckResult.isCompliant}. Issues: ${input.ethicalCheckResult.issuesFound?.join(', ') || 'None'}`);
  }


  if (useLLMSynthesis) {
    try {
      const llmPrompt = `
      You are the final Result Synthesizer AI for the NeuroVichar platform. Your role is to compile findings from multiple specialized AI agents into a single, coherent, and comprehensive response for the user.
      You must also explain the workflow taken and generate a simple activity log. Simulate a "debate and consensus" outcome where appropriate if multiple agents provided textual outputs on similar topics, highlighting how different perspectives were merged.

      User's Original Prompt: "${input.originalPrompt}"
      ${input.hasImageContext ? "User provided image context, which was analyzed." : ""}
      ${input.userContext ? `User's activity context (e.g., current focus: ${input.userContext.currentFocus || 'N/A'}, preferred tone: ${input.userContext.preferredTone || 'default'}) was considered for tailoring the response.` : ""}

      Summary from Analyzer Agent:
      ${input.analysisSummary || "Analysis step was minimal or not detailed."}

      Summary from Planner Agent:
      ${input.planSummary || "Planning step was minimal or not detailed."}

      Outputs from Executor Agents:
      ${(input.executorOutputs || []).map((out, i) => {
        if (!out) return `Agent ${i+1}: No output received.`;
        let outputString = `Agent ${out.taskReferenceName || `Executor ${i+1}`} (focused on: "${out.promptFragment || 'N/A'}"):\n`;
        if(out.generatedCode) outputString += `  - Generated Code: [Code block was generated]\n`;
        if(out.imageDataUri || out.imageUrl) outputString += `  - Generated Image: [An image was generated related to this sub-task]\n`;
        if(out.synthesizedText) outputString += `  - Textual Output: "${out.synthesizedText.substring(0,150)}..."\n`;
        if(out.searchResults && out.searchResults.length > 0) outputString += `  - Web Search: Found ${out.searchResults.length} results. Top result: "${out.searchResults[0]?.title || 'N/A'}"\n`;
        if(out.error) outputString += `  - Error during execution: ${out.error}\n`;
        if(Object.keys(out).length === 0) outputString += `  - No specific textual or media output.\n`
        return outputString;
      }).join("\n")}

      Ethical Compliance Check Result:
      - Is Compliant: ${input.ethicalCheckResult?.isCompliant}
      - Issues Found: ${input.ethicalCheckResult?.issuesFound?.join(', ') || 'None'}
      - Remediation Suggestions: ${input.ethicalCheckResult?.remediationSuggestions?.join(', ') || 'None'}

      Your Tasks:
      1.  **Synthesized Answer**: Based on ALL the above information, provide a comprehensive, well-structured answer to the user's original prompt. If user context (like preferred tone) was provided, adapt your language accordingly. If textual outputs from multiple agents covered similar ground, synthesize them, perhaps noting how a consensus view was formed or differing perspectives were integrated.
      2.  **Workflow Explanation**: Briefly explain the high-level workflow NeuroVichar undertook. Mention the key stages (analysis, planning, parallel execution by specialized agents, ethical review, final synthesis). If a debate/consensus was simulated, mention it.
      3.  **Agent Activity Log**: Generate a concise list of key activities performed by the agents. (This will be complemented by system logs). Example: ["Analyzer: Decomposed prompt into 3 sub-tasks.", "Planner: Assigned tasks to Text, Image, and WebSearch agents.", "ExecutorText: Generated summary on topic X.", "EthicalChecker: Reviewed content, found compliant."]

      Output ONLY a JSON object with the following exact keys: "synthesizedAnswer", "workflowExplanation", "agentActivityLog". Ensure "agentActivityLog" is an array of strings.
      `;
      
      console.log("[ResultSynthesizer] Sending prompt to LLM for synthesis:\n", llmPrompt.substring(0,1000) + "...");

      const llmResponse = await genkitAi.generate({
          prompt: llmPrompt,
          output: {
            format: 'json',
            schema: z.object({
                synthesizedAnswer: z.string(),
                workflowExplanation: z.string(),
                agentActivityLog: z.array(z.string()),
            })
          }
      });
      
      const structuredOutput = llmResponse.output;
      if (!structuredOutput) {
          throw new Error("LLM returned empty or invalid structured output for synthesis.");
      }
      console.log("[ResultSynthesizer] Received structured output from LLM:", structuredOutput);

      synthesizedAnswer = structuredOutput.synthesizedAnswer;
      workflowExplanation = structuredOutput.workflowExplanation;
      agentActivityLog = structuredOutput.agentActivityLog; // Prefer LLM generated if available and good.

    } catch (e: any) {
      console.error("[ResultSynthesizer] LLM Synthesis Error:", e.message);
      synthesizedAnswer = `Synthesis Error: Could not generate a fully integrated response due to an LLM error (${e.message}). Basic aggregation of results: \n` + (input.executorOutputs || []).map(o => o.synthesizedText || o.summary || (o.imageDataUri ? "[Image Generated]" : "")).filter(Boolean).join("\n");
      workflowExplanation = "The prompt was processed through multiple AI agents. An error occurred during the final LLM-based synthesis. Basic results have been aggregated.";
      // Keep the system-generated agentActivityLog in case of LLM failure
    }
  } else { // Mock synthesis if no Genkit API key
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    synthesizedAnswer = `Mock Synthesized Answer for: "${input.originalPrompt}".\n`;
    if (input.hasImageContext) synthesizedAnswer += "Image context was considered.\n";
    if (input.analysisSummary) synthesizedAnswer += `Analysis: ${input.analysisSummary}\n`;
    if (input.planSummary) synthesizedAnswer += `Plan: ${input.planSummary}\n`;
    synthesizedAnswer += "\nKey mock findings:\n";
    (input.executorOutputs || []).forEach((out, index) => {
        synthesizedAnswer += `- Mock Output from ${out.taskReferenceName || `executor_${index + 1}`}: Processed "${out.promptFragment || 'sub-task'}".\n`;
        if (out.synthesizedText) synthesizedAnswer += `  Detail: ${out.synthesizedText.substring(0,100)}...\n`;
    });
    workflowExplanation = "This is a mock workflow explanation. The prompt was analyzed, planned, and sub-tasks were executed by mock agents. Results were then combined.";
    agentActivityLog.push("MockSynthesizer: Aggregated mock results.");
  }

  const workflowDiagramData = generateWorkflowDiagramData(
    input.originalPrompt,
    input.hasImageContext,
    input.analysisSummary,
    input.planSummary,
    input.executorOutputs,
    input.ethicalCheckResult,
    input.deconstructedSubTasks
  );


  const finalOutput: SynthesizerAgentOutput = {
    originalPrompt: input.originalPrompt,
    hasImageContext: input.hasImageContext,
    // decomposedTasks is usually provided by the Genkit flow from Orkes tasks,
    // but if ResultSynthesizer is expected to format it, it would do so here.
    // For now, assume Genkit flow handles it.
    decomposedTasks: [], // This will be populated by the main NeuroSynapse flow based on Orkes tasks
    synthesizedAnswer: synthesizedAnswer,
    workflowExplanation: workflowExplanation,
    workflowDiagramData: workflowDiagramData,
    toolUsages: toolUsages, 
    ethicalCompliance: input.ethicalCheckResult || { isCompliant: true, confidenceScore: 0.8, issuesFound: ["Ethical check step might have been skipped or failed if data is missing."]},
    agentActivityLog: agentActivityLog,
  };
  return finalOutput;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: SynthesizerInput = body.input || body; // Accommodate Orkes input wrapper

    if (!input || !input.originalPrompt || (!input.executorOutputs && !input.analysisSummary)) { // Allow synthesis even if no executors ran (direct path)
      return NextResponse.json({ error: "Missing or invalid input for result synthesizer" }, { status: 400 });
    }
    
    const finalResult = await synthesizeResults(input);
    
    console.log("[ResultSynthesizer] Synthesis complete. Sending back:", JSON.stringify(finalResult).substring(0, 300) + "...");
    return NextResponse.json(finalResult); // Return the direct object, Orkes will handle it

  } catch (error: any) {
    console.error("[ResultSynthesizer] Error:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}
