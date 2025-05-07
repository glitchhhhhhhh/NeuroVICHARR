import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const EthicalCheckerInputSchema = z.object({
  contentToCheck: z.any().describe("The content (text, image data, plan) to be checked for ethical compliance."),
  // context: z.string().optional().describe("Context for the ethical check"),
});

const EthicalCheckerOutputSchema = z.object({
  isCompliant: z.boolean(),
  issuesFound: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1).optional(),
  remediationSuggestions: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  console.log("[Agent: EthicalChecker] Received request");
  try {
    const body = await request.json();
    const parsedInput = EthicalCheckerInputSchema.parse(body);
    console.log("[Agent: EthicalChecker] Input:", parsedInput);
    
    // Mock ethical check logic
    const issuesFound: string[] = [];
    let isCompliant = true;
    // Example: simple check for sensitive keywords in text content
    if (typeof parsedInput.contentToCheck === 'string') {
      const sensitiveKeywords = ["harmful", "illegal", "hate"];
      sensitiveKeywords.forEach(keyword => {
        if (parsedInput.contentToCheck.toLowerCase().includes(keyword)) {
          issuesFound.push(`Content includes potentially sensitive keyword: ${keyword}`);
          isCompliant = false;
        }
      });
    }

    const output = {
      isCompliant,
      issuesFound,
      confidenceScore: isCompliant ? 0.95 : 0.6,
      remediationSuggestions: isCompliant ? [] : ["Review content for sensitive material."],
    };
    console.log("[Agent: EthicalChecker] Output:", output);
    return NextResponse.json(output);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("[Agent: EthicalChecker] Zod Error:", error.errors);
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("[Agent: EthicalChecker] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to perform ethical check" }, { status: 500 });
  }
}