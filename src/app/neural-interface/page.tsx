'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BrainCircuit, ChevronRight, Loader2, AlertCircle, Wand2, Info, HelpCircle, Search, LinkIcon, FileText, Settings2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { interpretUserIntent, type InterpretUserIntentOutput, type UserContext } from '@/ai/flows/interpret-user-intent-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import Image from 'next/image';

const ActionIcon: React.FC<{ type: InterpretUserIntentOutput['suggestedActionType'] | undefined, className?: string }> = ({ type, className = "w-5 h-5" }) => {
  switch (type) {
    case 'NAVIGATE': return <LinkIcon className={className + " text-blue-500"} />;
    case 'EXECUTE_FLOW': return <Wand2 className={className + " text-purple-500"} />;
    case 'CLARIFY': return <HelpCircle className={className + " text-yellow-500"} />;
    case 'INFORM': return <Info className={className + " text-green-500"} />;
    default: return <Search className={className + " text-gray-500"} />;
  }
};

const predefinedContexts: Record<string, UserContext> = {
  none: {},
  imageExplorer: {
    recentSearches: ["futuristic cities", "cyberpunk art"],
    visitedPages: ["/ai-image-generation", "/"],
    currentFocus: "AI Image Generation",
    preferredTone: "casual",
  },
  dataAnalyst: {
    recentSearches: ["market trends Q3", "impact of AI on finance"],
    visitedPages: ["/web-browsing", "/neuro-synapse", "/data-analysis-tool"],
    currentFocus: "Data Analysis",
    preferredTone: "technical",
  },
  newbie: {
    recentSearches: ["what is neurovichar", "how to use AI"],
    visitedPages: ["/"],
    currentFocus: "Learning the platform",
    preferredTone: "formal",
  }
};


