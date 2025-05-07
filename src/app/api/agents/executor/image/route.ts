import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateImage, type GenerateImageInput } from '@/ai/flows/generate-image-flow';

const ImageExecutorInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty."),
});

export async function POST(request: NextRequest) {
  console.log("[Agent: ImageExecutor] Received request");
  try {
    const body = await request.json();
    const parsedInput = ImageExecutorInputSchema.parse(body);
    console.log("[Agent: ImageExecutor] Input:", parsedInput);

    const genImageInput: GenerateImageInput = { prompt: parsedInput.prompt };
    const result = await generateImage(genImageInput);
    
    console.log("[Agent: ImageExecutor] Output:", result);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("[Agent: ImageExecutor] Zod Error:", error.errors);
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("[Agent: ImageExecutor] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 });
  }
}