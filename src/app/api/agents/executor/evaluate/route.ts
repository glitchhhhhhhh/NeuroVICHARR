import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const EvaluateInputSchema = z.object({
  contentToEvaluate: z.any().describe("The content or data to be evaluated."),
  evaluationCriteria: z.array(z.string()).optional().describe("Specific criteria for evaluation."),
});

const EvaluateOutputSchema = z.object({
  evaluationScore: z.number().min(0).max(1),
  feedback: z.string(),
  passed: z.boolean(),
});

export async function POST(request: NextRequest) {
  console.log("[Agent: Evaluator] Received request");
  try {
    const body = await request.json();
    const parsedInput = EvaluateInputSchema.parse(body);
    console.log("[Agent: Evaluator] Input:", parsedInput);

    // Mock evaluation logic
    const score = Math.random() * 0.5 + 0.5; // Score between 0.5 and 1.0
    const feedback = `Mock evaluation feedback for content. Criteria considered: ${parsedInput.evaluationCriteria?.join(', ') || 'general quality'}. This content seems ${score > 0.75 ? 'good' : 'okay'}.`;
    
    const output = {
      evaluationScore: parseFloat(score.toFixed(2)),
      feedback,
      passed: score > 0.6,
    };
    console.log("[Agent: Evaluator] Output:", output);
    return NextResponse.json(output);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("[Agent: Evaluator] Zod Error:", error.errors);
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("[Agent: Evaluator] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate content" }, { status: 500 });
  }
}