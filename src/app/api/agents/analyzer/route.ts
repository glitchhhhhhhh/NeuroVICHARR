import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const AnalyzerInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty."),
  imageDataUri: z.string().optional().describe("Optional image data for context."),
});

export const AnalyzerOutputSchema = z.object({
  analysisSummary: z.string(),
  extractedKeywords: z.array(z.string()),
  isImageAnalysisRequired: z.boolean(),
  clarifyingQuestions: z.array(z.string()).optional(),
});
export type AnalyzerOutput = z.infer<typeof AnalyzerOutputSchema>;


export async function POST(request: NextRequest) {
  console.log("[Agent: Analyzer] Received request");
  try {
    const body = await request.json();
    const parsedInput = AnalyzerInputSchema.parse(body);
    console.log("[Agent: Analyzer] Input:", parsedInput.prompt);

    // Mock analysis logic
    let analysisSummary = `Initial analysis of prompt: "${parsedInput.prompt}". `;
    const keywords = parsedInput.prompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    let isImageAnalysisRequired = !!parsedInput.imageDataUri;

    if (parsedInput.imageDataUri) {
      analysisSummary += "Image context was provided and will be considered. ";
    } else if (parsedInput.prompt.toLowerCase().match(/image|picture|photo|visual/)) {
        analysisSummary += "Prompt suggests visual content might be relevant. ";
    }
    
    analysisSummary += `Identified keywords: ${keywords.join(', ') || 'none'}.`;

    const output: AnalyzerOutput = {
      analysisSummary,
      extractedKeywords: keywords.slice(0, 5), // Limit keywords
      isImageAnalysisRequired,
      clarifyingQuestions: parsedInput.prompt.length < 10 ? ["Could you please provide more details?"] : [],
    };
    console.log("[Agent: Analyzer] Output:", output);
    return NextResponse.json(output);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("[Agent: Analyzer] Zod Error:", error.errors);
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("[Agent: Analyzer] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze prompt" }, { status: 500 });
  }
}