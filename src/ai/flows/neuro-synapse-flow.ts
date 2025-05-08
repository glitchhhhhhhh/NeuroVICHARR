'use server';
/**
 * @fileOverview Neuro Synapse AI flow for complex prompt processing.
 * This version simulates multi-agent orchestration using Genkit flows and LLM prompts.
 *
 * - neuroSynapse - A function that orchestrates the Neuro Synapse process.
 * - NeuroSynapseInput - The input type for the neuroSynapse function.
 * - NeuroSynapseOutput - The return type for the neuroSynapse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {UserContext} from '@/ai/flows/interpret-user-intent-flow';
import {generateImage} from '@/ai/flows/generate-image-flow';
import {browseWebPage, type WebBrowsingResult} from '@/services/web-browser';
import {catalyzeIdea} from '@/ai/flows/catalyze-idea-flow';

// Schemas for Input and Output
const SubTaskSchema = z.object({
  id: z.string().describe('A unique identifier for the sub-task.'),
  taskDescription: z.string().describe('A clear, concise description of the sub-task.'),
  assignedAgent: z.string().describe('The type of virtual agent or task category (e.g., "TextGenerator", "ImageGenerator", "WebBrowser", "CodeGenerator", "ImageAnalyzer").'),
  status: z.enum(['PENDING', 'ANALYZING_IMAGE', 'GENERATING_IMAGE', 'GENERATING_TEXT', 'BROWSING_WEB', 'GENERATING_CODE', 'COMPLETED', 'FAILED', 'SKIPPED']).describe('The current status of the sub-task.'),
  resultSummary: z.string().optional().describe('A brief summary of the sub-task\'s outcome. Defaults to "Task details not available or task did not produce a summary." if not applicable or provided.'),
  outputData: z.any().optional().describe("Raw output data from the task, if applicable (e.g., imageDataUri, text, code)."),
});
export type SubTask = z.infer<typeof SubTaskSchema>;

const ToolUsageSchema = z.object({
  toolName: z.string().describe('The name of the tool used (e.g., "WebBrowser", "ImageGenerationModel").'),
  toolInput: z.any().optional().describe('The input provided to the tool (e.g., URL, prompt).'),
  toolOutput: z.any().optional().describe('The output received from the tool (e.g., web content, image URI).'),
});
export type ToolUsage = z.infer<typeof ToolUsageSchema>;

const EthicalComplianceSchema = z.object({
  isCompliant: z.boolean().describe('Whether the overall output is ethically compliant.'),
  issuesFound: z.array(z.string()).optional().describe('A list of ethical issues identified, if any.'),
  confidenceScore: z.number().min(0).max(1).optional().describe('Confidence in the ethical assessment.'),
  remediationSuggestions: z.array(z.string()).optional().describe('Suggestions for remediating ethical issues.'),
});
export type EthicalCompliance = z.infer<typeof EthicalComplianceSchema>;

const WorkflowNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['input', 'image_input', 'process', 'output', 'agent', 'tool', 'decision', 'fork', 'join', 'llm_prompt', 'service_call']),
});
const WorkflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  animated: z.boolean().optional(),
  label: z.string().optional(),
});
const WorkflowDiagramDataSchema = z.object({
  nodes: z.array(WorkflowNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
}).describe('Data structured for rendering a visual workflow diagram, reflecting the AI\'s process.');


const NeuroSynapseInputSchema = z.object({
  mainPrompt: z.string().describe('The complex user prompt to be processed by Neuro Synapse. Can be empty if magicMode is triggered by context.'),
  imageDataUri: z.string().optional().describe("Optional image data for context, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  userContext: z.custom<UserContext>().optional().describe("User's recent activity and preferences for 'Mind Prompt' suggestions or prompt personalization."),
  isMagicMode: z.boolean().optional().describe("If true, NeuroSynapse might generate its own prompt based on userContext if mainPrompt is empty.")
});
export type NeuroSynapseInput = z.infer<typeof NeuroSynapseInputSchema>;

const NeuroSynapseOutputSchema = z.object({
  originalPrompt: z.string().describe('The original or magic-generated prompt received from the user.'),
  hasImageContext: z.boolean().describe('Whether image context was provided and considered.'),
  decomposedTasks: z.array(SubTaskSchema).describe('An array of sub-tasks as processed by the simulated agents.'),
  synthesizedAnswer: z.string().describe('The final, synthesized answer compiled from the results of all sub-tasks.'),
  workflowExplanation: z.string().describe('An explanation of how the prompt was decomposed, processed, and results synthesized.'),
  workflowDiagramData: WorkflowDiagramDataSchema,
  toolUsages: z.array(ToolUsageSchema).optional().describe('Information about any tools used by agents during the process.'),
  ethicalCompliance: EthicalComplianceSchema.describe('Details from the ethical compliance check performed during the workflow.'),
  agentActivityLog: z.array(z.string()).optional().describe("Log of agent activities and decision points."),
});
export type NeuroSynapseOutput = z.infer<typeof NeuroSynapseOutputSchema>;


// Main Orchestration Flow
export async function neuroSynapse(input: NeuroSynapseInput): Promise<NeuroSynapseOutput> {
  const agentActivityLog: string[] = [];
  const decomposedTasksList: SubTask[] = [];
  const toolUsagesList: ToolUsage[] = [];
  const workflowNodes: z.infer<typeof WorkflowNodeSchema>[] = [];
  const workflowEdges: z.infer<typeof WorkflowEdgeSchema>[] = [];
  let edgeCounter = 1;
  let currentPrompt = input.mainPrompt;

  agentActivityLog.push("Neuro Synapse initiated.");
  workflowNodes.push({ id: 'start', label: 'User Input', type: 'input' });

  if (input.isMagicMode && !input.mainPrompt && input.userContext) {
    agentActivityLog.push("Magic Mode: Attempting to generate prompt from user context.");
    workflowNodes.push({ id: 'magic_prompt_catalyst', label: 'Mind Prompt Catalyst', type: 'agent' });
    workflowEdges.push({ id: `e${edgeCounter++}`, source: 'start', target: 'magic_prompt_catalyst', label: 'User Context' });
    try {
      const catalyzed = await catalyzeIdea({ theme: input.userContext.currentFocus || "general exploration based on recent activity" });
      currentPrompt = catalyzed.starterComplexPrompt;
      agentActivityLog.push(`Magic Mode: Generated prompt - "${currentPrompt.substring(0, 100)}..."`);
      workflowEdges.push({ id: `e${edgeCounter++}`, source: 'magic_prompt_catalyst', target: 'analyzer_planner', label: 'Suggested Prompt' });
    } catch (e: any) {
      agentActivityLog.push(`Magic Mode: Failed to generate prompt - ${e.message}. Proceeding with empty or default if applicable.`);
       // Fallback if catalyzeIdea fails, or simply let the empty prompt be handled by the analyzer
    }
  } else {
     workflowEdges.push({ id: `e${edgeCounter++}`, source: 'start', target: 'analyzer_planner', label: 'User Prompt' });
  }


  // 1. Prompt Analysis & Task Decomposition (LLM-driven)
  workflowNodes.push({ id: 'analyzer_planner', label: 'Prompt Analyzer & Planner', type: 'llm_prompt' });
  agentActivityLog.push("Analyzing prompt and decomposing into sub-tasks...");

  const DecomposerPlannerOutputSchema = z.object({
    planSummary: z.string().describe("A brief summary of the overall plan."),
    subTasks: z.array(z.object({
      id: z.string().describe("A unique ID for this sub-task (e.g., task_1, task_2)."),
      description: z.string().describe("The detailed description or prompt for this sub-task."),
      agentType: z.enum(["ImageAnalyzer", "ImageGenerator", "TextGenerator", "WebBrowser", "CodeGenerator", "Summarizer", "GenericKnowledge", "EthicalReviewer", "DebateModerator"]).describe("The type of agent best suited for this task."),
      dependencies: z.array(z.string()).optional().describe("IDs of tasks that must be completed before this one can start."),
      expectedOutputFormat: z.string().optional().describe("Brief description of the expected output format or key deliverables for this sub-task (e.g., 'JSON object with sentiment scores', 'Python code snippet', 'Markdown summary')."),
    })).describe("A list of decomposed sub-tasks with assigned agent types."),
    overallConfidence: z.number().min(0).max(1).optional().describe("Planner's confidence in this decomposition plan."),
    estimatedComplexity: z.enum(["low", "medium", "high"]).optional().describe("Estimated complexity of the overall prompt."),
  });

  const decomposerPlannerPrompt = ai.definePrompt({
    name: 'neuroSynapseDecomposerPlanner',
    input: { schema: NeuroSynapseInputSchema.extend({ currentPrompt: z.string() }) },
    output: { schema: DecomposerPlannerOutputSchema },
    prompt: `You are an AI Task Orchestrator for Neuro Synapse, a system that uses multiple AI agents to solve complex prompts.
User's Main Prompt: "{{currentPrompt}}"
{{#if imageDataUri}}Image context IS provided. Consider adding an "ImageAnalyzer" task first to describe the image.{{/if}}
{{#if userContext}}User Context (Focus: {{userContext.currentFocus}}, Tone: {{userContext.preferredTone}}). Adapt plan to this context.{{/if}}

Your goal is to:
1.  Create a concise 'planSummary' (1-2 sentences) for how Neuro Synapse will address the main prompt.
2.  Decompose the main prompt into 2-5 logical, actionable 'subTasks'. Prioritize clarity and assign the most suitable agent.
3.  For each subTask:
    a.  Assign a unique 'id' (e.g., "task_1_analysis", "task_2_generation").
    b.  Write a clear 'description' that will serve as the prompt for the sub-agent. If the main prompt has image context and an ImageAnalyzer task is created, subsequent tasks should be able to refer to its output (e.g., "Based on the image analysis from task_1...").
    c.  Assign an 'agentType' from: "ImageAnalyzer", "ImageGenerator", "TextGenerator", "WebBrowser", "CodeGenerator", "Summarizer", "GenericKnowledge", "EthicalReviewer", "DebateModerator".
    d.  (Optional) List 'dependencies' as an array of task IDs that must complete before this one. An ImageAnalyzer task should usually be a dependency for tasks that need to use image content.
    e.  (Optional) Specify an 'expectedOutputFormat' (e.g., 'a list of bullet points', 'a JSON object with fields x and y', 'a Python function').
4.  (Optional) Provide 'overallConfidence' (0.0-1.0) in this plan.
5.  (Optional) Estimate 'estimatedComplexity' ("low", "medium", "high").

Constraint: If an image is provided (imageDataUri is present), the FIRST task MUST be an 'ImageAnalyzer' task to describe the image content. Subsequent tasks can then reference this analysis.
Example for Image Task: { "id": "task_1_img_analysis", "description": "Analyze the provided image for key objects, scenes, and overall style. Output a detailed textual description.", "agentType": "ImageAnalyzer", "expectedOutputFormat": "Detailed textual description of image content." }

Example for dependent task: { "id": "task_2_creative_writing", "description": "Based on the image analysis from task_1_img_analysis, write a short story (3 paragraphs) inspired by the scene.", "agentType": "TextGenerator", "dependencies": ["task_1_img_analysis"], "expectedOutputFormat": "A short story in markdown format." }

If the prompt involves comparing viewpoints or requires critical evaluation, consider a "DebateModerator" agent that takes inputs from other agents.
Ensure your entire response is a single JSON object matching the DecomposerPlannerOutputSchema.
`,
  });

  let decompositionResult;
  try {
    const { output } = await decomposerPlannerPrompt({ ...input, currentPrompt });
    if (!output) throw new Error("Decomposer/Planner LLM failed to return output.");
    decompositionResult = output;
    agentActivityLog.push(`Planning complete: ${output.planSummary}. ${output.subTasks.length} sub-tasks identified. Complexity: ${output.estimatedComplexity || 'N/A'}. Confidence: ${((output.overallConfidence || 0) * 100).toFixed(0)}%`);
    output.subTasks.forEach(st => {
      decomposedTasksList.push({
        id: st.id,
        taskDescription: st.description,
        assignedAgent: st.agentType,
        status: 'PENDING',
        resultSummary: "Awaiting execution", 
      });
      workflowNodes.push({ id: st.id, label: `${st.agentType} (${st.id})`, type: 'agent' });
      if (st.dependencies && st.dependencies.length > 0) {
        st.dependencies.forEach(depId => {
          workflowEdges.push({ id: `e${edgeCounter++}`, source: depId, target: st.id, label: 'Dependency', animated: true });
        });
      } else {
        workflowEdges.push({ id: `e${edgeCounter++}`, source: 'analyzer_planner', target: st.id, label: 'Assign Task', animated: true });
      }
    });
  } catch (e: any) {
    agentActivityLog.push(`Error during prompt analysis: ${e.message}`);
    return {
      originalPrompt: currentPrompt,
      hasImageContext: !!input.imageDataUri,
      decomposedTasks: [{ id: 'analysis_error', taskDescription: 'Failed to analyze prompt', assignedAgent: 'System', status: 'FAILED', resultSummary: e.message }],
      synthesizedAnswer: `Error: Could not process the prompt due to an analysis failure: ${e.message}`,
      workflowExplanation: "The initial prompt analysis and task decomposition phase failed.",
      workflowDiagramData: { nodes: workflowNodes, edges: workflowEdges },
      ethicalCompliance: { isCompliant: false, issuesFound: ["System error during analysis"] },
      agentActivityLog,
    };
  }
  
  // 2. (Simulated) Agent Execution Loop & Debate/Verification Step
  const taskResults: Record<string, any> = {};
  let debateModeratorOutput: string | null = null;

  // Create a map for easy lookup of subtask definitions
  const subTaskDefinitions = new Map(decompositionResult.subTasks.map(st => [st.id, st]));


  for (let i = 0; i < decomposedTasksList.length; i++) {
    const task = decomposedTasksList[i];
    const taskDefinition = subTaskDefinitions.get(task.id);

    // Dependency check
    if (taskDefinition?.dependencies?.some(depId => taskResults[depId] === undefined || decomposedTasksList.find(t => t.id === depId)?.status !== 'COMPLETED')) {
      agentActivityLog.push(`Task ${task.id} (${task.assignedAgent}) skipped due to unmet dependencies or previous failure.`);
      task.status = 'SKIPPED';
      task.resultSummary = 'Skipped due to unmet dependencies.';
      continue;
    }
    
    agentActivityLog.push(`Executing task ${task.id}: ${task.assignedAgent} - "${task.taskDescription.substring(0,50)}..."`);
    task.status = task.assignedAgent === "ImageAnalyzer" ? 'ANALYZING_IMAGE' :
                  task.assignedAgent === "ImageGenerator" ? 'GENERATING_IMAGE' :
                  task.assignedAgent === "TextGenerator" || task.assignedAgent === "Summarizer" || task.assignedAgent === "GenericKnowledge" ? 'GENERATING_TEXT' :
                  task.assignedAgent === "WebBrowser" ? 'BROWSING_WEB' :
                  task.assignedAgent === "CodeGenerator" ? 'GENERATING_CODE' :
                  task.assignedAgent === "EthicalReviewer" ? 'GENERATING_TEXT' : // Assuming ethical reviewer outputs text
                  task.assignedAgent === "DebateModerator" ? 'GENERATING_TEXT' : // Assuming debate moderator outputs text
                  'PROCESSING';


    try {
      let taskOutput: any;
      let summary: string = "Processing...";

       // Construct context from dependencies
      let dependenciesContext = "";
      if (taskDefinition?.dependencies) {
        taskDefinition.dependencies.forEach(depId => {
          const depResult = taskResults[depId];
          if (depResult) {
            const depTask = decomposedTasksList.find(t => t.id === depId);
            dependenciesContext += `Output from ${depTask?.assignedAgent} (${depId}):\n${typeof depResult === 'string' ? depResult : JSON.stringify(depResult, null, 2)}\n\n`;
          }
        });
      }
      const currentTaskPrompt = dependenciesContext ? `${dependenciesContext}Based on the above, ${task.taskDescription}` : task.taskDescription;


      switch (task.assignedAgent) {
        case 'ImageAnalyzer':
          if (!input.imageDataUri) {
            summary = "No image provided for analysis."; taskOutput = { analysis: summary }; break;
          }
          const analysisPrompt = ai.definePrompt({ name: `imageContextAnalyzer_${task.id}`, input: { schema: z.object({ imageDataUri: z.string(), query: z.string() }) }, output: { schema: z.object({ analysis: z.string().describe("Detailed textual description of the image's content, style, objects, and overall mood.") }) }, prompt: 'Analyze this image: {{media url=imageDataUri}}. Focus on fulfilling the query: {{query}}' });
          const analysis = await analysisPrompt({ imageDataUri: input.imageDataUri, query: currentTaskPrompt });
          taskOutput = analysis.output;
          summary = taskOutput?.analysis || "Image analysis completed.";
          toolUsagesList.push({ toolName: "ImageAnalysisModel", toolInput: { query: currentTaskPrompt, imageUsed: true }, toolOutput: summary });
          break;
        case 'ImageGenerator':
          const imageResult = await generateImage({ prompt: currentTaskPrompt });
          taskOutput = imageResult;
          summary = `Image generated for: "${imageResult.promptUsed}". URI available.`;
          toolUsagesList.push({ toolName: "ImageGenerationModel", toolInput: { prompt: currentTaskPrompt }, toolOutput: {imageDataUri: imageResult.imageDataUri }});
          break;
        case 'TextGenerator':
        case 'Summarizer':
        case 'GenericKnowledge':
        case 'EthicalReviewer': // Handled similarly to text generation for simulation
          const textGenPrompt = ai.definePrompt({ name: `genericTextAgent_${task.id}`, input: { schema: z.object({ query: z.string() }) }, output: { schema: z.object({ response: z.string().describe(taskDefinition?.expectedOutputFormat || "A textual response to the query.") }) }, prompt: 'Respond to: {{query}}' });
          const textResult = await textGenPrompt({ query: currentTaskPrompt });
          taskOutput = textResult.output;
          summary = taskOutput?.response?.substring(0, 100) + "..." || "Text generation completed.";
          break;
        case 'WebBrowser':
          const urlMatch = currentTaskPrompt.match(/https?:\/\/[^\s]+/);
          if (!urlMatch) {
             summary = "No valid URL found in task description for WebBrowser."; taskOutput = { error: summary }; break;
          }
          const webResult: WebBrowsingResult = await browseWebPage(urlMatch[0]);
          const webSummarizer = ai.definePrompt({ name: `webSummarizer_${task.id}`, input: { schema: z.object({ content: z.string(), query: z.string()})}, output: { schema: z.object({ summary: z.string().describe("A concise summary of the web content based on the user's query.") }) }, prompt: 'Summarize the following web content based on the query "{{query}}":\n\n{{content}}'});
          const summarizedWeb = await webSummarizer({content: webResult.content, query: currentTaskPrompt });
          taskOutput = { title: webResult.title, summary: summarizedWeb.output?.summary, url: webResult.url };
          summary = `Web content from "${webResult.title}" summarized.`;
          toolUsagesList.push({ toolName: "WebBrowser", toolInput: { url: webResult.url, query: currentTaskPrompt }, toolOutput: taskOutput });
          break;
        case 'CodeGenerator':
          const codeGenPrompt = ai.definePrompt({ name: `codeGenAgent_${task.id}`, input: { schema: z.object({ query: z.string() }) }, output: { schema: z.object({ code: z.string().describe("Generated code snippet."), language: z.string().optional().describe("The programming language of the generated code.") }) }, prompt: 'Generate code for the following request: {{query}}. If a language is obvious from the request, specify it.' });
          const codeResult = await codeGenPrompt({ query: currentTaskPrompt });
          taskOutput = codeResult.output;
          summary = `Code generated (${codeResult.output?.language || 'unknown language'}).`;
          break;
        case 'DebateModerator':
            // This agent would take inputs from multiple other agents (specified in dependencies)
            // and facilitate a "debate" or "verification" process.
            // For simulation, it will just summarize the inputs from its dependencies.
            const debateInputParts: string[] = [];
            taskDefinition?.dependencies?.forEach(depId => {
                const depResult = taskResults[depId];
                if (depResult) {
                    const depTask = decomposedTasksList.find(t => t.id === depId);
                    debateInputParts.push(`Perspective from ${depTask?.assignedAgent} (${depId}):\n${typeof depResult === 'string' ? depResult : JSON.stringify(depResult, null, 2)}`);
                }
            });
            const debatePromptContent = `You are a Debate Moderator. Your task is to analyze the following perspectives from different AI agents and provide a synthesized summary, highlighting agreements, disagreements, and overall conclusions.
            Original Goal: ${task.taskDescription}

            Agent Inputs:
            ${debateInputParts.join('\n\n---\n\n')}

            Synthesized Summary and Conclusion:`;

            const debatePrompt = ai.definePrompt({ name: `debateModerator_${task.id}`, input: { schema: z.object({ content: z.string() }) }, output: { schema: z.object({ moderated_summary: z.string().describe("A synthesized summary of the debate, highlighting agreements, disagreements, and conclusions.") }) }, prompt: '{{content}}' });
            const debateResult = await debatePrompt({ content: debatePromptContent });
            taskOutput = debateResult.output;
            debateModeratorOutput = taskOutput?.moderated_summary || "Debate moderation completed. No definitive summary.";
            summary = debateModeratorOutput.substring(0,100) + "...";
            break;
        default:
          summary = `Unknown agent type: ${task.assignedAgent}. Task skipped.`;
          task.status = 'FAILED';
      }
      task.resultSummary = summary;
      task.outputData = taskOutput;
      task.status = 'COMPLETED';
      taskResults[task.id] = taskOutput;

    } catch (e: any) {
      agentActivityLog.push(`Error in task ${task.id} (${task.assignedAgent}): ${e.message}`);
      task.status = 'FAILED';
      task.resultSummary = `Error: ${e.message.substring(0,100)}...`;
      taskResults[task.id] = { error: e.message };
    }
    agentActivityLog.push(`Task ${task.id} ${task.status}. Summary: ${task.resultSummary?.substring(0,70)}...`);
    workflowEdges.push({ id: `e${edgeCounter++}`, source: task.id, target: 'ethical_reviewer_agent', label: 'Task Output', animated: true });
  }
  
  // 3. Ethical Review (LLM-driven, as a dedicated agent task if planned, or a final step)
  workflowNodes.push({ id: 'ethical_reviewer_agent', label: 'Ethical Reviewer', type: 'llm_prompt' });
  agentActivityLog.push("Performing ethical review of generated content...");
  
  const allTaskResultsString = decomposedTasksList.map(t => `Task ${t.id} (${t.assignedAgent}): ${t.resultSummary} \nOutput: ${JSON.stringify(t.outputData).substring(0,200)}...`).join('\n\n');
  let ethicalComplianceResult: EthicalCompliance;
  try {
    // Check if an EthicalReviewer task was planned. If so, its result is already in taskResults.
    const ethicalReviewerTask = decomposedTasksList.find(t => t.assignedAgent === "EthicalReviewer" && t.status === "COMPLETED");
    if (ethicalReviewerTask && taskResults[ethicalReviewerTask.id]?.response) {
        // Attempt to parse its response into the EthicalComplianceSchema structure
        // This is a simplification; a more robust way would be for the EthicalReviewer to output structured JSON.
        try {
            const parsedEthicalOutput = JSON.parse(taskResults[ethicalReviewerTask.id].response);
            ethicalComplianceResult = EthicalComplianceSchema.parse(parsedEthicalOutput);
             agentActivityLog.push(`Ethical review from dedicated agent. Compliant: ${ethicalComplianceResult.isCompliant}.`);
        } catch (parseError) {
            agentActivityLog.push(`Could not parse dedicated ethical reviewer output: ${parseError}. Performing standard review.`);
            // Fallback to standard review prompt if parsing fails
            const ethicalReviewPrompt = ai.definePrompt({
                name: 'neuroSynapseEthicalReviewer',
                input: { schema: z.object({ mainPrompt: z.string(), taskOutputs: z.string(), debateSummary: z.string().optional() }) },
                output: { schema: EthicalComplianceSchema },
                prompt: `Review the following user prompt and AI-generated task outputs for ethical concerns (hate speech, bias, harmful content, privacy violations, misinformation, illegal activities).
        User Prompt: "{{mainPrompt}}"
        Task Outputs Summary:
        {{taskOutputs}}
        {{#if debateSummary}}Debate Moderator Summary: {{debateSummary}}{{/if}}
        Respond with a JSON object adhering to EthicalComplianceSchema.
        Set 'isCompliant' to true/false. If not compliant, list 'issuesFound' and 'remediationSuggestions'. Provide a 'confidenceScore' (0-1).
        `,
            });
            const { output } = await ethicalReviewPrompt({ mainPrompt: currentPrompt, taskOutputs: allTaskResultsString, debateSummary: debateModeratorOutput ?? undefined });
            if (!output) throw new Error("Ethical Reviewer LLM failed to return output.");
            ethicalComplianceResult = output;
        }
    } else {
        // Standard ethical review if no dedicated agent task was run or it failed
        const ethicalReviewPrompt = ai.definePrompt({
            name: 'neuroSynapseEthicalReviewer',
            input: { schema: z.object({ mainPrompt: z.string(), taskOutputs: z.string(), debateSummary: z.string().optional() }) },
            output: { schema: EthicalComplianceSchema },
            prompt: `Review the following user prompt and AI-generated task outputs for ethical concerns (hate speech, bias, harmful content, privacy violations, misinformation, illegal activities).
    User Prompt: "{{mainPrompt}}"
    Task Outputs Summary:
    {{taskOutputs}}
    {{#if debateSummary}}Debate Moderator Summary: {{debateSummary}}{{/if}}
    Respond with a JSON object adhering to EthicalComplianceSchema.
    Set 'isCompliant' to true/false. If not compliant, list 'issuesFound' and 'remediationSuggestions'. Provide a 'confidenceScore' (0-1).
    `,
        });
        const { output } = await ethicalReviewPrompt({ mainPrompt: currentPrompt, taskOutputs: allTaskResultsString, debateSummary: debateModeratorOutput ?? undefined });
        if (!output) throw new Error("Ethical Reviewer LLM failed to return output.");
        ethicalComplianceResult = output;
        agentActivityLog.push(`Ethical review complete. Compliant: ${output.isCompliant}. Issues: ${output.issuesFound?.join(', ') || 'None'}`);
    }
  } catch (e: any) {
     agentActivityLog.push(`Error during ethical review: ${e.message}`);
     ethicalComplianceResult = { isCompliant: false, issuesFound: [`System error during ethical review: ${e.message}`], confidenceScore: 0 };
  }
  workflowEdges.push({ id: `e${edgeCounter++}`, source: 'ethical_reviewer_agent', target: 'result_synthesizer', label: 'Compliance Report', animated: true });

  // 4. Result Synthesis (LLM-driven)
  workflowNodes.push({ id: 'result_synthesizer', label: 'Result Synthesizer', type: 'llm_prompt' });
  agentActivityLog.push("Synthesizing final answer...");
  
  const FinalSynthesizerOutputSchema = z.object({
    synthesizedAnswer: z.string().describe("The final, comprehensive answer to the user's prompt."),
    workflowExplanation: z.string().describe("An explanation of the steps taken by Neuro Synapse."),
  });

  const finalSynthesizerPrompt = ai.definePrompt({
    name: 'neuroSynapseFinalSynthesizer',
    input: { schema: z.object({
        originalPrompt: z.string(),
        decomposedTasks: z.array(SubTaskSchema),
        ethicalCompliance: EthicalComplianceSchema,
        userContext: z.custom<UserContext>().optional(),
        planSummary: z.string().optional(),
        debateSummary: z.string().optional(),
    })},
    output: { schema: FinalSynthesizerOutputSchema },
    prompt: `You are the final Synthesizer for Neuro Synapse.
Original User Prompt: "{{originalPrompt}}"
{{#if userContext}}User Context (Focus: {{userContext.currentFocus}}, Tone: {{userContext.preferredTone}}) was considered.{{/if}}

Planner's Summary: {{planSummary}}

Decomposed Tasks & Results:
{{#each decomposedTasks}}
- Task ID: {{id}}
  Agent: {{assignedAgent}}
  Description: "{{taskDescription}}"
  Status: {{status}}
  Result Summary: "{{resultSummary}}"
  Output Data (preview): {{#if outputData}}{{jsonStringify outputData substring=200}}{{else}}N/A{{/if}}
{{/each}}

{{#if debateSummary}}
Debate Moderator's Summary:
"{{debateSummary}}"
{{/if}}

Ethical Compliance Check:
- Compliant: {{ethicalCompliance.isCompliant}}
- Issues (if any): {{#if ethicalCompliance.issuesFound}}{{#each ethicalCompliance.issuesFound}}- {{this}}{{/each}}{{else}}None{{/if}}
- Confidence: {{#if ethicalCompliance.confidenceScore}}{{multiply ethicalCompliance.confidenceScore 100 round=0}}%{{else}}N/A{{/if}}

Your Tasks:
1.  **Synthesized Answer**: Based on ALL the above information (task outputs, debate summary, ethical check), provide a comprehensive, well-structured answer to the user's original prompt. If user context (like preferredTone) was provided, adapt your language. If a Debate Moderator provided a summary, integrate its findings. If ethical issues were found and are severe, state that the request cannot be fully completed due to ethical concerns, and explain why based on 'issuesFound'. If suggestions were made, incorporate them if possible or note them.
2.  **Workflow Explanation**: Briefly explain the high-level workflow Neuro Synapse undertook. Mention initial planning, key agents involved (e.g., ImageAnalyzer, TextGenerator, WebBrowser, DebateModerator), the ethical review, and final synthesis.
Ensure your entire response is a single JSON object matching the FinalSynthesizerOutputSchema.
`,
  });

  let finalAnswer: string;
  let finalExplanation: string;
  try {
    const { output } = await finalSynthesizerPrompt({
      originalPrompt: currentPrompt,
      decomposedTasks: decomposedTasksList,
      ethicalCompliance: ethicalComplianceResult,
      userContext: input.userContext,
      planSummary: decompositionResult.planSummary,
      debateSummary: debateModeratorOutput ?? undefined,
    });
    if (!output) throw new Error("Final Synthesizer LLM failed to return output.");
    finalAnswer = output.synthesizedAnswer;
    finalExplanation = output.workflowExplanation;
    agentActivityLog.push("Final synthesis complete.");
  } catch (e: any) {
    agentActivityLog.push(`Error during final synthesis: ${e.message}`);
    finalAnswer = `Error: Neuro Synapse encountered an issue during final synthesis: ${e.message}. Partial results might be available in the task list.`;
    finalExplanation = "The final synthesis step failed. The workflow involved prompt analysis, sub-task execution by various agents, and an ethical review.";
  }
  workflowNodes.push({ id: 'final_output_node', label: 'Final Output', type: 'output' });
  workflowEdges.push({ id: `e${edgeCounter++}`, source: 'result_synthesizer', target: 'final_output_node', label: 'Synthesized Result', animated: true });

  // Construct the final output
  return {
    originalPrompt: currentPrompt,
    hasImageContext: !!input.imageDataUri,
    decomposedTasks: decomposedTasksList,
    synthesizedAnswer: finalAnswer,
    workflowExplanation: finalExplanation,
    workflowDiagramData: { nodes: workflowNodes, edges: workflowEdges },
    toolUsages: toolUsagesList,
    ethicalCompliance: ethicalComplianceResult,
    agentActivityLog,
  };
}
