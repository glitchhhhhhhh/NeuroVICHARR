'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Search, Loader2, FileText, Link2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { summarizeWebPage, type SummarizeWebPageOutput } from '@/ai/flows/summarize-web-page';
import { motion } from 'framer-motion';


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
    <div className="space-y-10">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center space-x-6"
      >
        <Globe className="w-14 h-14 text-accent drop-shadow-lg" />
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">Live Web Browsing Agents</h1>
          <p className="text-xl text-muted-foreground mt-2 max-w-2xl">
            Sandboxed agents for real-time data and market tracking. Summarize web pages on demand.
          </p>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      >
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Summarize Web Page</CardTitle>
            <CardDescription className="text-base">
              Enter a URL below, and our AI agent will browse the page and provide a summary.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg border border-primary/20 shadow-inner">
                <Link2 className="w-24 h-24 text-primary opacity-60 mb-4" />
                <p className="text-center text-muted-foreground">Our web agent is ready to explore the internet for you.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url-input" className="text-md font-medium">Web Page URL</Label>
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
                    className="text-lg p-3 h-12"
                  />
                  <Button type="submit" disabled={isLoading} size="lg" className="px-6 h-12">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="mr-2 h-5 w-5" />
                    )}
                    Summarize
                  </Button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Alert variant="destructive" className="shadow-md">
                    <AlertTitle className="font-semibold">Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </CardContent>
          </form>
          
          {summaryResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardFooter className="flex flex-col items-start space-y-4 border-t pt-6 mt-6">
                <div className="w-full">
                  <h3 className="text-2xl font-semibold text-foreground flex items-center">
                    <FileText className="w-7 h-7 mr-2.5 text-accent"/>
                    Summary of: <span className="text-accent ml-1.5 italic">{summaryResult.title || url}</span>
                  </h3>
                  <Card className="mt-4 bg-secondary/50 p-5 shadow-inner border border-border/50">
                    <CardContent className="prose prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
                      <p>{summaryResult.summary}</p>
                    </CardContent>
                  </Card>
                </div>
              </CardFooter>
            </motion.div>
          )}
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">About Web Browsing Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              NeuroVichar's Live Web Browsing Agents operate in a secure, sandboxed environment. 
              They can be tasked to fetch and analyze real-time data from the web, track market trends, 
              or gather information for your prompts. This capability significantly enhances the 
              depth and timeliness of insights generated by the platform.
            </p>
            <h4 className="font-semibold mt-5 mb-2.5 text-foreground/90">Key Use Cases:</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1.5 text-sm">
              <li>Real-time market analysis and news aggregation.</li>
              <li>Competitor research and industry trend monitoring.</li>
              <li>Fact-checking and information retrieval for AI prompts.</li>
              <li>Tracking specific data points from various web sources.</li>
              <li>Generating summaries of lengthy articles or reports.</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
