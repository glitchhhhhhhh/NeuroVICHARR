
'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Loader2, Share2, Zap, Search, CornerDownRight, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { decomposePrompt, type DecomposePromptInput, type DecomposePromptOutput } from '@/ai/flows/neuro-synapse-flow';
import Image from 'next/image';

export default function NeuroSynapsePage() {
  const [complexPrompt, setComplexPrompt] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decompositionResult, setDecompositionResult] = useState<DecomposePromptOutput | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setDecompositionResult(null);

    try {
      if (!complexPrompt.trim()) {
        setError('Please enter a complex prompt.');
        setIsLoading(false);
        return;
      }
      
      const input: DecomposePromptInput = { complexPrompt };
      if (context.trim()) {
        input.context = context;
      }

      const result = await decomposePrompt(input);
      setDecompositionResult(result);
    } catch (e: any) {
      console.error("Neuro Synapse Error:", e);
      setError(e.message || 'Failed to decompose the prompt. The AI model might have returned an unexpected format. Please try a different prompt or simplify your request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center space-x-4">
        <Brain className="w-12 h-12 text-accent" />
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Neuro Synapse</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Intelligently divides user prompts into subtasks and delegates them across multiple AI agents.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Decompose Complex Prompt</CardTitle>
          <CardDescription>
            Enter a complex prompt below. Neuro Synapse will attempt to break it down into smaller, manageable subtasks that could be handled by specialized AI agents.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="complex-prompt-input">Complex Prompt</Label>
              <Textarea
                id="complex-prompt-input"
                placeholder="e.g., Research the impact of AI on climate change, summarize key findings, and draft a short blog post."
                value={complexPrompt}
                onChange={(e) => setComplexPrompt(e.target.value)}
                disabled={isLoading}
                required
                rows={4}
                aria-label="Complex Prompt"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="context-input">Optional Context</Label>
              <Textarea
                id="context-input"
                placeholder="e.g., Focus on renewable energy solutions. The blog post should be for a general audience."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                disabled={isLoading}
                rows={2}
                aria-label="Optional Context"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Decompose Prompt
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </form>
        
        {decompositionResult && (
          <CardFooter className="flex flex-col items-start space-y-6 border-t pt-6 mt-6">
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-1">Decomposition Strategy</h3>
              <p className="text-sm text-muted-foreground">{decompositionResult.summary}</p>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Subtasks</h3>
              {decompositionResult.subtasks.length > 0 ? (
                <div className="space-y-4">
                  {decompositionResult.subtasks.map((subtask, index) => (
                    <Card key={subtask.taskId || index} className="bg-secondary/30 dark:bg-secondary/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                           <span className="text-accent mr-2 font-bold">#{subtask.taskId}</span>
                           {subtask.description}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        {subtask.assignedAgent && (
                          <div className="flex items-center text-muted-foreground">
                            <Brain className="w-4 h-4 mr-2 text-accent/80" />
                            <strong>Assigned Agent Type:</strong> <span className="ml-1">{subtask.assignedAgent}</span>
                          </div>
                        )}
                        {subtask.dependencies && subtask.dependencies.length > 0 && (
                          <div className="flex items-start text-muted-foreground">
                            <Share2 className="w-4 h-4 mr-2 mt-0.5 text-accent/80" />
                            <div>
                                <strong>Dependencies:</strong>
                                <ul className="list-disc list-inside ml-4">
                                {subtask.dependencies.map(dep => <li key={dep}>{dep}</li>)}
                                </ul>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No subtasks were generated for this prompt.</p>
              )}
            </div>
             <div className="w-full pt-4">
                <h3 className="text-xl font-semibold text-foreground mb-2">Original Prompt</h3>
                <Card className="bg-muted/50 p-4">
                    <CardContent className="text-sm">
                        <p>{decompositionResult.originalPrompt}</p>
                    </CardContent>
                </Card>
            </div>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Neuro Synapse Workflow</CardTitle>
          <CardDescription>
            Conceptual diagram illustrating how Neuro Synapse decomposes, delegates, and synthesizes results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center items-center p-4 border rounded-lg bg-card overflow-x-auto">
            {/* Placeholder for a more sophisticated diagram. Using a simple image for now. */}
            <Image
              src="https://picsum.photos/800/450?random=10"
              alt="Neuro Synapse Workflow Diagram"
              width={800}
              height={450}
              className="rounded-md shadow-md"
              data-ai-hint="workflow diagram"
            />
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start">
              <Search className="w-5 h-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
              <p><strong>1. Prompt Ingestion & Decomposition:</strong> The user submits a complex prompt. Neuro Synapse analyzes it and breaks it down into smaller, logical subtasks.</p>
            </div>
            <div className="flex items-start">
              <Brain className="w-5 h-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
              <p><strong>2. Agent Assignment (Conceptual):</strong> Each subtask is (conceptually) assigned to a specialized AI agent (e.g., data analyst, writer, web researcher) based on its nature.</p>
            </div>
            <div className="flex items-start">
              <Zap className="w-5 h-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
              <p><strong>3. Parallel & Sequential Execution:</strong> Agents process their assigned subtasks. Some tasks may run in parallel, while others might depend on the output of preceding tasks.</p>
            </div>
            <div className="flex items-start">
             <CornerDownRight className="w-5 h-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
              <p><strong>4. Result Aggregation & Synthesis:</strong> Neuro Synapse gathers the outputs from all agents and intelligently merges them into a single, coherent, and comprehensive response.</p>
            </div>
             <div className="flex items-start">
              <Share2 className="w-5 h-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
              <p><strong>5. Unified Output:</strong> The final synthesized result is presented to the user.</p>
            </div>
          </div>
           <p className="text-xs text-muted-foreground pt-2">
            Note: The current implementation focuses on step 1 (Prompt Decomposition). Full agent delegation and result synthesis are conceptual future enhancements.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
