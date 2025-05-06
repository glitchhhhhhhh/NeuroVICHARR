'use server';
/**
 * @fileOverview AI Image Generation Flow
 *
 * - generateImage - A function that generates an image based on a user prompt.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('A textual description of the image to be generated.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI. Format: 'data:image/png;base64,<encoded_data>'."),
  promptUsed: z.string().describe('The prompt that was used to generate the image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input: GenerateImageInput) => {
    try {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Specific model for image generation
        prompt: input.prompt,
        config: {
          responseModalities: ['IMAGE', 'TEXT'], // MUST provide both TEXT and IMAGE
        },
      });

      if (!media?.url) {
        throw new Error('Image generation failed: No media URL returned.');
      }
      
      // The model might also return text output, which we are ignoring for now
      // const textResponse = response.text; 

      return {
        imageDataUri: media.url, // This will be a data URI like "data:image/png;base64,..."
        promptUsed: input.prompt,
      };
    } catch (error: any) {
      console.error('Error in generateImageFlow:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }
);