--
'use client';

import { useState, type FormEvent, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BrainCircuit, ChevronRight, Loader2, AlertCircle, Wand2, Info, HelpCircle, Search, LinkIcon, FileText, Settings2, Copy, Check, UserCircle, Activity, MessageSquare, Sparkles, Zap, Eye, Brain, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { interpretUserIntent, type InterpretUserIntentOutput, type UserContext } from '@/ai/flows/interpret-user-intent-flow';
import { neuroSynapse, type NeuroSynapseOutput, type NeuroSynapseInput } from '@/ai/flows/neuro-synapse-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea'; 
import NeuroSynapseResultDisplay from '@/components/neuro-synapse-result-display';
import { PermissionModal } from '@/components/permission-modal';


const predefinedContexts: Record<string, { label: string; icon: React.ReactNode; context: UserContext; exampleActivity: string }> = {
  researcher: {
    label: "Researcher Persona",
    icon: <Search className="mr-2 h-4 w-4 text-blue-500" />,
    context: {
      recentSearches: ["latest advancements in quantum computing", "ethical AI frameworks", "causal inference models"],
      visitedPages: ["/neuro-synapse", "/docs/ai-models", "arxiv.org"],
      currentFocus: "Deep Research & Analysis",
      preferredTone: "formal",
      activeApplications: ["Zotero", "Obsidian", "VS Code"],
      calendarEvents: ["Review grant proposal deadline"],
      timeOfDay: "afternoon",
      deviceStatus: { batteryLevel: 75, isCharging: false, networkType: "WiFi"},
      interactionFootprints: { typingRhythm: "moderate", appSwitchFrequency: "low" }
    },
    exampleActivity: "Currently focused on a research paper about AI ethics, with recent searches on quantum computing."
  },
  developer: {
    label: "Developer Persona",
    icon: <FileText className="mr-2 h-4 w-4 text-green-500" />,
    context: {
      recentSearches: ["Next.js server components", "Tailwind CSS best practices", "Genkit AI tutorial"],
      visitedPages: ["/plugin-marketplace", "github.com/neurovichar", "/docs/api"],
      currentFocus: "Coding & API Integration",
      preferredTone: "technical",
      activeApplications: ["VS Code", "Docker Desktop", "Terminal"],
      calendarEvents: ["Sprint planning meeting"],
      timeOfDay: "morning",
      deviceStatus: { batteryLevel: 90, isCharging: true, networkType: "Ethernet"},
      interactionFootprints: { typingRhythm: "fast", copyPasteActivity: true, appSwitchFrequency: "medium" }
    },
    exampleActivity: "Working on a new plugin for NeuroVichar, frequently visiting API docs and GitHub."
  },
  creativePro: {
    label: "Creative Professional",
    icon: <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />,
    context: {
      recentSearches: ["surreal art styles", "AI generated music prompts", "character design inspiration"],
      visitedPages: ["/ai-image-generation", "/idea-catalyst", "pinterest.com", "behance.net"],
      currentFocus: "Content Creation & Brainstorming",
      preferredTone: "casual",
      activeApplications: ["Photoshop", "Figma", "Spotify"],
      calendarEvents: ["Client feedback session", "Moodboard presentation"],
      timeOfDay: "evening",
      deviceStatus: { batteryLevel: 60, isCharging: false, networkType: "WiFi"},
      interactionFootprints: { typingRhythm: "moderate", appSwitchFrequency: "high" }
    },
    exampleActivity: "Exploring visual ideas for a new project, frequently using image generation and idea catalyst."
  },
   genericUser: {
    label: "General User Context",
    icon: <UserCircle className="mr-2 h-4 w-4 opacity-60" />,
    context: {
      recentSearches: ["how to use NeuroVichar", "best AI tools 2024"],
      visitedPages: ["/", "/help", "/profile"],
      currentFocus: "Platform Exploration",
      preferredTone: "casual",
      activeApplications: ["Browser", "Email Client"],
      calendarEvents: [],
      timeOfDay: "any",
      deviceStatus: { batteryLevel: 80, isCharging: false, networkType: "WiFi"},
      interactionFootprints: { typingRhythm: "moderate", appSwitchFrequency: "low" }
    },
    exampleActivity: "Browsing NeuroVichar features, learning about AI capabilities."
  }
};


export default function NeuralInterfacePage() {
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [isLoadingSynapse, setIsLoadingSynapse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentResult, setIntentResult] = useState<InterpretUserIntentOutput | null>(null);
  const [synapseResult, setSynapseResult] = useState<NeuroSynapseOutput | null>(null);
  const [selectedContextKey, setSelectedContextKey] = useState<string>('genericUser');
  
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'allowed' | 'denied'>('unknown');
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    const storedPermission = localStorage.getItem('neuroVicharTrackingPermission');
    if (storedPermission === 'allowed') {
      setPermissionStatus('allowed');
    } else if (storedPermission === 'denied') {
      setPermissionStatus('denied');
    } else {
      setPermissionStatus('unknown');
      setShowPermissionModal(true);
    }
  }, []);

  const handleAllowPermission = () => {
    localStorage.setItem('neuroVicharTrackingPermission', 'allowed');
    setPermissionStatus('allowed');
    setShowPermissionModal(false);
    toast({
      title: "Permissions Granted",
      description: "Neural Interface will now use contextual data for enhanced suggestions.",
      className: "bg-green-500 text-white border-green-600"
    });
  };

  const handleDenyPermission = () => {
    localStorage.setItem('neuroVicharTrackingPermission', 'denied');
    setPermissionStatus('denied');
    setShowPermissionModal(false);
     toast({
      title: "Permissions Denied",
      description: "Neural Interface will operate with limited contextual understanding.",
      variant: "destructive"
    });
  };


  const currentUserContext = predefinedContexts[selectedContextKey]?.context || {};

  const handleContextChange = useCallback((key: string) => {
    setSelectedContextKey(key);
    setIntentResult(null); 
    setSynapseResult(null); 
  }, []);
  
  const handleNeuroVicharActivation = async () => {
    if (permissionStatus !== 'allowed') {
      setShowPermissionModal(true);
      toast({
        title: "Permission Required",
        description: "Please allow background activity tracking to use the full Neural Interface capabilities.",
        variant: "default"
      });
      return;
    }

    setIsLoadingIntent(true);
    setError(null);
    setIntentResult(null);
    setSynapseResult(null);

    try {
      const response = await interpretUserIntent({ 
        userQuery: "Infer intent based on my current context.", 
        userContext: permissionStatus === 'allowed' ? currentUserContext : { preferredTone: currentUserContext.preferredTone || "casual"} 
      });
      setIntentResult(response);
      toast({
        title: "Intent Inferred!",
        description: "NeuroVichar has analyzed your context and suggested a course of action.",
        className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600"
      });
    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred while interpreting your intent.';
      setError(errorMessage);
      console.error("Neural Interface (Intent) error:", e);
      toast({ title: "Intent Inference Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingIntent(false);
    }
  };

  const handleEngageSynapse = async () => {
    if (!intentResult?.softPromptForSynapse) {
      setError("No inferred prompt available to send to Neuro Synapse.");
      toast({ title: "Synapse Error", description: "Cannot proceed without an inferred prompt.", variant: "destructive" });
      return;
    }
    setIsLoadingSynapse(true);
    setError(null);
    setSynapseResult(null);

    try {
      const synapseInput: NeuroSynapseInput = {
        mainPrompt: intentResult.softPromptForSynapse,
        userContext: permissionStatus === 'allowed' ? currentUserContext : undefined, 
        isMagicMode: true 
      };
      const response = await neuroSynapse(synapseInput);
      setSynapseResult(response);
       toast({
        title: "Neuro Synapse Complete!",
        description: "The orchestrated AI task has finished processing.",
        className: "bg-gradient-to-r from-green-500 to-teal-500 text-white border-green-600"
      });
    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred with Neuro Synapse.';
      setError(errorMessage);
      console.error("Neural Interface (Synapse) error:", e);
      toast({ title: "Neuro Synapse Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingSynapse(false);
    }
  };


  const handleCopyPrompt = () => {
    if (intentResult?.softPromptForSynapse) {
      navigator.clipboard.writeText(intentResult.softPromptForSynapse)
        .then(() => {
          setIsCopied(true);
          toast({ title: "Prompt Copied!", description: "The inferred prompt is now in your clipboard." });
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          toast({ title: "Copy Failed", description: "Could not copy the prompt.", variant: "destructive" });
        });
    }
  };
  
  return (
    <div className="space-y-12 min-h-screen">
      <PermissionModal
        isOpen={showPermissionModal}
        onAllow={handleAllowPermission}
        onDeny={handleDenyPermission}
        onClose={() => {
          // If user closes without deciding and status is still unknown, consider it denied for this session
          if (permissionStatus === 'unknown') {
            handleDenyPermission(); // Or set to a temporary 'dismissed' state
          } else {
            setShowPermissionModal(false);
          }
        }}
      />
      <header className="relative text-center py-16 md:py-24 overflow-hidden rounded-xl bg-gradient-to-br from-primary/80 via-accent/70 to-pink-500/80 shadow-2xl">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url('/circuit-board.svg')"}}></div>
        <div className="relative z-10">
          <motion.div
            initial={{ opacity:0, scale:0.5 }}
            animate={{ opacity:1, scale:1 }}
            transition={{ type: 'spring', stiffness:100, damping:10, delay:0.1 }}
          >
            <Eye className="w-28 h-28 text-primary-foreground/80 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity:0, y:-20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6, delay:0.3, ease:'easeOut' }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-primary-foreground"
          >
            Neural Interface
          </motion.h1>
          <motion.p 
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6, delay:0.5, ease:'easeOut' }}
            className="text-xl md:text-2xl text-primary-foreground/90 mt-5 max-w-3xl mx-auto px-4"
          >
            Tap into NeuroVichar's cognitive core. We analyze your digital context to anticipate your needs—no typing required.
          </motion.p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-10 items-start">
        <motion.div 
          className="lg:col-span-1 space-y-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
        >
          <Card className="shadow-xl bg-card/85 backdrop-blur-md border-primary/15 sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2.5 text-foreground/90"><UserCircle className="w-7 h-7 text-accent"/>Simulate Your Context</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Choose a persona to simulate different background activities and preferences. NeuroVichar will use this to infer your intent.
                 {permissionStatus === 'denied' && <span className="block text-yellow-600 dark:text-yellow-400 text-xs mt-1">Contextual features are limited due to denied permissions.</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {Object.entries(predefinedContexts).map(([key, {label, icon, exampleActivity}]) => (
                <Button 
                  key={key} 
                  variant={selectedContextKey === key ? "default" : "outline"} 
                  onClick={() => handleContextChange(key)}
                  className={cn(
                    "w-full justify-start text-left py-3.5 px-4 text-sm transition-all duration-200 ease-out transform hover:scale-[1.02]",
                    selectedContextKey === key 
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg border-transparent" 
                      : "border-border hover:border-accent hover:bg-accent/10 text-foreground/80"
                  )}
                  disabled={isLoadingIntent || isLoadingSynapse}
                  title={exampleActivity}
                >
                  {icon}
                  <span className="truncate font-medium">{label}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2 space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        >
          <Card className="shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 bg-card/90 backdrop-blur-lg border-2 border-accent/30">
            <CardHeader className="text-center">
              <motion.div
                key={selectedContextKey} 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 12 }}
              >
                <Brain className="w-16 h-16 text-accent mx-auto mb-3" />
              </motion.div>
              <CardTitle className="text-3xl font-semibold text-foreground/95">Activate NeuroVichar</CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-1.5">
                Click below. We'll analyze your <strong className="text-accent">{predefinedContexts[selectedContextKey]?.label || "current"}</strong> context and predict your next move.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                {permissionStatus === 'denied' && (
                  <Alert variant="destructive" className="mb-6 text-left shadow-md">
                    <ShieldAlert className="h-5 w-5" />
                    <AlertTitle>Permissions Denied</AlertTitle>
                    <AlertDescription>
                      The Neural Interface requires background activity tracking permissions to function optimally. 
                      Please enable them in your settings or click "Allow" in the permission prompt if it reappears.
                      <Button variant="link" onClick={() => setShowPermissionModal(true)} className="p-0 h-auto ml-1 text-destructive hover:underline">Re-show Permission Prompt</Button>
                    </AlertDescription>
                  </Alert>
                )}
                <Button 
                  onClick={handleNeuroVicharActivation}
                  disabled={isLoadingIntent || isLoadingSynapse || permissionStatus !== 'allowed'} 
                  size="lg" 
                  className="text-xl px-12 py-8 shadow-xl hover:shadow-accent/40 transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-br from-accent via-pink-500 to-purple-600 text-primary-foreground rounded-xl group"
                >
                  {isLoadingIntent ? (
                    <>
                      <Loader2 className="mr-3 h-7 w-7 animate-spin" />
                      ANALYZING CONTEXT...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-3 h-7 w-7 transition-transform group-hover:rotate-[15deg] group-hover:scale-110" />
                      ENGAGE NEUROVICHAR
                    </>
                  )}
                </Button>
                 {error && !isLoadingIntent && !isLoadingSynapse && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                    <Alert variant="destructive" className="shadow-lg border-red-500/50 text-left">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <AlertTitle className="font-semibold text-red-600 dark:text-red-400">Interface Error</AlertTitle>
                      <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
            </CardContent>
          </Card>
      
          <AnimatePresence>
            {isLoadingIntent && (
               <motion.div 
                key="loading-indicator-ni-intent"
                initial={{ opacity: 0, height: 0, y: 20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20, transition: {duration: 0.25} }}
                className="mt-8"
              >
                <Card className="shadow-xl bg-card/85 backdrop-blur-sm border-purple-500/20">
                  <CardContent className="p-8 text-center space-y-5">
                    <motion.div
                      animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Eye className="mx-auto h-14 w-14 text-purple-500" />
                    </motion.div>
                    <p className="text-lg text-muted-foreground font-medium">Interpreting your digital aura... This may take a few seconds.</p>
                    <div className="w-full bg-muted rounded-full h-3.5 dark:bg-gray-700 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3.5 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease:"easeInOut" }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
          {intentResult && !isLoadingIntent && (
            <motion.div
              key="intent-result-section"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "circOut", delay: 0.1 }}
              className="mt-8"
            >
              <Card className="shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-primary/30 overflow-hidden">
                <CardHeader className="pb-5 border-b border-border/60 bg-gradient-to-br from-card to-muted/10 p-6">
                  <div className="flex items-center gap-4">
                     <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}>
                      <BrainCircuit className="w-12 h-12 text-primary drop-shadow-lg" />
                     </motion.div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-pink-500">
                        Inferred Intent
                      </CardTitle>
                      <CardDescription className="text-base mt-1 text-muted-foreground">
                        Based on your <strong className="text-foreground/80">{predefinedContexts[selectedContextKey]?.label || "selected"}</strong> context.
                         Confidence: <Progress value={(intentResult.confidence || 0) * 100} className="w-24 h-2 inline-block ml-1" indicatorClassName={cn(intentResult.confidence > 0.7 ? 'bg-green-500' : intentResult.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500')} />
                         <span className="ml-1 text-xs">({((intentResult.confidence || 0) * 100).toFixed(0)}%)</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6 md:p-8">
                  <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay:0.1, duration:0.4, ease: "easeOut"}}>
                    <Label className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">AI's Inferred Goal:</Label>
                    <p className="text-lg text-foreground/95 p-4 mt-1.5 bg-muted/50 rounded-lg shadow-md border border-primary/20">{intentResult.inferredIntent}</p>
                  </motion.div>

                  {intentResult.softPromptForSynapse && (
                    <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay:0.2, duration:0.4, ease: "easeOut"}}>
                      <div className="flex justify-between items-center mb-1.5">
                        <Label className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Generated Prompt for NeuroSynapse:</Label>
                        <Button variant="ghost" size="sm" onClick={handleCopyPrompt} className="text-accent hover:text-accent/80">
                          {isCopied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                          {isCopied ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                      <Textarea 
                          value={intentResult.softPromptForSynapse} 
                          readOnly 
                          className="text-md bg-muted/50 border-dashed border-accent/30 min-h-[120px] p-3.5 rounded-lg shadow-inner focus-visible:ring-accent focus-visible:border-accent"
                      />
                    </motion.div>
                  )}
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="explanation" className="border-border/40">
                      <AccordionTrigger className="text-md font-semibold hover:no-underline text-foreground/80 py-3 text-left">Why this inference? (AI's Reasoning)</AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2 text-foreground/85 bg-muted/20 p-4 rounded-b-md border-t border-dashed border-border/30">
                        <p className="text-sm leading-relaxed">{intentResult.explanation}</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                   <div className="pt-4 text-center">
                        <Button 
                          onClick={handleEngageSynapse}
                          disabled={isLoadingSynapse || !intentResult.softPromptForSynapse} 
                          size="lg" 
                          className="text-lg px-10 py-7 shadow-xl hover:shadow-green-500/30 transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-primary-foreground rounded-lg group"
                        >
                          {isLoadingSynapse ? (
                            <>
                              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                              Engaging Synapse...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-3 h-6 w-6 transition-transform group-hover:animate-ping once" />
                              Engage Synapse with this Intent
                            </>
                          )}
                        </Button>
                    </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          </AnimatePresence>

          <AnimatePresence>
            {isLoadingSynapse && (
                 <motion.div 
                    key="loading-indicator-ni-synapse"
                    initial={{ opacity: 0, height: 0, y: 20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20, transition: {duration: 0.25} }}
                    className="mt-8"
                  >
                    <Card className="shadow-xl bg-card/85 backdrop-blur-sm border-green-500/20">
                      <CardContent className="p-8 text-center space-y-5">
                        <motion.div
                          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <BrainCircuit className="mx-auto h-14 w-14 text-green-500" />
                        </motion.div>
                        <p className="text-lg text-muted-foreground font-medium">NeuroSynapse is processing your inferred intent... This may take a moment.</p>
                        <div className="w-full bg-muted rounded-full h-3.5 dark:bg-gray-700 overflow-hidden">
                          <motion.div 
                            className="bg-gradient-to-r from-green-500 to-teal-500 h-3.5 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease:"easeInOut" }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
            )}
            {synapseResult && !isLoadingSynapse && (
              <motion.div
                key="synapse-result-section"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: "circOut" }}
                className="mt-8"
              >
                <NeuroSynapseResultDisplay result={synapseResult} />
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}

    