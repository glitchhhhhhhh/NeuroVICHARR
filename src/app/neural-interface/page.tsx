
'use client';

import { useState, type FormEvent, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Kept for potential future use
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BrainCircuit, ChevronRight, Loader2, AlertCircle, Wand2, Info, HelpCircle, Search, LinkIcon, FileText, Settings2, Copy, Check, UserCircle, Activity } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { interpretUserIntent, type InterpretUserIntentOutput, type UserContext } from '@/ai/flows/interpret-user-intent-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const ActionIcon: React.FC<{ type: InterpretUserIntentOutput['suggestedActionType'] | undefined, className?: string }> = ({ type, className = "w-7 h-7" }) => {
  switch (type) {
    case 'NAVIGATE': return <LinkIcon className={cn(className, "text-blue-500 dark:text-blue-400")} />;
    case 'EXECUTE_FLOW': return <Wand2 className={cn(className, "text-purple-500 dark:text-purple-400")} />;
    case 'CLARIFY': return <HelpCircle className={cn(className, "text-yellow-500 dark:text-yellow-400")} />;
    case 'INFORM': return <Info className={cn(className, "text-green-500 dark:text-green-400")} />;
    default: return <Activity className={cn(className, "text-gray-500 dark:text-gray-400")} />;
  }
};

const predefinedContexts: Record<string, { label: string; icon: React.ReactNode; context: UserContext }> = {
  none: {
    label: "No Specific Context",
    icon: <UserCircle className="mr-2 h-4 w-4 opacity-50" />,
    context: {},
  },
  imageExplorer: {
    label: "Image Creator Persona",
    icon: <FileText className="mr-2 h-4 w-4 text-accent/80" />,
    context: {
      recentSearches: ["futuristic cities", "cyberpunk art", "fantasy landscapes"],
      visitedPages: ["/ai-image-generation", "/"],
      currentFocus: "AI Image Generation",
      preferredTone: "casual",
    }
  },
  dataAnalyst: {
    label: "Data Analyst Persona",
    icon: <Search className="mr-2 h-4 w-4 text-accent/80" />,
    context: {
      recentSearches: ["market trends Q4", "impact of AI on finance", "data visualization techniques"],
      visitedPages: ["/web-browsing", "/neuro-synapse", "/dashboard"],
      currentFocus: "Data Analysis and Summarization",
      preferredTone: "technical",
    }
  },
  newbie: {
    label: "New User Persona",
    icon: <HelpCircle className="mr-2 h-4 w-4 text-accent/80" />,
    context: {
      recentSearches: ["what is neurovichar", "how to use AI prompts", "getting started guide"],
      visitedPages: ["/", "/help"],
      currentFocus: "Learning the platform",
      preferredTone: "formal",
    }
  }
};


