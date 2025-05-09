
'use client';

import { useState, type FormEvent, useEffect, useMemo, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Zap, Loader2, Workflow, MessageSquare, Activity, CheckCircle2, AlertCircle, Lightbulb, Users, Wrench, ImageUp, Image as ImageIcon, Share2, SearchCode, SlidersHorizontal, BrainCircuit, TimerOff, ShieldCheck, Wand2, FileText, LinkIcon, Server, Edit3 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { neuroSynapse, type NeuroSynapseOutput, type NeuroSynapseInput, type SubTask as PageSubTask, type ToolUsage as PageToolUsage, type EthicalCompliance as PageEthicalCompliance } from '@/ai/flows/neuro-synapse-flow'; 
import type { UserContext as NeuralInterfaceUserContext } from '@/ai/flows/interpret-user-intent-flow'; // Assuming this is for user context
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import NextImage from 'next/image'; 
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const NodeIcon: React.FC<{ type: NeuroSynapseOutput['workflowDiagramData']['nodes'][0]['type'], className?: string }> = ({ type, className = "w-6 h-6" }) => {
  switch (type) {
    case 'input': return <MessageSquare className={cn(className, "text-blue-500 dark:text-blue-400")} />;
    case 'image_input': return <ImageIcon className={cn(className, "text-teal-500 dark:text-teal-400")} />;
    case 'process': return <Brain className={cn(className, "text-purple-500 dark:text-purple-400")} />;
    case 'agent': return <Users className={cn(className, "text-green-500 dark:text-green-400")} />;
    case 'tool': return <Wrench className={cn(className, "text-orange-500 dark:text-orange-400")} />;
    case 'output': return <CheckCircle2 className={cn(className, "text-amber-500 dark:text-amber-400")} />;
    case 'decision': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className, "text-indigo-500 dark:text-indigo-400 lucide lucide-git-fork")}><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"/><path d="M12 12v3"/></svg>; 
    case 'fork': return <Share2 className={cn(className, "text-pink-500 dark:text-pink-400")} />;
    case 'join': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className, "text-cyan-500 dark:text-cyan-400 lucide lucide-git-merge")}><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>; 
    case 'llm_prompt': return <Edit3 className={cn(className, "text-lime-500 dark:text-lime-400")} />;
    case 'service_call': return <Server className={cn(className, "text-sky-500 dark:text-sky-400")} />;
    default: return <Activity className={cn(className, "text-gray-500 dark:text-gray-400")} />;
  }
};

const WorkflowDiagramNode: React.FC<{ node: NeuroSynapseOutput['workflowDiagramData']['nodes'][0], style: React.CSSProperties }> = ({ node, style }) => (
  <motion.div
    style={style}
    className="absolute transform transition-all duration-500 ease-out"
    initial={{ opacity: 0, scale: 0.5, ...style }}
    animate={{ opacity: 1, scale: 1, ...style }}
    exit={{ opacity: 0, scale: 0.5 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
  >
    <Card className="w-40 h-28 p-2.5 flex flex-col items-center justify-center text-center shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 border-primary/20 hover:border-accent/70 bg-card/90 backdrop-blur-sm group">
      <NodeIcon type={node.type} className="w-8 h-8 mb-1.5 transition-transform group-hover:scale-110" />
      <span className="text-xs font-semibold text-foreground/95 truncate w-full px-1 group-hover:text-accent transition-colors">{node.label}</span>
      <span className="text-[10px] text-muted-foreground group-hover:text-accent/80 transition-colors">({node.type})</span>
    </Card>
  </motion.div>
);

const WorkflowDiagramEdge: React.FC<{
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
  edge: NeuroSynapseOutput['workflowDiagramData']['edges'][0];
  delay: number;
}> = ({ sourcePos, targetPos, edge, delay }) => {
  const nodeWidth = 160; 
  const nodeHeight = 112; 

  const sx = sourcePos.x + nodeWidth / 2;
  const sy = sourcePos.y + nodeHeight / 2;
  const tx = targetPos.x + nodeWidth / 2;
  const ty = targetPos.y + nodeHeight / 2;
  
  const midX = (sx + tx) / 2;
  const midY = (sy + ty) / 2;

  const pathD = `M ${sx},${sy} L ${tx},${ty}`; // Straight line for simplicity, can be curved

  return (
    <>
    <motion.path
      key={edge.id}
      d={pathD}
      strokeWidth="2.5"
      markerEnd="url(#arrowhead)"
      className="stroke-primary/70 dark:stroke-primary/50"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.8 }}
      transition={{ duration: 1.2, delay: delay, ease: "circOut" }}
    />
    {edge.label && (
       <motion.text
          x={midX}
          y={midY - 5} // Offset slightly above the line
          textAnchor="middle"
          className="fill-muted-foreground text-[10px] font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: delay + 0.5, duration: 0.5 }}
        >
          {edge.label}
        </motion.text>
    )}
    </>
  );
};

