
'use server';
/**
 * @fileOverview AI flow for interpreting user intent via NeuroShastra.
 * It takes a natural language query (which can be a placeholder like "Infer my intent") 
 * and rich user context (simulating telemetry) to infer a core goal and generate 
 * a "soft prompt" for another AI system like Neuro Synapse.
 *
 * - interpretUserIntent - A function that orchestrates the user intent interpretation.
 * - InterpretUserIntentInput - The input type for the interpretUserIntent function.
 * - InterpretUserIntentOutput - The return type for the interpretUserIntent function.
 * - UserContext - Schema for simulated user telemetry data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UserContextSchema = z.object({
  recentSearches: z.array(z.string()).optional().describe('Simulated: List of recent search queries made by the user across various platforms.'),
  visitedPages: z.array(z.string()).optional().describe('Simulated: List of recently visited page paths/URLs within NeuroVichar and potentially external sites.'),
  currentFocus: z.string().optional().describe('Simulated: The current application, document, or feature the user seems to be primarily engaged with.'),
  preferredTone: z.enum(['formal', 'casual', 'technical']).optional().describe('Simulated: User preferred communication tone, learned over time.'),
  activeApplications: z.array(z.string()).optional().describe('Simulated: List of other applications currently active on the user\'s device.'),
  calendarEvents: z.array(z.string()).optional().describe('Simulated: Snippets of upcoming calendar events for today (e.g., "Meeting: Project Alpha Deadline", "Reminder: Write blog post").'),
  timeOfDay: z.string().optional().describe('Simulated: Current time of day (e.g., "morning", "afternoon", "evening", "late night").'),
  deviceStatus: z.object({
    batteryLevel: z.number().optional().describe("Simulated: Device battery percentage."),
    isCharging: z.boolean().optional().describe("Simulated: Whether the device is currently charging."),
    networkType: z.enum(["WiFi", "Cellular", "Ethernet", "Offline"]).optional().describe("Simulated: Current network connection type.")
  }).optional().describe("Simulated: Current status of the user's device."),
  interactionFootprints: z.object({
    typingRhythm: z.enum(["fast", "moderate", "slow", "erratic"]).optional().describe("Simulated: User's recent typing pace/rhythm."),
    copyPasteActivity: z.boolean().optional().describe("Simulated: Whether recent copy/paste actions were detected."),
    appSwitchFrequency: z.enum(["high", "medium", "low"]).optional().describe("Simulated: How frequently the user is switching between apps.")
  }).optional().describe("Simulated: Micro-interaction patterns."),
});
export type UserContext = z.infer<typeof UserContextSchema>;

const InterpretUserIntentInputSchema = z.object({
  userQuery: z.string().describe('The natural language query or a placeholder statement like "Infer my intent" from the user. The AI should primarily rely on userContext if this is a generic placeholder.'),
  userContext: UserContextSchema.optional().describe('Crucial context simulating user behavioral telemetry and environmental data. This is the primary driver for intent inference in a zero-input scenario.'),
});
export type InterpretUserIntentInput = z.infer<typeof InterpretUserIntentInputSchema>;

const InterpretUserIntentOutputSchema = z.object({
  originalQuery: z.string().describe('The original query received from the user.'),
  inferredIntent: z.string().describe("The AI's understanding of the user's most probable core goal or need, derived primarily from the userContext."),
  softPromptForSynapse: z.string().optional().describe("A well-structured, actionable prompt, generated from the inferred intent, suitable for direct input into an advanced AI system like Neuro Synapse. This should be specific enough for Neuro Synapse to deconstruct."),
  suggestedActionType: z.enum(['EXECUTE_NEUROSYNAPSE', 'SUGGEST_IMAGE_GENERATION', 'SUMMARIZE_DOCUMENT_FOCUS', 'NAVIGATE', 'CLARIFY', 'INFORM', 'NONE'])
    .describe('The type of action the AI suggests based on the interpretation. EXECUTE_NEUROSYNAPSE is common if a complex task is inferred.'),
  suggestedActionDetail: z.string().optional().describe('Details for the action, e.g., parameters for a specific flow, a URL for NAVIGATE, or a clarifying question.'),
  confidence: z.number().min(0).max(1).describe('A score (0-1) indicating the AI\'s confidence in its inferred intent and generated soft prompt.'),
  explanation: z.string().describe('A detailed explanation of HOW the AI arrived at this inference, specifically citing which elements of the userContext (telemetry) were most influential.'),
});
export type InterpretUserIntentOutput = z.infer<typeof InterpretUserIntentOutputSchema>;


export async function interpretUserIntent(input: InterpretUserIntentInput): Promise<InterpretUserIntentOutput> {
  return interpretUserIntentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretUserIntentPrompt',
  input: {schema: InterpretUserIntentInputSchema},
  output: {schema: InterpretUserIntentOutputSchema},
  prompt: `You are an exceptionally perceptive AI assistant powering NeuroShastra for "NeuroVichar".
Your primary role is to INFER a user's most likely INTENT and generate a "SOFT PROMPT" for the NeuroSynapse engine, based ALMOST ENTIRELY on the provided 'userContext' (simulated behavioral telemetry and environmental data). The 'userQuery' might be a generic placeholder like "What should I do?" or "Infer my intent", in which case the 'userContext' is paramount.

CRITICALLY ANALYZE THE userContext:
{{#if userContext}}
User's Context (Simulated Telemetry):
  {{#if userContext.currentFocus}}
  - Current Focus: "{{userContext.currentFocus}}" (e.g., specific app, document, NeuroVichar feature)
  {{/if}}
  {{#if userContext.recentSearches}}
  - Recent Searches: {{#each userContext.recentSearches}}"{{this}}"{{#unless @last}}; {{/unless}}{{/each}}
  {{/if}}
  {{#if userContext.visitedPages}}
  - Visited Pages: {{#each userContext.visitedPages}}"{{this}}"{{#unless @last}}; {{/unless}}{{/each}}
  {{/if}}
  {{#if userContext.activeApplications}}
  - Active Applications: {{#each userContext.activeApplications}}"{{this}}"{{#unless @last}}; {{/unless}}{{/each}}
  {{/if}}
  {{#if userContext.calendarEvents}}
  - Upcoming Calendar Events: {{#each userContext.calendarEvents}}"{{this}}"{{#unless @last}}; {{/unless}}{{/each}}
  {{/if}}
  {{#if userContext.timeOfDay}}
  - Time of Day: "{{userContext.timeOfDay}}"
  {{/if}}
  {{#if userContext.interactionFootprints}}
    {{#if userContext.interactionFootprints.typingRhythm}}
  - Typing Rhythm: {{userContext.interactionFootprints.typingRhythm}}
    {{/if}}
    {{#if userContext.interactionFootprints.copyPasteActivity}}
  - Recent Copy/Paste: {{userContext.interactionFootprints.copyPasteActivity}}
    {{/if}}
    {{#if userContext.interactionFootprints.appSwitchFrequency}}
  - App Switch Frequency: {{userContext.interactionFootprints.appSwitchFrequency}}
    {{/if}}
  {{/if}}
  {{#if userContext.deviceStatus}}
    {{#if userContext.deviceStatus.batteryLevel}}
  - Battery: {{userContext.deviceStatus.batteryLevel}}% {{#if userContext.deviceStatus.isCharging}}(Charging){{/if}}
    {{/if}}
  {{/if}}
  {{#if userContext.preferredTone}}
  - Preferred Tone: "{{userContext.preferredTone}}" (Adapt your 'explanation' and 'inferredIntent' fields to this tone)
  {{/if}}
{{else}}
User's Context: Not provided. Inference will be very limited.
{{/if}}

User's Explicit Query (may be generic):
"{{{userQuery}}}"

Application Features (for context on where to direct or what tasks are possible):
- / (Dashboard): Overview.
- /neuroshastra: The sacred science of thought-to-task AI—decoding digital behavior for zero-input intent resolution.
- /neuro-synapse: Complex problem decomposition and synthesis. This is a primary target for complex inferred intents.
- /ai-image-generation: Generates images.
- /idea-catalyst: Helps brainstorm complex prompts.
- /web-browsing: Summarizes web pages.

Your Tasks:
1.  **Inferred Intent**: Based ON THE DETAILED ANALYSIS OF 'userContext', what is the user's most probable underlying goal, need, or task they are implicitly aiming to achieve? Be specific. If 'preferredTone' is available, adapt your language.
2.  **Soft Prompt for NeuroSynapse**: Formulate a clear, actionable, and specific "soft prompt" derived from the 'inferredIntent'. This prompt should be directly usable by NeuroSynapse to kickstart its orchestration process. If the intent seems simple (e.g. generate a specific image), this prompt might target a simpler flow.
3.  **Suggested Action Type**: Choose one: 'EXECUTE_NEUROSYNAPSE' (if the soft prompt is complex and requires orchestration), 'SUGGEST_IMAGE_GENERATION', 'SUMMARIZE_DOCUMENT_FOCUS', 'NAVIGATE', 'CLARIFY', 'INFORM', 'NONE'.
4.  **Suggested Action Detail**:
    *   For EXECUTE_NEUROSYNAPSE: Briefly state the core task for Synapse (e.g., "Analyze market trends for X based on recent news and user's focus on Y"). The 'softPromptForSynapse' field will contain the full prompt.
    *   For other types: Image prompt, document to summarize, navigation path, clarifying question, or direct information.
5.  **Confidence**: Score (0.0-1.0) your confidence in the 'inferredIntent' AND the suitability of the 'softPromptForSynapse'. Higher if telemetry provides strong, converging signals.
6.  **Explanation**: CRITICALLY, explain your reasoning. Detail *which specific elements* from 'userContext' (e.g., "recent search for 'X' combined with 'currentFocus' on 'Y' and 'calendarEvent' for 'Z'") led you to the 'inferredIntent' and the formulation of the 'softPromptForSynapse'. This is the most important part for user transparency. Adapt tone if 'preferredTone' is available.

Example Output (Persona: Developer, Query: "Okay, what now?"):
{
  "originalQuery": "Okay, what now?",
  "inferredIntent": "The user, a developer focused on 'Coding & API Integration' and recently viewing NeuroVichar's API docs and GitHub, likely wants to start or continue working on a NeuroVichar plugin. They might need to brainstorm requirements for this new plugin.",
  "softPromptForSynapse": "Analyze the requirements for a new NeuroVichar plugin that integrates with external project management tools. Consider its core features, potential challenges, and necessary API endpoints. Suggest key technologies for implementation. The target audience is developers seeking to streamline their workflow between NeuroVichar and tools like Jira or Asana.",
  "suggestedActionType": "EXECUTE_NEUROSYNAPSE",
  "suggestedActionDetail": "Initiate NeuroSynapse to outline requirements for a new project management plugin.",
  "confidence": 0.75,
  "explanation": "User's 'currentFocus' on 'Coding & API Integration', 'visitedPages' including API docs and GitHub, and 'recentSearches' for 'Genkit AI tutorial' strongly suggest an active development context. The 'userQuery' 'Okay, what now?' implies a desire for a next step. Therefore, inferring an intent to conceptualize a new plugin for NeuroVichar is probable. The soft prompt aims to leverage NeuroSynapse for this planning task. The tone is technical as per preference."
}

If 'userContext' is sparse or contradictory, confidence should be lower, and 'suggestedActionType' might be 'CLARIFY'.
If 'userQuery' is specific and overrides context, acknowledge it but still explain how context was considered.
The 'softPromptForSynapse' should be a complete, standalone prompt.

Ensure your entire response is a single JSON object matching the InterpretUserIntentOutputSchema.
Begin!
`,
});

const interpretUserIntentFlow = ai.defineFlow(
  {
    name: 'interpretUserIntentFlow',
    inputSchema: InterpretUserIntentInputSchema,
    outputSchema: InterpretUserIntentOutputSchema,
  },
  async (input: InterpretUserIntentInput) => {
    const llmResponse = await prompt(input);

    if (!llmResponse.output) {
      throw new Error('NeuroShastra failed to generate an interpretation.');
    }
    
    const output = llmResponse.output;

    return {
      originalQuery: input.userQuery,
      inferredIntent: output.inferredIntent,
      softPromptForSynapse: output.softPromptForSynapse, 
      suggestedActionType: output.suggestedActionType,
      suggestedActionDetail: output.suggestedActionDetail,
      confidence: output.confidence,
      explanation: output.explanation,
    };
  }
);

