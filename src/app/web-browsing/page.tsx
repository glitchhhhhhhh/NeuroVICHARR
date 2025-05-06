'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Search, Loader2, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { summarizeWebPage, type SummarizeWebPageOutput } from '@/ai/flows/summarize-web-page';
import Image from 'next/image';


export default function WebBrowsingPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummarizeWebPageOutput | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSummaryResult(null);

    try {
      if (!url) {
        setError('Please enter a valid URL.');
        setIsLoading(false);
        return;
      }
      // Basic URL validation (can be improved)
      new URL(url); // Will throw error if invalid

      const result = await summarizeWebPage({ url });
      setSummaryResult(result);
    } catch (e: any) {
      setError(e.message || 'Failed to summarize the web page. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center space-x-4">
        <Globe className="w-12 h-12 text-accent" />
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Live Web Browsing Agents</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Sandboxed agents for real-time data and market tracking. Summarize web pages on demand.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Summarize Web Page</CardTitle>
          <CardDescription>
            Enter a URL below, and our AI agent will browse the page and provide a summary.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex justify-center mb-6">
              <Image 
                src="https://picsum.photos/800/300?random=6" 
                alt="Web Browsing illustration" 
                width={800} 
                height={300} 
                className="rounded-lg shadow-md object-cover"
                data-ai-hint="web search"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url-input">Web Page URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                  required
                  aria-label="Web Page URL"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Summarize
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </form>
        
        {summaryResult && (
          <CardFooter className="flex flex-col items-start space-y-4 border-t pt-6 mt-6">
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-foreground flex items-center">
                <FileText className="w-6 h-6 mr-2 text-accent"/>
                Summary of: <span className="text-accent ml-1">{summaryResult.title || url}</span>
              </h3>
              <Card className="mt-4 bg-secondary/50 p-4">
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p>{summaryResult.summary}</p>
                </CardContent>
              </Card>
            </div>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Web Browsing Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            NeuroVichar's Live Web Browsing Agents operate in a secure, sandboxed environment. 
            They can be tasked to fetch and analyze real-time data from the web, track market trends, 
            or gather information for your prompts. This capability significantly enhances the 
            depth and timeliness of insights generated by the platform.
          </p>
          <h4 className="font-semibold mt-4 mb-2">Use Cases:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Real-time market analysis and news aggregation.</li>
            <li>Competitor research and monitoring.</li>
            <li>Fact-checking and information retrieval for AI prompts.</li>
            <li>Tracking specific data points from various web sources.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
