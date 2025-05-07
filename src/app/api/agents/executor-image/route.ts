// src/app/api/agents/executor-image/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateImage as genkitGenerateImage } from '@/ai/flows/generate-image-flow'; 
import type { UserContext } from '@/ai/flows/interpret-user-intent-flow';

interface ImageExecutorInput {
  promptFragment: string; 
  originalPrompt: string;
  userContext?: UserContext; // Added userContext
  hasImageContext?: boolean; // Added for context
}

async function generateImage(input: ImageExecutorInput): Promise<any> {
  console.log(`[ExecutorImage] Generating image for: "${input.promptFragment}"`);
  if(input.userContext) {
    console.log(`[ExecutorImage] User context (focus: ${input.userContext.currentFocus || 'N/A'}) received.`);
  }
  
  const useMock = !process.env.GENAI_API_KEY || process.env.USE_MOCK_ORKES_CLIENT === 'true';

  if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500)); 
      const mockImageUrl = `https://picsum.photos/seed/${encodeURIComponent(input.promptFragment.slice(0,20))}/512/512`;
      return {
        imageUrl: mockImageUrl, // Mock executor might return URL
        altText: `Mock image for: ${input.promptFragment}`,
        status: "COMPLETED_MOCK",
        promptFragment: input.promptFragment,
      };
  }

  try {
    // The genkitGenerateImage flow currently doesn't take userContext.
    // If it were to be enhanced, it could be passed here.
    const genkitResult = await genkitGenerateImage({ prompt: input.promptFragment });
    return {
      imageDataUri: genkitResult.imageDataUri, 
      altText: `AI generated image for: ${genkitResult.promptUsed}`,
      status: "COMPLETED_REAL",
      promptFragment: input.promptFragment,
    };
  } catch (error: any) {
    console.error(`[ExecutorImage] Genkit image generation failed: ${error.message}`);
    return {
      error: `Failed to generate image: ${error.message}`,
      status: "FAILED",
      promptFragment: input.promptFragment,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: ImageExecutorInput = body.input || body;

    if (!input || !input.promptFragment) {
      return NextResponse.json({ error: "Missing or invalid input for image executor" }, { status: 400 });
    }

    console.log("[ExecutorImage] Received input:", JSON.stringify(input).substring(0,300)+"...");
    
    const result = await generateImage(input);
    
    console.log("[ExecutorImage] Image generation result status:", result.status);
    return NextResponse.json({ ...result });

  } catch (error: any)
{
    console.error("[ExecutorImage] Error:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}
