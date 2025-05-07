
// src/app/api/agents/executor-image/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateImage as genkitGenerateImage } from '@/ai/flows/generate-image-flow'; // Using existing genkit flow

interface ImageExecutorInput {
  promptFragment: string; // Specific part of the prompt for image generation
  originalPrompt: string;
  // Potentially other context like style, aspect ratio etc.
}

async function generateImage(input: ImageExecutorInput): Promise<any> {
  console.log(`[ExecutorImage] Generating image for: "${input.promptFragment}"`);
  
  // Using the existing Genkit flow for actual image generation if GENAI_API_KEY is set
  // Otherwise, mock it.
  const useMock = !process.env.GENAI_API_KEY || process.env.USE_MOCK_ORKES_CLIENT === 'true';

  if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500)); // Simulate longer delay
      const mockImageUrl = `https://picsum.photos/seed/${encodeURIComponent(input.promptFragment.slice(0,20))}/512/512`;
      return {
        imageUrl: mockImageUrl,
        altText: `Mock image for: ${input.promptFragment}`,
        status: "COMPLETED_MOCK",
      };
  }

  try {
    const genkitResult = await genkitGenerateImage({ prompt: input.promptFragment });
    return {
      imageDataUri: genkitResult.imageDataUri, // Genkit returns a data URI
      altText: `AI generated image for: ${genkitResult.promptUsed}`,
      status: "COMPLETED_REAL",
    };
  } catch (error: any) {
    console.error(`[ExecutorImage] Genkit image generation failed: ${error.message}`);
    return {
      error: `Failed to generate image: ${error.message}`,
      status: "FAILED",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: ImageExecutorInput = body.input;

    if (!input || !input.promptFragment) {
      return NextResponse.json({ error: "Missing or invalid input for image executor" }, { status: 400 });
    }

    console.log("[ExecutorImage] Received input:", JSON.stringify(input, null, 2));
    
    const result = await generateImage(input);
    
    console.log("[ExecutorImage] Image generation result:", result.status);
    return NextResponse.json({ ...result });

  } catch (error: any) {
    console.error("[ExecutorImage] Error:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}
