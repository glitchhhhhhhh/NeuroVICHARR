// src/app/api/agents/executor-web-search/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { browseWebPage } from '@/services/web-browser'; 
import type { UserContext } from '@/ai/flows/interpret-user-intent-flow';

interface WebSearchExecutorInput {
  promptFragment: string; 
  originalPrompt: string;
  userContext?: UserContext; // Added userContext
  hasImageContext?: boolean; // Added for context
}

async function performWebSearch(input: WebSearchExecutorInput): Promise<any> {
  console.log(`[ExecutorWebSearch] Performing search for: "${input.promptFragment}"`);
  if (input.userContext) {
    console.log(`[ExecutorWebSearch] User context (current focus: ${input.userContext.currentFocus || 'N/A'}) received.`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  let searchResults;
  let looksLikeUrl = false;
  try {
    new URL(input.promptFragment);
    looksLikeUrl = true;
  } catch (_) { /* not a valid URL string */ }

  if (looksLikeUrl) {
      try {
        const browseResult = await browseWebPage(input.promptFragment);
        searchResults = [
            { title: browseResult.title, snippet: browseResult.content.substring(0, 200) + "...", url: browseResult.url }
        ];
      } catch (browseError: any) {
        console.error(`[ExecutorWebSearch] Error browsing URL ${input.promptFragment}: ${browseError.message}`);
        searchResults = [{title: "Error Browsing URL", snippet: `Failed to retrieve content from ${input.promptFragment}. The server may be down or the URL invalid.`, url: input.promptFragment}];
      }
  } else {
    // Generic search results, potentially varied by userContext
    let result1Title = `Search Result 1 for "${input.promptFragment}"`;
    let result1Snippet = "This is the first mock search result snippet containing relevant information about your query.";
    if (input.userContext?.currentFocus?.toLowerCase().includes("technical") || input.userContext?.preferredTone === 'technical') {
        result1Title = `Technical Deep Dive on "${input.promptFragment}"`;
        result1Snippet = `A detailed technical paper exploring aspects of ${input.promptFragment}, including methodologies and experimental results.`;
    } else if (input.userContext?.currentFocus?.toLowerCase().includes("news")) {
        result1Title = `Latest News Regarding "${input.promptFragment}"`;
        result1Snippet = `Breaking updates and current events related to ${input.promptFragment}, sourced from top news outlets.`;
    }

    searchResults = [
      { title: result1Title, snippet: result1Snippet, url: "https://example.com/result1" },
      { title: `Another Perspective on "${input.promptFragment}"`, snippet: "An alternative viewpoint or analysis found on the web concerning your topic.", url: "https://example.com/result2" },
      { title: `Community Discussion (Forum) for "${input.promptFragment}"`, snippet: "A forum thread where users discuss various aspects of the query, sharing opinions and experiences.", url: "https://forum.example.com/thread" },
    ];
  }
  
  return {
    searchResults: searchResults,
    summary: `Found ${searchResults.length} mock results for "${input.promptFragment}". ${searchResults[0]?.title ? `Top result: ${searchResults[0].title}`:''}`,
    status: "COMPLETED_MOCK", // Using MOCK status
    promptFragment: input.promptFragment, // Echo back for synthesizer
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: WebSearchExecutorInput = body.input || body;

    if (!input || !input.promptFragment) {
      return NextResponse.json({ error: "Missing or invalid input for web search executor" }, { status: 400 });
    }

    console.log("[ExecutorWebSearch] Received input:", JSON.stringify(input).substring(0,300)+"...");
    
    const result = await performWebSearch(input);
    
    console.log("[ExecutorWebSearch] Search result status:", result.status);
    return NextResponse.json({ ...result });

  } catch (error: any) {
    console.error("[ExecutorWebSearch] Error:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}