const WorkflowDiagram: React.FC<{ data: NeuroSynapseOutput['workflowDiagramData'] | undefined }> = ({ data }) => {
    const nodePositions = useMemo(() => {
      if (!data || !data.nodes || !data.nodes.length) return {};
      const positions: { [key: string]: { x: number; y: number } } = {};
      const nodeWidth = 160;
      const nodeHeight = 112;
      const horizontalGap = 80;
      const verticalGap = 60;
      const diagramPadding = 40;

      // Simple layered layout (Sugiyama-style simplified)
      const graph: { [key: string]: string[] } = {};
      const inDegree: { [key: string]: number } = {};
      data.nodes.forEach(node => {
        graph[node.id] = [];
        inDegree[node.id] = 0;
      });
      data.edges.forEach(edge => {
        if (graph[edge.source] && data.nodes.find(n => n.id === edge.target)) {
           graph[edge.source].push(edge.target);
           inDegree[edge.target]++;
        }
      });

      const levels: string[][] = [];
      let queue = data.nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
      
      while (queue.length > 0) {
        levels.push([...queue]);
        const nextQueue: string[] = [];
        for (const u of queue) {
          for (const v of graph[u]) {
            inDegree[v]--;
            if (inDegree[v] === 0) {
              nextQueue.push(v);
            }
          }
        }
        queue = nextQueue;
      }
      
      // Handle cycles by placing remaining nodes
       if (data.nodes.length !== Object.values(positions).length) {
        data.nodes.forEach(node => {
          if (!levels.flat().includes(node.id)) {
            if (levels.length === 0) levels.push([]);
            levels[levels.length - 1].push(node.id); // Add to last level or a new one
          }
        });
      }


      let currentY = diagramPadding;
      levels.forEach((levelNodes, levelIndex) => {
        const levelWidth = levelNodes.length * (nodeWidth + horizontalGap) - horizontalGap;
        let currentX = diagramPadding + ( (levels.reduce((max, l) => Math.max(max, l.length), 0) * (nodeWidth + horizontalGap) - horizontalGap) - levelWidth) / 2; // Center level
        
        levelNodes.forEach(nodeId => {
          positions[nodeId] = { x: currentX, y: currentY };
          currentX += nodeWidth + horizontalGap;
        });
        currentY += nodeHeight + verticalGap;
      });
       // Fallback for any nodes missed by leveling (should ideally not happen with good graph data)
         data.nodes.forEach(node => { 
            if (!positions[node.id]) {
                positions[node.id] = { x: Math.random() * 600 + 50, y: Math.random() * 400 + 50 };
            }
        });

      return positions;
    }, [data]);

  if (!data || !data.nodes || !data.nodes.length || !data.edges) {
    return (
      <Card className="p-6 border rounded-lg bg-muted/30 text-center text-muted-foreground shadow-inner min-h-[450px] flex items-center justify-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-destructive/70" />
        <p className="text-lg font-medium">Workflow diagram data is missing or incomplete.</p>
        <p className="text-sm">The AI orchestration might not have generated the visual structure.</p>
      </Card>
    );
  }
  
  const allX = Object.values(nodePositions).map(p => p.x);
  const allY = Object.values(nodePositions).map(p => p.y);
  const minX = Math.min(0, ...allX);
  const minY = Math.min(0, ...allY);
  const maxX = Math.max(800, ...allX) + 160 + 50; 
  const maxY = Math.max(600, ...allY) + 112 + 50;


  return (
    <Card className="p-4 border-2 border-primary/20 rounded-xl bg-gradient-to-br from-card to-muted/10 shadow-2xl overflow-auto min-h-[650px] relative">
      <svg width={maxX - minX + 40} height={maxY - minY + 40} viewBox={`${minX - 20} ${minY - 20} ${maxX - minX + 40} ${maxY - minY + 40}`} className="min-w-full min-h-full">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 10 3.5, 0 7" className="fill-primary/80" />
          </marker>
           <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g className="edges" style={{filter: 'url(#glow)'}}>
          {data.edges.map((edge, index) => {
            const sourcePos = nodePositions[edge.source];
            const targetPos = nodePositions[edge.target];
            if (!sourcePos || !targetPos) return null;
            return <WorkflowDiagramEdge key={edge.id} sourcePos={sourcePos} targetPos={targetPos} edge={edge} delay={0.5 + index * 0.12} />;
          })}
        </g>
      </svg>
      <div className="nodes absolute top-0 left-0">
        {data.nodes.map(node => {
            const pos = nodePositions[node.id];
            if (!pos) return null; 
            return <WorkflowDiagramNode key={node.id} node={node} style={{ left: pos.x, top: pos.y }} />;
        })}
      </div>
    </Card>
  );
};