export default function NeuralInterfacePage() {
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterpretUserIntentOutput | null>(null);
  const [selectedContextKey, setSelectedContextKey] = useState<string>('none');
  const [userContext, setUserContext] = useState<UserContext>(predefinedContexts.none);

  const handleContextChange = (key: string) => {
    setSelectedContextKey(key);
    setUserContext(predefinedContexts[key] || {});
  };
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!userQuery.trim()) {
        setError('Please enter your query or intention.');
        setIsLoading(false);
        return;
      }
      const response = await interpretUserIntent({ userQuery, userContext: selectedContextKey === 'none' ? undefined : userContext });
      setResult(response);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred while interpreting your intent.');
      console.error("Neural Interface error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Example initial query
    setUserQuery("I'm looking for inspiration. Show me something cool I can do with images.");
  }, []);

  return (
    <div className="space-y-10">
      <header className="flex items-center space-x-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1], filter: ['hue-rotate(0deg)', 'hue-rotate(30deg)', 'hue-rotate(0deg)'] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
          <BrainCircuit className="w-16 h-16 text-accent drop-shadow-lg" />
        </motion.div>
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">Neural Interface</h1>
          <p className="text-xl text-muted-foreground mt-2 max-w-2xl">
            Converse naturally. Let our AI understand your intentions and guide you.
          </p>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">What's on your mind?</CardTitle>
              <CardDescription className="text-base">
                Describe what you'd like to do, ask a question, or state your goal. The more context you provide (via the panel on the right), the better the AI can assist.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="user-query-input" className="text-md font-medium">Your Intention / Query</Label>
                  <Textarea
                    id="user-query-input"
                    placeholder="e.g., 'Generate an image of a serene landscape' or 'Help me analyze recent tech news'"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    disabled={isLoading}
                    required
                    className="text-lg p-3 min-h-[120px] resize-y bg-background/70 focus:bg-background"
                    aria-label="User intention or query for Neural Interface"
                  />
                </div>
                 {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                    <Alert variant="destructive" className="shadow-md">
                      <AlertCircle className="h-5 w-5" />
                      <AlertTitle className="font-semibold">Interpretation Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} size="lg" className="text-lg px-8 py-6 w-full sm:w-auto shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2.5 h-6 w-6 animate-spin" />
                      Interpreting...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2.5 h-6 w-6" />
                      Send to Interface
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><Settings2 className="w-6 h-6 text-accent"/>Simulate User Context</CardTitle>
              <CardDescription className="text-sm">
                Choose a persona to simulate different user contexts. This helps the AI tailor its response.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(predefinedContexts).map(([key, contextData]) => (
                <Button 
                  key={key} 
                  variant={selectedContextKey === key ? "default" : "outline"} 
                  onClick={() => handleContextChange(key)}
                  className="w-full justify-start"
                  disabled={isLoading}
                >
                  {key === "imageExplorer" && <FileText className="mr-2 h-4 w-4"/> }
                  {key === "dataAnalyst" && <Search className="mr-2 h-4 w-4"/> }
                  {key === "newbie" && <HelpCircle className="mr-2 h-4 w-4"/> }
                  {key === "none" && <span className="mr-2 h-4 w-4 inline-block"/>}
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} Context
                </Button>
              ))}
               <AnimatePresence>
                {selectedContextKey !== 'none' && userContext && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-md border border-dashed"
                  >
                    {userContext.recentSearches && <p><strong>Searches:</strong> {userContext.recentSearches.join(', ')}</p>}
                    {userContext.visitedPages && <p><strong>Pages:</strong> {userContext.visitedPages.join(', ')}</p>}
                    {userContext.currentFocus && <p><strong>Focus:</strong> {userContext.currentFocus}</p>}
                    {userContext.preferredTone && <p><strong>Tone:</strong> {userContext.preferredTone}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            key="loading-indicator-ni"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, transition: {duration: 0.2} }}
            className="mt-8"
          >
            <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center space-y-4">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent" />
                <p className="text-lg text-muted-foreground font-medium">Connecting to the neural stream... Please wait.</p>
                <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                  <div className="bg-accent h-2.5 rounded-full animate-pulse" style={{width: "60%"}}></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
      {result && !isLoading && (
        <motion.div
          key="result-section-ni"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="mt-10"
        >
          <Card className="shadow-xl bg-card/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-3xl flex items-center gap-3">
                <BrainCircuit className="w-9 h-9 text-accent drop-shadow-md" />
                Neural Interpretation
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Original Query: <span className="italic text-foreground/80">"{result.originalQuery}"</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              <motion.div initial={{opacity:0, x:-15}} animate={{opacity:1, x:0}} transition={{delay:0.1, duration:0.4}}>
                <Label className="text-sm font-medium text-muted-foreground">AI's Interpretation:</Label>
                <p className="text-lg text-foreground/95 p-3 bg-muted/30 rounded-md shadow-sm border border-primary/20">{result.interpretation}</p>
              </motion.div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6 items-start">
                <motion.div initial={{opacity:0, x:-15}} animate={{opacity:1, x:0}} transition={{delay:0.2, duration:0.4}}>
                  <Label className="text-sm font-medium text-muted-foreground">Suggested Action:</Label>
                  <Card className="p-4 bg-muted/30 shadow-sm border border-accent/20">
                    <div className="flex items-center space-x-3">
                      <ActionIcon type={result.suggestedActionType} className="w-7 h-7 flex-shrink-0" />
                      <div>
                        <Badge variant="outline" className="text-sm capitalize mb-1 border-accent/50 text-accent">{result.suggestedActionType?.toLowerCase().replace('_', ' ')}</Badge>
                        <p className="text-md font-medium text-foreground">
                          {result.suggestedActionDetail || 'No specific detail.'}
                          {result.suggestedActionType === "NAVIGATE" && result.suggestedActionDetail && (
                            <Link href={result.suggestedActionDetail} passHref>
                              <Button variant="link" size="sm" className="ml-2 p-0 h-auto text-accent hover:text-accent/80">
                                Go <ChevronRight className="w-4 h-4 ml-1"/>
                              </Button>
                            </Link>
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{opacity:0, x:15}} animate={{opacity:1, x:0}} transition={{delay:0.25, duration:0.4}}>
                  <Label className="text-sm font-medium text-muted-foreground">Confidence Level:</Label>
                  <div className="p-4 bg-muted/30 rounded-md shadow-sm border">
                    <Progress value={result.confidence * 100} className="h-3 mb-1" />
                    <p className="text-right text-sm font-medium text-accent">{(result.confidence * 100).toFixed(0)}% Confident</p>
                  </div>
                </motion.div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="explanation">
                  <AccordionTrigger className="text-md hover:no-underline text-foreground/80">View Explanation & Refined Prompt</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Explanation:</Label>
                      <p className="text-md text-foreground/90 p-3 bg-muted/20 rounded-md text-sm leading-relaxed">{result.explanation}</p>
                    </div>
                    {result.refinedPrompt && (
                       <div>
                         <Label className="text-sm font-medium text-muted-foreground">Suggested Refined Prompt (for other features):</Label>
                         <Textarea 
                            value={result.refinedPrompt} 
                            readOnly 
                            className="text-sm bg-muted/20 border-dashed mt-1 min-h-[80px]"
                         />
                       </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
      
      <Card className="mt-12 bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Understanding the Neural Interface</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex justify-center my-4">
            <Image 
              src="https://picsum.photos/600/300?random=10" 
              alt="Abstract Neural Network" 
              width={600} 
              height={300} 
              className="rounded-lg shadow-md object-cover"
              data-ai-hint="neural network"
            />
          </div>
          <p className="text-muted-foreground text-base leading-relaxed prose prose-sm dark:prose-invert max-w-none">
           The Neural Interface aims to provide a more intuitive way to interact with complex AI systems. 
           Instead of requiring precise commands or structured inputs, it attempts to understand your intent from natural language.
           By optionally considering your (simulated) recent activity and preferences, it can tailor its interpretations and suggestions, much like how a human assistant learns over time.
           This demonstration showcases how the AI can:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
            <li>Parse conversational queries and extract core meaning.</li>
            <li>Map interpreted intent to specific application features or actions.</li>
            <li>Suggest navigation paths or parameters for other AI flows.</li>
            <li>Request clarification when ambiguity is high.</li>
            <li>Provide an explanation for its reasoning, enhancing transparency.</li>
          </ul>
          <p className="text-muted-foreground text-sm">
           The "Simulate User Context" panel allows you to see how different background information can influence the AI's response, mimicking a personalized experience.
           This is a step towards AI systems that adapt more fluidly to individual user needs and communication styles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
