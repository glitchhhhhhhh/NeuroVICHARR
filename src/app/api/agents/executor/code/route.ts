import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CodeExecutorInputSchema = z.object({
  description: z.string().min(1, "Description cannot be empty."),
  language: z.string().optional().default("python"),
});

const CodeExecutorOutputSchema = z.object({
  generatedCode: z.string(),
  languageUsed: z.string(),
  executionNotes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  console.log("[Agent: CodeExecutor] Received request");
  try {
    const body = await request.json();
    const parsedInput = CodeExecutorInputSchema.parse(body);
    console.log("[Agent: CodeExecutor] Input:", parsedInput);
    
    // Mock code generation
    const generatedCode = `
# Mock ${parsedInput.languageUsed} code for: ${parsedInput.description}
def mock_function():
  print("Hello from mock ${parsedInput.languageUsed} code!")

mock_function()
    `;
    const output = {
      generatedCode,
      languageUsed: parsedInput.language,
      executionNotes: "This is mock generated code. Replace with actual AI code generation logic.",
    };
    console.log("[Agent: CodeExecutor] Output:", output);
    return NextResponse.json(output);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("[Agent: CodeExecutor] Zod Error:", error.errors);
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("[Agent: CodeExecutor] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate code" }, { status: 500 });
  }
}