const SubTaskCard: React.FC<{ task: PageSubTask, index: number }> = ({ task, index }) => {
  let IconComponent: LucideIcon;
  let statusColorClass: string;
  let statusTextColor: string;
  let statusBgClass: string;

  switch (task.status?.toUpperCase()) { 
    case 'COMPLETED':
      IconComponent = CheckCircle2;
      statusColorClass = 'border-green-500 dark:border-green-400';
      statusTextColor = 'text-green-600 dark:text-green-300';
      statusBgClass = 'bg-green-500/10 dark:bg-green-500/15';
      break;
    case 'FAILED':
    case 'TIMED_OUT':
      IconComponent = AlertCircle;
      statusColorClass = 'border-red-500 dark:border-red-400';
      statusTextColor = 'text-red-600 dark:text-red-300';
      statusBgClass = 'bg-red-500/10 dark:bg-red-500/15';
      break;
    case 'PENDING':
    case 'SCHEDULED': 
      IconComponent = Lightbulb; 
      statusColorClass = 'border-blue-500 dark:border-blue-400';
      statusTextColor = 'text-blue-600 dark:text-blue-300';
      statusBgClass = 'bg-blue-500/10 dark:bg-blue-500/15';
      break;
    case 'ANALYZING_IMAGE':
    case 'GENERATING_IMAGE':
    case 'GENERATING_TEXT':
    case 'BROWSING_WEB':
    case 'GENERATING_CODE':
    case 'PROCESSING':
      IconComponent = Loader2; 
      statusColorClass = 'border-yellow-500 dark:border-yellow-400';
      statusTextColor = 'text-yellow-600 dark:text-yellow-300';
      statusBgClass = 'bg-yellow-500/10 dark:bg-yellow-500/15';
      break;
    case 'SKIPPED':
       IconComponent = TimerOff;
       statusColorClass = 'border-gray-400 dark:border-gray-500';
       statusTextColor = 'text-gray-600 dark:text-gray-400';
       statusBgClass = 'bg-gray-400/10 dark:bg-gray-400/15';
       break;
    default: 
      IconComponent = Activity; 
      statusColorClass = 'border-gray-400 dark:border-gray-500';
      statusTextColor = 'text-gray-600 dark:text-gray-400';
      statusBgClass = 'bg-gray-400/10 dark:bg-gray-400/15';
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "circOut" }}
    >
      <Card className={cn(`mb-3.5 shadow-lg transition-all hover:shadow-xl border-l-4 overflow-hidden`, statusColorClass, statusBgClass)}>
        <CardHeader className="p-4 flex flex-row items-start justify-between space-x-3.5">
            <div className="flex-shrink-0 pt-0.5">
                 <IconComponent className={cn(`w-6 h-6`, statusTextColor, task.status?.toUpperCase().includes('GENERATING') || task.status?.toUpperCase().includes('ANALYZING') || task.status?.toUpperCase().includes('PROCESSING') ? 'animate-spin' : '')} />
            </div>
            <div className="flex-grow">
                <CardTitle className="text-md font-semibold text-foreground">
                    {task.assignedAgent} <span className="text-xs text-muted-foreground font-mono">({task.id})</span>
                </CardTitle>
                <CardDescription className="text-sm pt-1 text-muted-foreground/90">{task.taskDescription}</CardDescription>
            </div>
            <Badge variant="outline" className={cn(`capitalize text-xs px-2.5 py-1 rounded-full font-medium border`, statusTextColor, statusColorClass, statusBgClass.replace('bg-', 'bg-opacity-50 dark:bg-opacity-50 bg-'))}>
              {task.status?.toLowerCase().replace(/_/g, ' ') || "Unknown"}
            </Badge>
        </CardHeader>
        {(task.resultSummary || task.outputData) && (
          <>
            <Separator className="my-0 bg-border/60"/>
            <CardContent className="p-4 pt-3 space-y-2">
                {task.resultSummary && task.resultSummary !== "Task details not available or task did not produce a summary." && <p className="text-sm text-muted-foreground"><strong className="font-medium text-foreground/85">Summary:</strong> {task.resultSummary}</p>}
                {task.outputData && (
                    <Accordion type="single" collapsible className="w-full -mx-1">
                        <AccordionItem value="output" className="border-none">
                            <AccordionTrigger className="text-xs font-medium hover:no-underline text-muted-foreground/80 py-1.5 px-1">View Raw Output Data</AccordionTrigger>
                            <AccordionContent>
                                <ScrollArea className="max-h-40">
                                    <pre className="text-xs bg-background/50 p-2.5 rounded-md border whitespace-pre-wrap break-all">{JSON.stringify(task.outputData, null, 2)}</pre>
                                </ScrollArea>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
            </CardContent>
          </>
        )}
      </Card>
    </motion.div>
  );
};

