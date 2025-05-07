// src/app/api/agents/executor-code/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserContext } from '@/ai/flows/interpret-user-intent-flow';

interface CodeExecutorInput {
  promptFragment: string; 
  originalPrompt: string;
  userContext?: UserContext; // Added userContext
  hasImageContext?: boolean; // Added for context
}

// Simulate code generation
function generateCode(input: CodeExecutorInput): any {
  console.log(`[ExecutorCode] Generating code for: "${input.promptFragment}"`);
  if (input.userContext) {
      console.log(`[ExecutorCode] User context (current focus: ${input.userContext.currentFocus || 'N/A'}) received.`);
  }

  const languageSuggestion = input.promptFragment.toLowerCase().includes("python") ? "python" 
                            : input.promptFragment.toLowerCase().includes("javascript") || input.promptFragment.toLowerCase().includes("typescript") ? "javascript" 
                            : "plaintext";
  
  let mockCode = `
// Mock generated ${languageSuggestion} code for: ${input.promptFragment}
// Original Request: ${input.originalPrompt}
// User Focus (if provided): ${input.userContext?.currentFocus || 'N/A'}

function ${input.promptFragment.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase() || 'myGeneratedFunction'}() {
  console.log("NeuroVichar Code Executor: Task '${input.promptFragment}' completed.");
  // Add more complex logic based on the prompt
  return "Mock code execution successful for prompt fragment: ${input.promptFragment}";
}

${input.promptFragment.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase() || 'myGeneratedFunction'}();
  `;

  if (languageSuggestion === 'python') {
    mockCode = `
# Mock generated Python code for: ${input.promptFragment}
# Original Request: ${input.originalPrompt}
# User Focus (if provided): ${input.userContext?.currentFocus || 'N/A'}

def ${input.promptFragment.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase() or 'my_generated_function'}():
  print("NeuroVichar Code Executor: Task '${input.promptFragment}' completed.")
  # Add more complex logic based on the prompt
  return "Mock code execution successful for prompt fragment: ${input.promptFragment}"

if __name__ == "__main__":
  ${input.promptFragment.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase() or 'my_generated_function'}()
    `;
  }


  return {
    generatedCode: mockCode,
    language: languageSuggestion, 
    executionLog: "Mock code generated successfully. No runtime errors (simulated).",
    status: "COMPLETED_MOCK", // Using MOCK status for clarity
    promptFragment: input.promptFragment, // Echo back for synthesizer
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: CodeExecutorInput = body.input || body;

    if (!input || !input.promptFragment) {
      return NextResponse.json({ error: "Missing or invalid input for code executor" }, { status: 400 });
    }

    console.log("[ExecutorCode] Received input:", JSON.stringify(input).substring(0,300)+"...");
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const result = generateCode(input);
    
    console.log("[ExecutorCode] Code generation result status:", result.status);
    return NextResponse.json({ ...result });

  } catch (error: any) {
    console.error("[ExecutorCode] Error:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}