export default function NeuralInterfacePage() {
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterpretUserIntentOutput | null>(null);
  const [selectedContextKey, setSelectedContextKey] = useState<string>('none');
  const [userContext, setUserContext] = useState<UserContext>(predefinedContexts.none.context);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleContextChange = useCallback((key: string) => {
    setSelectedContextKey(key);
    setUserContext(predefinedContexts[key]?.context || {});
  }, []);
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    // Keep previous result for a smoother transition or set to null
    // setResult(null);

    try {
      if (!userQuery.trim()) {
        setError('Please enter your query or intention.');
        setIsLoading(false);
        return;
      }
      const response = await interpretUserIntent({ userQuery, userContext: selectedContextKey === 'none' ? undefined : userContext });
      setResult(response);
    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred while interpreting your intent.';
      setError(errorMessage);
      console.error("Neural Interface error:", e);
      toast({
        title: "Interpretation Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    if (result?.refinedPrompt) {
      navigator.clipboard.writeText(result.refinedPrompt)
        .then(() => {
          setIsCopied(true);
          toast({ title: "Prompt Copied!", description: "The refined prompt is now in your clipboard." });
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          toast({ title: "Copy Failed", description: "Could not copy the prompt.", variant: "destructive" });
        });
    }
  };

  useEffect(() => {
    // Example initial query based on a random context to showcase variety
    const randomContextKey = Object.keys(predefinedContexts)[Math.floor(Math.random() * Object.keys(predefinedContexts).length)];
    handleContextChange(randomContextKey);

    if (randomContextKey === 'imageExplorer') {
      setUserQuery("I feel like creating something visually stunning, maybe a neon-drenched cyberpunk city?");
    } else if (randomContextKey === 'dataAnalyst') {
      setUserQuery("Can you find and summarize the latest news on renewable energy investments?");
    } else if (randomContextKey === 'newbie') {
      setUserQuery("I'm new here. What's the best way to start using NeuroVichar for creative writing?");
    } else {
      setUserQuery("Hello! What can you do for me today?");
    }
  }, [handleContextChange]);
  
  const getConfidenceColor = (confidence: number): string => {
    if (confidence < 0.3) return 'bg-red-500';
    if (confidence < 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col items-center text-center space-y-4">
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1], 
            filter: ['hue-rotate(0deg)', 'hue-rotate(45deg)', 'hue-rotate(0deg)'] 
          }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
          <BrainCircuit className="w-20 h-20 text-accent drop-shadow-xl" />
        </motion.div>
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent">
            Neural Interface
          </h1>
          <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            Converse naturally. Let our AI understand your intentions and guide you through NeuroVichar's capabilities.
          </p>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-10 items-start">
        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          <Card className="shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 bg-card/85 backdrop-blur-md border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold text-foreground/95">What's on your mind?</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Describe what you'd like to do, ask a question, or state your goal. The more context you provide (via the panel on the right), the better the AI can assist.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="user-query-input" className="text-md font-medium text-foreground/80">Your Intention / Query</Label>
                  <Textarea
                    id="user-query-input"
                    placeholder="e.g., 'Generate an image of a serene landscape' or 'Help me analyze recent tech news'"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    disabled={isLoading}
                    required
                    className="text-lg p-4 min-h-[150px] resize-y bg-background/60 focus:bg-background focus:ring-accent focus:border-accent text-foreground/90 placeholder-muted-foreground/70 rounded-lg shadow-inner"
                    aria-label="User intention or query for Neural Interface"
                  />
                </div>
                 {error && (
                  <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 250, damping: 18 }}>
                    <Alert variant="destructive" className="shadow-lg border-red-500/50">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <AlertTitle className="font-semibold text-red-500">Interpretation Error</AlertTitle>
                      <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  size="lg" 
                  className="text-lg px-10 py-7 w-full sm:w-auto shadow-lg hover:shadow-accent/30 transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2.5 h-6 w-6 animate-spin" />
                      Interpreting...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2.5 h-6 w-6" />
                      Engage Interface
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <Card className="shadow-xl bg-card/75 backdrop-blur-md border-primary/15">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2.5 text-foreground/90"><Settings2 className="w-6 h-6 text-accent"/>Simulate User Context</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Choose a persona to simulate different user contexts. This helps the AI tailor its response.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {Object.entries(predefinedContexts).map(([key, {label, icon}]) => (
                <Button 
                  key={key} 
                  variant={selectedContextKey === key ? "default" : "outline"} 
                  onClick={() => handleContextChange(key)}
                  className={cn(
                    "w-full justify-start text-left py-3 px-4 transition-all duration-200 ease-out transform hover:scale-[1.02]",
                    selectedContextKey === key 
                      ? "bg-accent text-accent-foreground shadow-md border-accent" 
                      : "border-border hover:border-accent hover:bg-accent/10"
                  )}
                  disabled={isLoading}
                >
                  {icon}
                  <span className="truncate">{label}</span>
                </Button>
              ))}
               <AnimatePresence>
                {selectedContextKey !== 'none' && userContext && Object.keys(userContext).length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="text-xs text-muted-foreground space-y-1.5 p-3.5 bg-muted/40 rounded-lg border border-dashed border-border/70 shadow-inner"
                  >
                    {userContext.recentSearches && userContext.recentSearches.length > 0 && <p><strong>Recent Searches:</strong> {userContext.recentSearches.join(', ')}</p>}
                    {userContext.visitedPages && userContext.visitedPages.length > 0 && <p><strong>Visited Pages:</strong> {userContext.visitedPages.join(', ')}</p>}
                    {userContext.currentFocus && <p><strong>Current Focus:</strong> {userContext.currentFocus}</p>}
                    {userContext.preferredTone && <p><strong>Preferred Tone:</strong> {userContext.preferredTone}</p>}
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
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20, transition: {duration: 0.25} }}
            className="mt-10"
          >
            <Card className="shadow-xl bg-card/85 backdrop-blur-sm border-primary/20">
              <CardContent className="p-8 text-center space-y-5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="mx-auto h-14 w-14 text-accent" />
                </motion.div>
                <p className="text-lg text-muted-foreground font-medium">Connecting to the neural stream... Weaving insights from digital echoes.</p>
                <div className="w-full bg-muted rounded-full h-3.5 dark:bg-gray-700 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3.5 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease:"easeInOut" }}
                  />
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
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "circOut", delay: 0.1 }}
          className="mt-12"
        >
          <Card className="shadow-2xl bg-card/90 backdrop-blur-lg overflow-hidden border-2 border-accent/30">
            <CardHeader className="pb-5 border-b border-border/60 bg-gradient-to-br from-card to-muted/20 p-6">
              <div className="flex items-center gap-4">
                 <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                  >
                  <BrainCircuit className="w-12 h-12 text-accent drop-shadow-lg" />
                 </motion.div>
                <div>
                  <CardTitle className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-pink-500">
                    Neural Interpretation
                  </CardTitle>
                  <CardDescription className="text-base mt-1.5 text-muted-foreground">
                    Original Query: <span className="italic text-foreground/85">"{result.originalQuery}"</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 p-6 md:p-8">
              
              <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay:0.15, duration:0.5, ease: "easeOut"}}>
                <Label className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">AI's Interpretation:</Label>
                <p className="text-lg text-foreground/95 p-4 mt-1.5 bg-muted/40 rounded-lg shadow-md border border-primary/25">{result.interpretation}</p>
              </motion.div>

              <Separator className="bg-border/50" />

              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay:0.25, duration:0.5, ease: "easeOut"}}>
                  <Label className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Suggested Action:</Label>
                  <Card className="p-4 mt-1.5 bg-muted/40 shadow-md border border-accent/30">
                    <div className="flex items-center space-x-3.5">
                      <ActionIcon type={result.suggestedActionType} className="w-8 h-8 flex-shrink-0" />
                      <div>
                        <Badge variant="outline" className="text-sm capitalize mb-1.5 border-accent/60 text-accent bg-accent/10 px-2.5 py-1 rounded-full font-medium">{result.suggestedActionType?.toLowerCase().replace('_', ' ')}</Badge>
                        <p className="text-md font-medium text-foreground">
                          {result.suggestedActionDetail || 'No specific detail.'}
                          {result.suggestedActionType === "NAVIGATE" && result.suggestedActionDetail && (
                            <Link href={result.suggestedActionDetail} passHref>
                              <Button variant="link" size="sm" className="ml-1.5 p-0 h-auto text-accent hover:text-accent/80 font-semibold group">
                                Go <ChevronRight className="w-4 h-4 ml-0.5 transition-transform group-hover:translate-x-1"/>
                              </Button>
                            </Link>
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay:0.3, duration:0.5, ease: "easeOut"}}>
                  <Label className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Confidence Level:</Label>
                  <div className="p-4 mt-1.5 bg-muted/40 rounded-lg shadow-md border border-border/40">
                    <Progress value={result.confidence * 100} className="h-3.5 mb-1.5" indicatorClassName={getConfidenceColor(result.confidence)} />
                    <p className={cn("text-right text-sm font-semibold", 
                        result.confidence < 0.3 ? 'text-red-500' : result.confidence < 0.7 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                    )}>
                        {(result.confidence * 100).toFixed(0)}% Confident
                    </p>
                  </div>
                </motion.div>
              </div>
              
              <Accordion type="single" collapsible className="w-full" defaultValue="explanation">
                <AccordionItem value="explanation" className="border-border/50">
                  <AccordionTrigger className="text-md font-semibold hover:no-underline text-foreground/85 py-3.5">View Explanation & Refined Prompt</AccordionTrigger>
                  <AccordionContent className="space-y-5 pt-3 text-foreground/90 bg-muted/20 p-4 rounded-b-lg border-t border-dashed border-border/40">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Explanation:</Label>
                      <p className="text-sm leading-relaxed mt-1">{result.explanation}</p>
                    </div>
                    {result.refinedPrompt && (
                       <div>
                         <div className="flex justify-between items-center">
                           <Label className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Suggested Refined Prompt (for other features):</Label>
                           <Button variant="ghost" size="sm" onClick={handleCopyPrompt} className="text-accent hover:text-accent/80">
                             {isCopied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                             {isCopied ? 'Copied!' : 'Copy'}
                           </Button>
                         </div>
                         <Textarea 
                            value={result.refinedPrompt} 
                            readOnly 
                            className="text-sm bg-background/50 border-dashed mt-1 min-h-[90px] focus-visible:ring-accent focus-visible:border-accent"
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
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: result && !isLoading ? 0.3 : 0.1, ease: "easeOut" }}
      >
        <Card className="mt-16 bg-card/80 backdrop-blur-lg shadow-xl border-primary/15">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-semibold text-foreground/95">Understanding the Neural Interface</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
             <div className="flex justify-center my-5">
              <Image 
                src="https://picsum.photos/600/300?random=10" 
                alt="Abstract Neural Network Visualization" 
                width={600} 
                height={300} 
                className="rounded-xl shadow-lg object-cover border-2 border-accent/20"
                data-ai-hint="neural network"
              />
            </div>
            <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
             <p>
               The Neural Interface aims to provide a more intuitive way to interact with complex AI systems. 
               Instead of requiring precise commands or structured inputs, it attempts to understand your intent from natural language.
               By optionally considering your (simulated) recent activity and preferences, it can tailor its interpretations and suggestions, much like how a human assistant learns over time.
               This demonstration showcases how the AI can:
             </p>
             <ul className="space-y-1.5">
               <li>Parse conversational queries and extract core meaning.</li>
               <li>Map interpreted intent to specific application features or actions.</li>
               <li>Suggest navigation paths or parameters for other AI flows.</li>
               <li>Request clarification when ambiguity is high.</li>
               <li>Provide an explanation for its reasoning, enhancing transparency.</li>
             </ul>
             <p>
               The "Simulate User Context" panel allows you to see how different background information can influence the AI's response, mimicking a personalized experience.
               This is a step towards AI systems that adapt more fluidly to individual user needs and communication styles, creating a truly bespoke interaction.
             </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