const ToolUsageDisplay: React.FC<{ toolUsage: PageToolUsage, index: number }> = ({ toolUsage, index }) => {
  if (!toolUsage) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
    >
    <AccordionItem value={`tool-${index}`} className="border-b border-border/40 last:border-b-0">
      <AccordionTrigger className="hover:no-underline text-md font-medium py-3.5 px-1.5 text-left group hover:bg-accent/5 rounded-md transition-colors">
        <div className="flex items-center gap-3">
          <Wrench className="w-5 h-5 text-orange-500 dark:text-orange-400 transition-transform group-hover:rotate-12" />
          Tool Used: <span className="font-semibold text-accent">{toolUsage.toolName}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2.5 pb-4 px-1.5 space-y-3.5 text-sm bg-muted/30 dark:bg-muted/20 rounded-b-md">
        <div>
          <h4 className="font-semibold text-foreground/95 mb-1.5 text-xs uppercase tracking-wider">Input:</h4>
          <ScrollArea className="max-h-36">
            <pre className="p-3 bg-background/70 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-all shadow-inner border border-border/50">
              {toolUsage.toolInput ? JSON.stringify(toolUsage.toolInput, null, 2) : 'No input provided'}
            </pre>
          </ScrollArea>
        </div>
        <div>
          <h4 className="font-semibold text-foreground/95 mb-1.5 text-xs uppercase tracking-wider">Output:</h4>
          <ScrollArea className="max-h-52">
            <pre className="p-3 bg-background/70 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-all shadow-inner border border-border/50">
              {toolUsage.toolOutput ? JSON.stringify(toolUsage.toolOutput, null, 2) : 'No output received'}
            </pre>
          </ScrollArea>
        </div>
      </AccordionContent>
    </AccordionItem>
    </motion.div>
  );
};

const AgentActivityLogDisplay: React.FC<{ log: string, index: number }> = ({ log, index }) => (
  <motion.li
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
    className="text-sm text-muted-foreground py-1.5 px-2.5 border-l-2 border-primary/40 bg-primary/5 rounded-r-md"
  >
    <span className="font-mono text-xs text-primary/70 mr-1.5">{`[${index+1}]`}</span> {log}
  </motion.li>
);


