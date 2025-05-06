'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lightbulb, Sparkles, Loader2, AlertCircle, Brain, Send, FileText, Users, Copy, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { catalyzeIdea, type CatalyzeIdeaOutput } from '@/ai/flows/catalyze-idea-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function IdeaCatalystPage() {
  const [theme, setTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CatalyzeIdeaOutput | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const exampleThemes = [
    "The impact of AI on creative industries",
    "Sustainable urban development in megacities",
    "The future of decentralized finance (DeFi)",
    "Ethical considerations of human gene editing",
    "The role of virtual reality in education"
  ];
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');

  useEffect(() => {
    setCurrentPlaceholder(exampleThemes[Math.floor(Math.random() * exampleThemes.length)]);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    // setResult(null); // Keep previous result for smoother UI or clear it

    try {
      if (!theme.trim()) {
        setError('Please enter a theme to explore.');
        setIsLoading(false);
        return;
      }
      const response = await catalyzeIdea({ theme });
      setResult(response);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred while catalyzing the idea.');
      console.error("Idea Catalyst error:", e);
      toast({
        title: "Catalyst Error",
        description: e.message || 'Failed to generate ideas.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true);
        toast({ title: "Copied to Clipboard!", description: "The prompt is ready to be used." });
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({ title: "Copy Failed", description: "Could not copy the prompt.", variant: "destructive" });
      });
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col items-center text-center space-y-4">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1], 
            filter: ['brightness(1)', 'brightness(1.5) drop-shadow(0 0 0.5rem hsl(var(--accent)))', 'brightness(1)']
          }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
          <Lightbulb className="w-20 h-20 text-accent drop-shadow-xl" />
        </motion.div>
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-pink-500 animate-gradient-x">
            Idea Catalyst
          </h1>
          <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            Spark innovation for Neuro Synapse. Transform a general theme into actionable, complex AI prompts.
          </p>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      >
        <Card className="shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 bg-card/85 backdrop-blur-md border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-foreground/95">Explore a Theme</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Enter a broad topic or idea. The Catalyst will generate potential research questions, suggest relevant AI agent types, and draft a complex starter prompt for Neuro Synapse.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2.5">
                <Label htmlFor="theme-input" className="text-md font-medium text-foreground/80">Your Theme or Topic</Label>
                <Input
                  id="theme-input"
                  placeholder={`e.g., ${currentPlaceholder}`}
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  disabled={isLoading}
                  required
                  className="text-lg p-4 h-14 bg-background/60 focus:bg-background focus:ring-accent focus:border-accent text-foreground/90 placeholder-muted-foreground/70 rounded-lg shadow-inner"
                  aria-label="Theme or topic for Idea Catalyst"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Try one of these example themes:
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {exampleThemes.slice(0, 3).map(p => (
                    <Button key={p} type="button" variant="outline" size="sm" className="text-xs" onClick={() => setTheme(p)} disabled={isLoading}>
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
              {error && (
                <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 250, damping: 18 }}>
                  <Alert variant="destructive" className="shadow-lg border-red-500/50">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <AlertTitle className="font-semibold text-red-500">Catalyst Error</AlertTitle>
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
                    Catalyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2.5 h-6 w-6" />
                    Ignite Ideas
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
      
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            key="loading-indicator-ic"
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20, transition: {duration: 0.25} }}
            className="mt-10"
          >
            <Card className="shadow-xl bg-card/85 backdrop-blur-sm border-primary/20">
              <CardContent className="p-8 text-center space-y-5">
                <motion.div
                  animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Lightbulb className="mx-auto h-14 w-14 text-accent" />
                </motion.div>
                <p className="text-lg text-muted-foreground font-medium">Brewing potent questions and forging a master prompt...</p>
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
          key="result-section-ic"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "circOut", delay: 0.1 }}
          className="mt-12"
        >
          <Card className="shadow-2xl bg-card/90 backdrop-blur-lg overflow-hidden border-2 border-accent/30">
            <CardHeader className="pb-5 border-b border-border/60 bg-gradient-to-br from-card to-muted/20 p-6">
              <div className="flex items-start gap-4">
                 <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                  >
                  <Sparkles className="w-12 h-12 text-accent drop-shadow-lg" />
                 </motion.div>
                <div>
                  <CardTitle className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-pink-500">
                    Catalyzed Ideas
                  </CardTitle>
                  <CardDescription className="text-base mt-1.5 text-muted-foreground">
                    Original Theme: <span className="italic text-foreground/85">"{result.originalTheme}"</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 p-6 md:p-8">
              
              <motion.section initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1, ease:"easeOut"}}>
                <h3 className="text-xl font-semibold mb-2.5 text-foreground flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  Potential Questions & Research Directions:
                </h3>
                <ul className="list-disc list-outside pl-5 space-y-2">
                  {result.potentialQuestions.map((q, index) => (
                    <motion.li 
                      key={index} 
                      className="text-foreground/90 bg-muted/30 p-3 rounded-md shadow-sm border border-primary/20"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.05, ease: "easeOut" }}
                    >
                      {q}
                    </motion.li>
                  ))}
                </ul>
              </motion.section>
              
              <Separator className="bg-border/50" />

              <motion.section initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay:0.2, ease:"easeOut"}}>
                <h3 className="text-xl font-semibold mb-2.5 text-foreground flex items-center gap-2">
                  <Users className="w-6 h-6 text-green-500" />
                  Suggested AI Agent Types:
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {result.suggestedAgents.map((agent, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 + index * 0.05, type: "spring", stiffness: 150 }}
                    >
                      <Badge variant="outline" className="text-md px-3 py-1.5 border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300 shadow-sm">
                        {agent}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {result.creativeAngle && (
                <>
                <Separator className="bg-border/50" />
                 <motion.section initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay:0.25, ease:"easeOut"}}>
                    <h3 className="text-xl font-semibold mb-2.5 text-foreground flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                    Creative Angle to Consider:
                    </h3>
                    <p className="text-foreground/90 bg-muted/30 p-3 rounded-md shadow-sm border border-yellow-500/20 italic">
                    {result.creativeAngle}
                    </p>
                </motion.section>
                </>
              )}

              <Separator className="bg-border/50" />

              <motion.section initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay:0.3, ease:"easeOut"}}>
                <div className="flex justify-between items-center mb-2.5">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Brain className="w-6 h-6 text-accent" />
                    Starter Prompt for Neuro Synapse:
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(result.starterComplexPrompt)} className="text-accent hover:text-accent-foreground hover:bg-accent border-accent shadow-sm">
                    {isCopied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                    {isCopied ? 'Copied!' : 'Copy Prompt'}
                    </Button>
                </div>
                <Textarea 
                    value={result.starterComplexPrompt} 
                    readOnly 
                    className="text-md bg-muted/40 border-dashed border-accent/40 min-h-[180px] p-4 rounded-lg shadow-inner focus-visible:ring-accent focus-visible:border-accent" 
                />
                <div className="mt-4 flex justify-end">
                    <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                        <Link href={{ pathname: "/neuro-synapse", query: { prompt: result.starterComplexPrompt } }}>
                            <Send className="mr-2 h-5 w-5"/> Use this Prompt in Neuro Synapse
                        </Link>
                    </Button>
                </div>
              </motion.section>

            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
