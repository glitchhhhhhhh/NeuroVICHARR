'use server';
/**
 * @fileOverview Summarizes the content of a web page given its URL.
 *
 * - summarizeWebPage - A function that summarizes the content of a web page.
 * - SummarizeWebPageInput - The input type for the summarizeWebPage function.
 * - SummarizeWebPageOutput - The return type for the summarizeWebPage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {browseWebPage} from '@/services/web-browser';

const SummarizeWebPageInputSchema = z.object({
  url: z.string().describe('The URL of the web page to summarize.'),
});
export type SummarizeWebPageInput = z.infer<typeof SummarizeWebPageInputSchema>;

const SummarizeWebPageOutputSchema = z.object({
  summary: z.string().describe('A summary of the content of the web page.'),
  title: z.string().describe('The title of the web page.'),
});
export type SummarizeWebPageOutput = z.infer<typeof SummarizeWebPageOutputSchema>;

export async function summarizeWebPage(input: SummarizeWebPageInput): Promise<SummarizeWebPageOutput> {
  return summarizeWebPageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeWebPagePrompt',
  input: {schema: SummarizeWebPageInputSchema},
  output: {schema: SummarizeWebPageOutputSchema},
  prompt: `You are an expert summarizer.  You will be given the content of a web page and you will summarize it in a concise way.

Title: {{{webPageTitle}}}
Content: {{{webPageContent}}}

Summary: `,
});

const summarizeWebPageFlow = ai.defineFlow(
  {
    name: 'summarizeWebPageFlow',
    inputSchema: SummarizeWebPageInputSchema,
    outputSchema: SummarizeWebPageOutputSchema,
  },
  async input => {
    const webPage = await browseWebPage(input.url);
    const {output} = await prompt({
      webPageContent: webPage.content,
      webPageTitle: webPage.title,
      url: input.url,
    });
    return {
      summary: output!.summary,
      title: webPage.title,
    };
  }
);