export default function NeuroSynapsePage() {
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState("Initializing Neuro Synapse...");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NeuroSynapseOutput | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();

  const [isMagicMode, setIsMagicMode] = useState(false);
  const [userActivityContext, setUserActivityContext] = useState<NeuralInterfaceUserContext | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'undefined') {
      (window as any).ResizeObserver = class ResizeObserver { observe() {} unobserve() {} disconnect() {} };
    }

    const queryPrompt = searchParams.get('prompt');
    if (queryPrompt) {
      setPrompt(queryPrompt);
    } else {
      setPrompt("Develop a comprehensive marketing strategy for launching a new eco-friendly coffee brand, targeting millennial and Gen Z consumers. Include online and offline tactics, and suggest 3 key performance indicators. Consider potential ethical challenges.");
    }
    setUserActivityContext({
        recentSearches: ["sustainable brands marketing", "Gen Z coffee trends", "ethical advertising"],
        visitedPages: ["/idea-catalyst", "/ai-image-generation", "/revenue-model"],
        currentFocus: "Marketing and Brand Strategy",
        preferredTone: "casual"
    });
  }, [searchParams]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { 
        toast({ title: "Image Too Large", description: "Please select an image smaller than 5MB.", variant: "destructive" });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setPreviewImage(null);
    }
  };

  const handleMagicModeSuggest = async () => {
    if (!userActivityContext) {
        toast({ title: "Magic Mode Unavailable", description: "User activity context is not available for suggestions.", variant: "default" });
        setIsMagicMode(false);
        return;
    }
    setIsLoading(true);
    setCurrentLoadingMessage("Channeling your thoughts... Crafting a Mind Prompt...");
    setError(null);
    try {
        // Simulate calling interpretUserIntent or catalyzeIdea for prompt suggestion
        const suggestedPrompt = `Based on your focus on '${userActivityContext.currentFocus}', explore how recent advancements in AI could revolutionize this area. Consider ethical implications and suggest 3 innovative applications.`;
        setPrompt(suggestedPrompt);
        toast({title: "Mind Prompt Activated!", description: "NeuroVichar analyzed your activity to suggest this challenge.", className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white"});
    } catch (e: any) {
        const errorMessage = e instanceof Error ? e.message : "Failed to generate magic suggestion.";
        setError(errorMessage);
        toast({ title: "Magic Mode Error", description: errorMessage, variant: "destructive"});
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null); 
    setCurrentLoadingMessage("Initializing Neuro Synapse cognitive orchestration...");
    
    try {
      if (!prompt.trim() && !isMagicMode) { // Allow empty prompt if magic mode will generate one
        setError('Please enter a prompt for Neuro Synapse or activate Mind Prompt.');
        setIsLoading(false);
        return;
      }
      
      let imageDataUri: string | undefined = previewImage || undefined;
      
      const loadingMessages = [
          "Dispatching prompt to Analyzer Agent for deconstruction...",
          "Planner Agent is formulating a multi-agent execution strategy...",
          "Cognitive tasks are being assigned to specialized Executor Agents...",
          "AI agents are processing data streams...",
          "Ethical Compliance Matrix is being cross-referenced...",
          "Cross-agent debate and consensus simulation in progress (simulated)...",
          "Synthesizing diverse insights into a unified response...",
          "Finalizing the comprehensive Neuro Synapse output matrix..."
      ];
      let msgIndex = 0;
      const msgInterval = setInterval(() => {
          setCurrentLoadingMessage(loadingMessages[msgIndex % loadingMessages.length]);
          msgIndex++;
      }, 2500); 

      const synapseInput: NeuroSynapseInput = { 
        mainPrompt: prompt, 
        imageDataUri, 
        userContext: isMagicMode ? userActivityContext : undefined,
        isMagicMode: isMagicMode && !prompt.trim() // Only true magic mode if prompt is empty
      };
      const response = await neuroSynapse(synapseInput);
      
      clearInterval(msgInterval); 

      if(!response || !response.synthesizedAnswer){
        console.error("Incomplete response from Neuro Synapse flow:", response);
        throw new Error("Neuro Synapse returned an incomplete or invalid response structure. Orchestration might have failed.");
      }
      setResult(response);
      const hasFailedTasks = response.decomposedTasks.some(task => task.status === "FAILED");
      if (hasFailedTasks) {
        const failureReason = response.workflowExplanation || response.synthesizedAnswer || "One or more tasks failed during orchestration.";
        setError(failureReason);
        toast({ title: "Orchestration Issue", description: failureReason.substring(0,120) + "...", variant: "destructive" });
      } else {
        toast({ title: "Neuro Synapse Complete!", description: `Workflow processed. Output generated.`, className: "bg-green-500/80 text-white dark:bg-green-600/80 backdrop-blur-md border-green-700" });
      }

    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : String(e.message || e);
      setError(errorMessage || 'An unexpected error occurred with Neuro Synapse orchestration.');
      console.error("Neuro Synapse page error details:", e);
      toast({
        title: "Synapse Orchestration Error",
        description: errorMessage.length > 100 ? errorMessage.substring(0,97) + "..." : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Keep magic mode active if it was, user can turn it off
      // setIsMagicMode(false); 
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex items-center space-x-6">
        <motion.div initial={{ scale: 0.5, opacity: 0, rotate: -45 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.1 }} className="p-2 bg-accent/10 rounded-full shadow-lg">
          <Brain className="w-16 h-16 text-accent drop-shadow-lg" />
        </motion.div>
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-pink-500 animate-gradient-x">
            Neuro Synapse
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="text-xl text-muted-foreground mt-2 max-w-3xl">
            Cognitive AI Orchestrator: Deconstructs complex challenges, delegates to specialized AI agents, simulates collaborative reasoning, and synthesizes comprehensive solutions with full transparency.
          </motion.p>
        </div>
      </header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Card className="shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 bg-card/85 backdrop-blur-md border-primary/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-semibold text-foreground/95">Engage Neuro Synapse</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Enter a complex prompt. Optionally upload an image or try the experimental "Mind Prompt" (Magic Mode) for AI-suggested tasks based on your activity.
                </CardDescription>
              </div>
              <Button 
                variant={isMagicMode ? "default" : "outline"} 
                onClick={() => { 
                    if(isMagicMode) { setIsMagicMode(false); setPrompt(''); } 
                    else { setIsMagicMode(true); handleMagicModeSuggest(); }
                }} 
                disabled={isLoading} 
                className={cn(
                    "bg-gradient-to-r text-white hover:shadow-xl transition-all transform hover:scale-105 active:scale-95",
                    isMagicMode 
                        ? "from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 ring-2 ring-offset-2 ring-purple-500" 
                        : "from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 border border-input"
                )}
              >
                <Wand2 className={cn("mr-2 h-5 w-5", isMagicMode && "animate-pulse text-yellow-300")} /> {isMagicMode ? "Mind Prompt Active" : "Activate Mind Prompt"}
              </Button>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="neuro-prompt-input" className="text-md font-medium text-foreground/80">Your Complex Prompt {isMagicMode && <span className="text-xs text-purple-400">(Mind Prompt Suggested)</span>}</Label>
                <Input id="neuro-prompt-input" placeholder="e.g., 'Analyze the future of AI in healthcare...'" value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={isLoading} required className="text-lg p-4 h-14 bg-background/60 focus:bg-background focus:ring-accent focus:border-accent text-foreground/90 placeholder-muted-foreground/70 rounded-lg shadow-inner" aria-label="Complex Prompt for Neuro Synapse" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-input" className="text-md font-medium text-foreground/80">Optional Image Context (Max 5MB)</Label>
                <div className="flex items-center gap-4">
                    <Input id="image-input" type="file" accept="image/png, image/jpeg, image/webp, image/gif" onChange={handleImageChange} disabled={isLoading} className="text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer file:cursor-pointer h-12" aria-label="Optional image input for Neuro Synapse" />
                    {previewImage && <Button type="button" variant="outline" size="sm" onClick={() => {setSelectedImage(null); setPreviewImage(null); (document.getElementById('image-input') as HTMLInputElement).value = '';}}> Clear Image </Button>}
                </div>
                {previewImage && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-3 border-2 border-dashed border-accent/30 rounded-lg bg-muted/50 inline-block shadow-md"> <NextImage src={previewImage} alt="Selected image preview" width={120} height={120} className="rounded-md object-contain max-h-[120px]" /> </motion.div>}
              </div>
              {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}> <Alert variant="destructive" className="shadow-lg border-red-500/50"> <AlertCircle className="h-5 w-5 text-red-500" /> <AlertTitle className="font-semibold text-red-500">Processing Error</AlertTitle> <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription> </Alert> </motion.div>}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} size="lg" className="text-lg px-10 py-7 w-full sm:w-auto shadow-lg hover:shadow-accent/30 transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground">
                {isLoading ? <><Loader2 className="mr-2.5 h-6 w-6 animate-spin" /> Orchestrating...</> : <><Zap className="mr-2.5 h-6 w-6" /> Activate Synapse</>}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      <AnimatePresence>
        {isLoading && (
           <motion.div 
            key="loading-indicator-ns" 
            initial={{ opacity: 0, height: 0, y: 20 }} 
            animate={{ opacity: 1, height: 'auto', y: 0 }} 
            exit={{ opacity: 0, height: 0, y: -20, transition: { duration: 0.3 } }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
            className="space-y-6 mt-10"
          >
            <Card className="shadow-xl bg-card/85 backdrop-blur-sm border-primary/20">
              <CardHeader className="pb-5">
                <CardTitle className="flex items-center text-2xl font-semibold text-foreground/90">
                  <Loader2 className="mr-3 h-7 w-7 animate-spin text-accent" />
                  {currentLoadingMessage}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground pt-1">
                  Neuro Synapse is orchestrating AI agents. This may take a few moments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-6 pt-3">
                {[...Array(3)].map((_, i) => ( <div key={i} className={cn("space-y-3 p-4 rounded-lg bg-muted/60 animate-pulse shadow-inner border border-border/40", i === 0 && "opacity-90", i === 1 && "opacity-70", i === 2 && "opacity-50")}> <div className="h-6 bg-muted rounded w-1/3"></div> <div className="h-4 bg-muted rounded w-4/5"></div> <div className="h-4 bg-muted rounded w-2/3"></div> </div> ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
      {result && !isLoading && (
        <motion.div key="result-section-ns" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30, transition: { duration: 0.3 } }} transition={{ duration: 0.6, ease: "circOut", delay: 0.1 }} className="space-y-10 mt-12">
          <Card className="shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-accent/40 overflow-hidden">
            <CardHeader className="pb-5 border-b border-border/60 bg-gradient-to-br from-card to-muted/20 p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }} className="p-2 bg-accent/15 rounded-full shadow-md"> <Brain className="w-10 h-10 text-accent drop-shadow-md" /> </motion.div>
                    <div>
                        <CardTitle className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-pink-500"> Neuro Synapse Output </CardTitle>
                         <CardDescription className="text-base mt-1.5 text-muted-foreground">Status: <Badge variant={result.decomposedTasks.some(t=>t.status==='FAILED') ? "destructive" : "default"} className={cn(result.decomposedTasks.some(t=>t.status==='FAILED') ? "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300" : "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300", "shadow-sm")}>{result.decomposedTasks.some(t=>t.status==='FAILED') ? "Completed with errors" : "Completed Successfully"}</Badge> </CardDescription>
                    </div>
                </div>
                {result.hasImageContext && <Badge variant="outline" className="text-sm border-teal-500 text-teal-600 dark:text-teal-300 bg-teal-500/10 py-1.5 px-3.5 flex items-center gap-2 shadow-sm"> <ImageIcon className="w-4 h-4" /> Image Context Used </Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-10 pt-8 p-6 md:p-8">
              <motion.section initial={{opacity:0, y:15}} animate={{opacity:1,y:0}} transition={{delay:0.15, duration:0.5, ease:"easeOut"}}>
                <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center gap-2"><MessageSquare className="w-6 h-6 text-primary"/>Original Prompt:</h3>
                <blockquote className="text-md text-muted-foreground p-4 bg-muted/50 rounded-lg border-l-4 border-primary italic shadow-md"> {result.originalPrompt} </blockquote>
              </motion.section>
              <Separator className="bg-border/70" />
              <motion.section initial={{opacity:0, y:15}} animate={{opacity:1,y:0}} transition={{delay:0.25, duration:0.5, ease:"easeOut"}}>
                <h3 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-3"> <Lightbulb className="w-8 h-8 text-amber-500 dark:text-amber-400" /> Synthesized Answer: </h3>
                <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 dark:from-primary/10 dark:via-accent/10 dark:to-primary/15 border-2 border-primary/30 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6"> <div className="text-foreground/95 leading-relaxed text-md prose prose-base dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.synthesizedAnswer.replace(/\n/g, '<br />') }} /> </CardContent>
                </Card>
              </motion.section>
              <Separator className="bg-border/70" />
              <motion.section initial={{opacity:0, y:15}} animate={{opacity:1,y:0}} transition={{delay:0.3, duration:0.5, ease:"easeOut"}}>
                <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-3"> <ShieldCheck className="w-7 h-7 text-green-500 dark:text-green-400" /> Ethical Compliance Check </h3>
                <Card className={cn("border-l-4 shadow-md", result.ethicalCompliance.isCompliant ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10")}>
                    <CardContent className="p-5 space-y-2.5">
                        <p><strong>Status:</strong> <span className={cn(result.ethicalCompliance.isCompliant ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300", "font-semibold")}>{result.ethicalCompliance.isCompliant ? "Compliant" : "Non-Compliant"}</span></p>
                        {result.ethicalCompliance.issuesFound && result.ethicalCompliance.issuesFound.length > 0 && ( <div> <strong>Issues Found:</strong> <ul className="list-disc list-inside ml-4 text-sm text-muted-foreground"> {result.ethicalCompliance.issuesFound.map((issue, idx) => <li key={idx}>{issue}</li>)} </ul> </div> )}
                        {result.ethicalCompliance.remediationSuggestions && result.ethicalCompliance.remediationSuggestions.length > 0 && ( <div> <strong>Remediation Suggestions:</strong> <ul className="list-disc list-inside ml-4 text-sm text-muted-foreground"> {result.ethicalCompliance.remediationSuggestions.map((sug, idx) => <li key={idx}>{sug}</li>)} </ul> </div> )}
                        {result.ethicalCompliance.confidenceScore && <p className="text-xs text-muted-foreground">Confidence: {(result.ethicalCompliance.confidenceScore * 100).toFixed(0)}%</p>}
                    </CardContent>
                </Card>
              </motion.section>
              {(result.toolUsages && result.toolUsages.length > 0) && ( <> <Separator className="bg-border/70" /> <motion.section initial={{opacity:0, y:15}} animate={{opacity:1,y:0}} transition={{delay:0.35, duration:0.5, ease:"easeOut"}}> <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-3"> <Wrench className="w-7 h-7 text-orange-500 dark:text-orange-400" /> Tool Usage Details </h3> <Accordion type="single" collapsible className="w-full bg-muted/30 dark:bg-muted/25 rounded-xl p-1.5 shadow-lg border border-border/50"> {result.toolUsages.map((toolUsage, index) => ( <ToolUsageDisplay key={`tool-${index}`} toolUsage={toolUsage} index={index} /> ))} </Accordion> </motion.section> </> )}
              <Separator className="bg-border/70" />
              <div className="grid md:grid-cols-2 gap-10 items-start">
                <motion.section className="space-y-5" initial={{opacity:0, x:-25}} animate={{opacity:1,x:0}} transition={{delay:0.45, duration:0.5, ease:"easeOut"}}>
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-3"> <FileText className="w-7 h-7 text-blue-500 dark:text-blue-400" /> Agent Activity Log </h3>
                   <ScrollArea className="h-[450px] pr-3.5 -mr-1.5 border p-4 rounded-xl bg-muted/30 dark:bg-muted/20 shadow-xl">
                    {(result.agentActivityLog && result.agentActivityLog.length > 0) ? (
                       <ul className="space-y-2.5">
                          {result.agentActivityLog.map((logEntry, index) => ( <AgentActivityLogDisplay key={`log-${index}`} log={logEntry} index={index} /> ))}
                       </ul>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No detailed agent activity log available.</p>
                    )}
                  </ScrollArea>
                </motion.section>
                <motion.section className="space-y-5" initial={{opacity:0, x:25}} animate={{opacity:1,x:0}} transition={{delay:0.5, duration:0.5, ease:"easeOut"}}>
                   <h3 className="text-xl font-semibold text-foreground flex items-center gap-3"> <Workflow className="w-7 h-7 text-purple-500 dark:text-purple-400" /> Workflow Explanation </h3>
                  <Card className="bg-muted/40 dark:bg-muted/25 shadow-xl hover:shadow-2xl transition-shadow">
                    <CardContent className="p-5 text-md text-muted-foreground/95 leading-relaxed"> <ScrollArea className="h-[410px] pr-2.5"> <div className="prose prose-base dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.workflowExplanation.replace(/\n/g, '<br />') }} /> </ScrollArea> </CardContent>
                  </Card>
                </motion.section>
              </div>
               <Separator className="bg-border/70" />
              <motion.section initial={{opacity:0, y:15}} animate={{opacity:1,y:0}} transition={{delay:0.55, duration:0.5, ease:"easeOut"}}>
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-3"> <Users className="w-7 h-7 text-green-500 dark:text-green-400" /> Decomposed Task Statuses </h3>
                   <ScrollArea className="h-[450px] pr-3.5 -mr-1.5 border p-4 rounded-xl bg-muted/30 dark:bg-muted/20 shadow-xl mt-4">
                    {result.decomposedTasks.map((task, index) => ( <SubTaskCard key={task.id || `task-${index}`} task={task} index={index} /> ))}
                  </ScrollArea>
              </motion.section>
              <Separator className="bg-border/70" />
              <motion.section initial={{opacity:0, y:15}} animate={{opacity:1,y:0}} transition={{delay:0.6, duration:0.5, ease:"easeOut"}}>
                <h3 className="text-2xl font-bold mb-5 text-foreground flex items-center gap-3"> <SlidersHorizontal className="w-8 h-8 text-blue-500 dark:text-blue-400" /> Visual Workflow Diagram </h3>
                <WorkflowDiagram data={result.workflowDiagramData} />
              </motion.section>
            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: (result && !isLoading) ? 0.7 : 0.5 }}>
      <Card className="mt-16 bg-card/85 backdrop-blur-lg shadow-2xl border-primary/15">
        <CardHeader className="pb-4"> <CardTitle className="text-2xl md:text-3xl font-semibold text-foreground/95 flex items-center gap-3"> <BrainCircuit className="w-8 h-8 text-primary"/>About Neuro Synapse (Simulated Orchestration)</CardTitle> </CardHeader>
        <CardContent className="space-y-5">
            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 text-muted-foreground text-base leading-relaxed prose prose-base dark:prose-invert max-w-none">
                    <p>Neuro Synapse, in this demonstration, showcases a cognitively inspired AI orchestration process. When you submit a prompt, Neuro Synapse initiates a simulated workflow using Genkit and LLMs:</p>
                    <ol className="list-decimal list-outside ml-5 space-y-2">
                        <li>
                            <strong>Prompt Analysis &amp; Planning:</strong> An LLM analyzes your prompt (and image/user context if provided) to deconstruct it into logical sub-tasks and devise a high-level plan.
                        </li>
                        <li>
                            <strong>Simulated Agent Execution:</strong> Each sub-task is "assigned" to a conceptual agent type (e.g., TextGenerator, ImageGenerator, WebBrowser). For this demo, these agents are simulated by:
                            <ul className="list-disc list-inside ml-4 my-2">
                                <li>Invoking specific Genkit flows (like `generateImage` or `summarizeWebPage`).</li>
                                <li>Calling dedicated Genkit prompts for tasks like text generation, code generation, or image analysis.</li>
                                <li>Utilizing services like `browseWebPage` for web content.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Ethical Review:</strong> Another LLM prompt reviews the generated content and original prompt for ethical compliance.
                        </li>
                        <li>
                            <strong>Result Synthesis:</strong> A final LLM prompt takes all outputs, the ethical review, and the original request to compile a comprehensive, synthesized answer and an explanation of the simulated workflow.
                        </li>
                    </ol>
                    <p>The dashboard visualizes this simulated orchestration, providing transparency into the AI's "thought process." The "Mind Prompt" feature further enhances this by suggesting tasks based on your (simulated) digital footprint.</p>
                </div>
                <motion.div className="flex-shrink-0 w-full md:w-1/3" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{delay:0.2, duration:0.5}}>
                    <NextImage src="https://picsum.photos/seed/aiOrchestration/400/350" alt="AI Orchestration Conceptual Art" width={400} height={350} className="rounded-xl shadow-2xl object-cover border-2 border-accent/30" data-ai-hint="abstract ai" />
                </motion.div>
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            {[ { icon: <SearchCode className="w-7 h-7 text-accent" />, title: "Contextual Prompt Analysis", description: "AI deconstructs prompts, considering user activity for relevance." }, { icon: <Share2 className="w-7 h-7 text-accent" />, title: "Simulated Dynamic Orchestration", description: "Genkit flows and LLMs manage a multi-step reasoning process." }, { icon: <Users className="w-7 h-7 text-accent" />, title: "Conceptual Agent Execution", description: "Specialized Genkit prompts and flows act as AI agents." }, { icon: <Wand2 className="w-7 h-7 text-accent" />, title: "Mind Prompt Suggestions", description: "AI suggests tasks based on user's digital footprint and app behavior." }, { icon: <ShieldCheck className="w-7 h-7 text-accent" />, title: "Ethical Filtering", description: "Ensures outputs align with safety guidelines via LLM review." }, { icon: <Workflow className="w-7 h-7 text-accent" />, title: "Transparent Reasoning", description: "Visualizes workflow, agent activity, and tool usage for clarity." }, ].map((item, idx) => ( <motion.div key={item.title} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.3 + idx*0.05, duration:0.4}} className="p-4 bg-muted/40 dark:bg-muted/30 rounded-lg shadow-md border border-border/50"> <div className="flex items-center gap-3 mb-2"> {item.icon} <h4 className="text-md font-semibold text-foreground">{item.title}</h4> </div> <p className="text-xs text-muted-foreground">{item.description}</p> </motion.div> ))}
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}

