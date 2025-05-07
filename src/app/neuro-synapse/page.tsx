'use client';

import { useState, type FormEvent, useEffect, useMemo, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Zap, Loader2, Workflow, MessageSquare, Activity, CheckCircle2, AlertCircle, Newspaper, Wrench, Lightbulb, Users, ThermometerSnowflake, ImageUp, Image as ImageIcon, Share2, SearchCode, SlidersHorizontal, BrainCircuit, TimerOff, XCircle, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { neuroSynapse, type NeuroSynapseOutput, type SubTask, type ToolUsage } from '@/ai/flows/neuro-synapse-flow';
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
  edgeId: string;
  delay: number;
}> = ({ sourcePos, targetPos, edgeId, delay }) => {
  const nodeWidth = 160; // w-40
  const nodeHeight = 112; // h-28

  const sx = sourcePos.x + nodeWidth / 2;
  const sy = sourcePos.y + nodeHeight / 2;
  const tx = targetPos.x + nodeWidth / 2;
  const ty = targetPos.y + nodeHeight / 2;
  
  const c1x = sx + (tx - sx) * 0.25 + (Math.random() - 0.5) * 30; 
  const c1y = sy + (ty - sy) * 0.25 + (Math.random() - 0.5) * 30;
  const c2x = sx + (tx - sx) * 0.75 + (Math.random() - 0.5) * 30;
  const c2y = sy + (ty - sy) * 0.75 + (Math.random() - 0.5) * 30;
  
  const pathD = `M ${sx},${sy} C ${c1x},${c1y} ${c2x},${c2y} ${tx},${ty}`;

  return (
    <motion.path
      key={edgeId}
      d={pathD}
      strokeWidth="2.5"
      markerEnd="url(#arrowhead)"
      className="stroke-primary/70 dark:stroke-primary/50"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.8 }}
      transition={{ duration: 1.2, delay: delay, ease: "circOut" }}
    />
  );
};


const WorkflowDiagram: React.FC<{ data: NeuroSynapseOutput['workflowDiagramData'] | undefined }> = ({ data }) => {
    const nodePositions = useMemo(() => {
        if (!data || !data.nodes || !data.nodes.length) return {};

        const positions: { [key: string]: { x: number; y: number } } = {};
        const G: { [key: string]: { incomers: string[]; outgoers: string[] } } = {};
        data.nodes.forEach(node => {
            G[node.id] = { incomers: [], outgoers: [] };
        });
        data.edges.forEach(edge => {
            if (G[edge.source] && G[edge.target]) {
                G[edge.source].outgoers.push(edge.target);
                G[edge.target].incomers.push(edge.source);
            }
        });

        const levels: { [key: number]: string[] } = {};
        let queue = data.nodes.filter(node => G[node.id]?.incomers.length === 0).map(node => node.id);
        let level = 0;

        const visited = new Set<string>();
        while (queue.length > 0 && level < data.nodes.length) { 
            levels[level] = [];
            const nextQueue: string[] = [];
            for (const u of queue) {
                if (visited.has(u)) continue;
                visited.add(u);
                levels[level].push(u);
                (G[u]?.outgoers || []).forEach(v => {
                    if (!visited.has(v)) {
                        const allIncomersProcessed = G[v]?.incomers.every(inc => visited.has(inc) || queue.includes(inc));
                        if (allIncomersProcessed && !nextQueue.includes(v)) {
                             nextQueue.push(v);
                        }
                    }
                });
            }
            queue = nextQueue.filter(n => !visited.has(n));
            if (levels[level].length === 0 && queue.length > 0) { 
                queue.forEach(n => { 
                    if(!visited.has(n)) {
                        levels[level].push(n);
                        visited.add(n);
                    }
                });
                queue = []; 
            }
            level++;
        }
        
        const lastLevel = Object.keys(levels).length;
        data.nodes.forEach(node => {
            if (!visited.has(node.id)) {
                if (!levels[lastLevel]) levels[lastLevel] = [];
                levels[lastLevel].push(node.id);
                visited.add(node.id);
            }
        });


        const nodeWidth = 160; 
        const nodeHeight = 112; 
        const horizontalGap = 100; 
        const verticalGap = 70; 
        const diagramPadding = 50;

        let maxNodesInLevel = 0;
        Object.values(levels).forEach(nodesInLevel => {
            if (nodesInLevel.length > maxNodesInLevel) {
                maxNodesInLevel = nodesInLevel.length;
            }
        });
        const diagramHeight = maxNodesInLevel * (nodeHeight + verticalGap) - verticalGap + 2 * diagramPadding;


        Object.entries(levels).forEach(([lvlStr, nodesInLevel]) => {
            const currentLevel = parseInt(lvlStr);
            const levelNodeCount = nodesInLevel.length;
            nodesInLevel.forEach((nodeId, index) => {
                const posX = diagramPadding + currentLevel * (nodeWidth + horizontalGap);
                const levelHeightForNodes = (levelNodeCount * (nodeHeight + verticalGap) - verticalGap);
                const startY = (diagramHeight - levelHeightForNodes) / 2;
                const posY = diagramPadding + startY + index * (nodeHeight + verticalGap);
                positions[nodeId] = { x: posX, y: posY };
            });
        });
        
        data.nodes.forEach(node => {
            if (!positions[node.id]) {
                console.warn("Node not positioned by layout algorithm:", node.id);
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
        <p className="text-sm">The AI might not have generated the necessary structure for visualization.</p>
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
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="8" 
            refY="3.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
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
            if (!sourcePos || !targetPos) {
                console.warn(`Edge ${edge.id} has missing source/target node positions. Source: ${edge.source}, Target: ${edge.target}`);
                return null;
            }
            return <WorkflowDiagramEdge key={edge.id} sourcePos={sourcePos} targetPos={targetPos} edgeId={edge.id} delay={0.5 + index * 0.12} />;
          })}
        </g>
      </svg>
      <div className="nodes absolute top-0 left-0">
        {data.nodes.map(node => {
            const pos = nodePositions[node.id];
            if (!pos) {
                 console.warn(`Node ${node.id} has no position calculated.`);
                 return null;
            }
            return <WorkflowDiagramNode key={node.id} node={node} style={{ left: pos.x, top: pos.y }} />;
        })}
      </div>
    </Card>
  );
};


const SubTaskCard: React.FC<{ task: SubTask, index: number }> = ({ task, index }) => {
  let IconComponent: LucideIcon;
  let statusColorClass: string;
  let statusTextColor: string;
  let statusBgClass: string;

  switch (task.status.toUpperCase()) { 
    case 'SIMULATED_COMPLETE':
    case 'COMPLETED': // Maintain backward compatibility if old statuses appear
      IconComponent = CheckCircle2;
      statusColorClass = 'border-green-500 dark:border-green-400';
      statusTextColor = 'text-green-600 dark:text-green-300';
      statusBgClass = 'bg-green-500/10 dark:bg-green-500/15';
      break;
    case 'SIMULATED_FAILED':
    case 'FAILED': // Maintain backward compatibility
      IconComponent = AlertCircle;
      statusColorClass = 'border-red-500 dark:border-red-400';
      statusTextColor = 'text-red-600 dark:text-red-300';
      statusBgClass = 'bg-red-500/10 dark:bg-red-500/15';
      break;
    case 'PLANNED':
    case 'PENDING': // Maintain backward compatibility
      IconComponent = Lightbulb; // Icon for planned/pending
      statusColorClass = 'border-blue-500 dark:border-blue-400';
      statusTextColor = 'text-blue-600 dark:text-blue-300';
      statusBgClass = 'bg-blue-500/10 dark:bg-blue-500/15';
      break;
    case 'ETHICAL_REVIEW_PENDING':
       IconComponent = ShieldCheck;
       statusColorClass = 'border-yellow-500 dark:border-yellow-400';
       statusTextColor = 'text-yellow-600 dark:text-yellow-300';
       statusBgClass = 'bg-yellow-500/10 dark:bg-yellow-500/15';
       break;
    default: 
      IconComponent = ThermometerSnowflake; 
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
                 <IconComponent className={cn(`w-6 h-6`, statusTextColor, task.status.toUpperCase() === 'PROCESSING' ? 'animate-spin' : '')} />
            </div>
            <div className="flex-grow">
                <CardTitle className="text-md font-semibold text-foreground">
                    {task.assignedAgent} <span className="text-xs text-muted-foreground font-mono">({task.id})</span>
                </CardTitle>
                <CardDescription className="text-sm pt-1 text-muted-foreground/90">{task.taskDescription}</CardDescription>
            </div>
            <Badge variant="outline" className={cn(`capitalize text-xs px-2.5 py-1 rounded-full font-medium border`, statusTextColor, statusColorClass, statusBgClass.replace('bg-', 'bg-opacity-50 dark:bg-opacity-50 bg-'))}>
              {task.status.toLowerCase().replace(/_/g, ' ')}
            </Badge>
        </CardHeader>
        {task.resultSummary && (
          <>
            <Separator className="my-0 bg-border/60"/>
            <CardContent className="p-4 pt-3">
                <p className="text-sm text-muted-foreground"><strong className="font-medium text-foreground/85">Result:</strong> {task.resultSummary}</p>
            </CardContent>
          </>
        )}
      </Card>
    </motion.div>
  );
};

const ToolUsageDisplay: React.FC<{ toolUsage: ToolUsage, index: number }> = ({ toolUsage, index }) => {
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
              {JSON.stringify(toolUsage.toolInput, null, 2) || 'No input provided'}
            </pre>
          </ScrollArea>
        </div>
        <div>
          <h4 className="font-semibold text-foreground/95 mb-1.5 text-xs uppercase tracking-wider">Output:</h4>
          <ScrollArea className="max-h-52">
            <pre className="p-3 bg-background/70 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-all shadow-inner border border-border/50">
              {JSON.stringify(toolUsage.toolOutput, null, 2) || 'No output received'}
            </pre>
          </ScrollArea>
        </div>
      </AccordionContent>
    </AccordionItem>
    </motion.div>
  );
};


export default function NeuroSynapsePage() {
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NeuroSynapseOutput | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();


  useEffect(() => {
    const queryPrompt = searchParams.get('prompt');
    if (queryPrompt) {
      setPrompt(queryPrompt);
    } else {
      setPrompt("Analyze the impact of decentralized autonomous organizations (DAOs) on traditional corporate structures, including potential benefits, challenges, and recent news headlines related to DAO governance models.");
    }
  }, [searchParams]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { 
        toast({
          title: "Image Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (!prompt.trim()) {
        setError('Please enter a prompt for Neuro Synapse.');
        setIsLoading(false);
        return;
      }
      
      let imageDataUri: string | undefined = undefined;
      if (selectedImage && previewImage) {
        imageDataUri = previewImage; 
      }

      const response = await neuroSynapse({ mainPrompt: prompt, imageDataUri });
      if(!response || !response.workflowDiagramData || !response.decomposedTasks || !response.synthesizedAnswer){
        console.error("Incomplete response from Neuro Synapse:", response);
        throw new Error("Neuro Synapse returned an incomplete or invalid response structure.");
      }
      setResult(response);
    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : String(e.message || e);
      setError(errorMessage || 'An unexpected error occurred with Neuro Synapse.');
      console.error("Neuro Synapse error details:", e);
      toast({
        title: "Synapse AI Error",
        description: errorMessage.length > 100 ? errorMessage.substring(0,97) + "..." : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex items-center space-x-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.1 }}
          className="p-2 bg-accent/10 rounded-full shadow-lg"
        >
          <Brain className="w-16 h-16 text-accent drop-shadow-lg" />
        </motion.div>
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-pink-500 animate-gradient-x"
          >
            Neuro Synapse
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl text-muted-foreground mt-2 max-w-3xl"
          >
            Your AI-powered orchestrator. Decompose complex challenges, simulate AI agent processing, leverage tools, and synthesize comprehensive solutions. Optionally, provide image context.
          </motion.p>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 bg-card/85 backdrop-blur-md border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-foreground/95">Engage Neuro Synapse</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Enter a complex prompt. Optionally upload an image for visual context. Neuro Synapse will use its AI core to decompose the task, simulate processing, and synthesize a comprehensive answer.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="neuro-prompt-input" className="text-md font-medium text-foreground/80">Your Complex Prompt</Label>
                <Input
                  id="neuro-prompt-input"
                  placeholder="e.g., 'Analyze the future of AI in healthcare...'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isLoading}
                  required
                  className="text-lg p-4 h-14 bg-background/60 focus:bg-background focus:ring-accent focus:border-accent text-foreground/90 placeholder-muted-foreground/70 rounded-lg shadow-inner"
                  aria-label="Complex Prompt for Neuro Synapse"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-input" className="text-md font-medium text-foreground/80">Optional Image Context (Max 5MB)</Label>
                <div className="flex items-center gap-4">
                    <Input
                    id="image-input"
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={handleImageChange}
                    disabled={isLoading}
                    className="text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer file:cursor-pointer h-12"
                    aria-label="Optional image input for Neuro Synapse"
                    />
                    {previewImage && (
                    <Button type="button" variant="outline" size="sm" onClick={() => {setSelectedImage(null); setPreviewImage(null); (document.getElementById('image-input') as HTMLInputElement).value = '';}}>
                        Clear Image
                    </Button>
                    )}
                </div>
                {previewImage && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    className="mt-4 p-3 border-2 border-dashed border-accent/30 rounded-lg bg-muted/50 inline-block shadow-md"
                  >
                    <NextImage src={previewImage} alt="Selected image preview" width={120} height={120} className="rounded-md object-contain max-h-[120px]" />
                  </motion.div>
                )}
              </div>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  <Alert variant="destructive" className="shadow-lg border-red-500/50">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <AlertTitle className="font-semibold text-red-500">Processing Error</AlertTitle>
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
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2.5 h-6 w-6" />
                    Activate Synapse
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
                  Neuro Synapse is Weaving Connections...
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground pt-1">
                  The AI is decomposing your complex prompt, analyzing image context (if provided), simulating diverse AI agent tasks, and synthesizing a unified, intelligent response. This intricate process may take a moment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-6 pt-3">
                {[...Array(3)].map((_, i) => (
                   <div key={i} className={cn("space-y-3 p-4 rounded-lg bg-muted/60 animate-pulse shadow-inner border border-border/40", i === 0 && "opacity-90", i === 1 && "opacity-70", i === 2 && "opacity-50")}>
                     <div className="h-6 bg-muted rounded w-1/3"></div>
                     <div className="h-4 bg-muted rounded w-4/5"></div>
                     <div className="h-4 bg-muted rounded w-2/3"></div>
                   </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
      {result && !isLoading && (
        <motion.div
          key="result-section-ns"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30, transition: { duration: 0.3 } }}
          transition={{ duration: 0.6, ease: "circOut", delay: 0.1 }}
          className="space-y-10 mt-12"
        >
          <Card className="shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-accent/40 overflow-hidden">
            <CardHeader className="pb-5 border-b border-border/60 bg-gradient-to-br from-card to-muted/20 p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                        className="p-2 bg-accent/15 rounded-full shadow-md"
                    >
                        <Brain className="w-10 h-10 text-accent drop-shadow-md" />
                    </motion.div>
                    <div>
                        <CardTitle className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-pink-500">
                            Neuro Synapse Output
                        </CardTitle>
                        <CardDescription className="text-base mt-1.5 text-muted-foreground">Results from the AI processing pipeline.</CardDescription>
                    </div>
                </div>
                {result.hasImageContext && (
                    <Badge variant="outline" className="text-sm border-teal-500 text-teal-600 dark:text-teal-300 bg-teal-500/10 py-1.5 px-3.5 flex items-center gap-2 shadow-sm">
                        <ImageIcon className="w-4 h-4" /> Image Context Used
                    </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-10 pt-8 p-6 md:p-8">
              
              <motion.section initial={{opacity:0, y:15}} animate={{opacity:1,y:0}} transition={{delay:0.15, duration:0.5, ease:"easeOut"}}>
                <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center gap-2"><MessageSquare className="w-6 h-6 text-primary"/>Original Prompt:</h3>
                <blockquote className="text-md text-muted-foreground p-4 bg-muted/50 rounded-lg border-l-4 border-primary italic shadow-md">
                  {result.originalPrompt}
                </blockquote>
              </motion.section>
              
              <Separator className="bg-border/70" />

              <motion.section initial={{opacity:0, y:15}} animate={{opacity:1,y:0}} transition={{delay:0.25, duration:0.5, ease:"easeOut"}}>
                <h3 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-3">
                  <Lightbulb className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                  Synthesized Answer:
                </h3>
                <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 dark:from-primary/10 dark:via-accent/10 dark:to-primary/15 border-2 border-primary/30 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-foreground/95 leading-relaxed text-md prose prose-base dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.synthesizedAnswer.replace(/\n/g, '<br />') }} />
                  </CardContent>
                </Card>
              </motion.section>
              
              <Separator className="bg-border/70" />

              <motion.section initial={{opacity:0, y:15}} animate={{opacity:1,y:0}} transition={{delay:0.3, duration:0.5, ease:"easeOut"}}>
                <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-3">
                  <ShieldCheck className="w-7 h-7 text-green-500 dark:text-green-400" />
                  Ethical Compliance Check
                </h3>
                <Card className={cn("border-l-4 shadow-md", result.ethicalCompliance.isCompliant ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10")}>
                    <CardContent className="p-5 space-y-2.5">
                        <p><strong>Status:</strong> <span className={cn(result.ethicalCompliance.isCompliant ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300", "font-semibold")}>{result.ethicalCompliance.isCompliant ? "Compliant" : "Non-Compliant"}</span></p>
                        {result.ethicalCompliance.issuesFound && result.ethicalCompliance.issuesFound.length > 0 && (
                            <div>
                                <strong>Issues Found:</strong>
                                <ul className="list-disc list-inside ml-4 text-sm text-muted-foreground">
                                    {result.ethicalCompliance.issuesFound.map((issue, idx) => <li key={idx}>{issue}</li>)}
                                </ul>
                            </div>
                        )}
                        {result.ethicalCompliance.remediationSuggestions && result.ethicalCompliance.remediationSuggestions.length > 0 && (
                            <div>
                                <strong>Remediation Suggestions:</strong>
                                <ul className="list-disc list-inside ml-4 text-sm text-muted-foreground">
                                    {result.ethicalCompliance.remediationSuggestions.map((sug, idx) => <li key={idx}>{sug}</li>)}
                                </ul>
                            </div>
                        )}
                        {result.ethicalCompliance.confidenceScore && <p className="text-xs text-muted-foreground">Confidence: {(result.ethicalCompliance.confidenceScore * 100).toFixed(0)}%</p>}
                    </CardContent>
                </Card>
              </motion.section>

              {(result.toolUsages && result.toolUsages.length > 0) && (
                <>
                  <Separator className="bg-border/70" />
                  <motion.section initial={{opacity:0, y:15}} animate={{opacity:1,y:0}} transition={{delay:0.35, duration:0.5, ease:"easeOut"}}>
                    <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-3">
                      <Wrench className="w-7 h-7 text-orange-500 dark:text-orange-400" />
                      Tool Usage Details (Simulated)
                    </h3>
                    <Accordion type="single" collapsible className="w-full bg-muted/30 dark:bg-muted/25 rounded-xl p-1.5 shadow-lg border border-border/50">
                      {result.toolUsages.map((toolUsage, index) => (
                        <ToolUsageDisplay key={`tool-${index}`} toolUsage={toolUsage} index={index} />
                      ))}
                    </Accordion>
                  </motion.section>
                </>
              )}
              
              <Separator className="bg-border/70" />
              
              <div className="grid md:grid-cols-2 gap-10 items-start">
                <motion.section className="space-y-5" initial={{opacity:0, x:-25}} animate={{opacity:1,x:0}} transition={{delay:0.45, duration:0.5, ease:"easeOut"}}>
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-3">
                    <Users className="w-7 h-7 text-green-500 dark:text-green-400" />
                    Decomposed Sub-Tasks (Simulated)
                  </h3>
                   <ScrollArea className="h-[450px] pr-3.5 -mr-1.5 border p-4 rounded-xl bg-muted/30 dark:bg-muted/20 shadow-xl">
                    {result.decomposedTasks.map((task, index) => (
                      <SubTaskCard key={task.id} task={task} index={index} />
                    ))}
                  </ScrollArea>
                </motion.section>

                <motion.section className="space-y-5" initial={{opacity:0, x:25}} animate={{opacity:1,x:0}} transition={{delay:0.5, duration:0.5, ease:"easeOut"}}>
                   <h3 className="text-xl font-semibold text-foreground flex items-center gap-3">
                    <Workflow className="w-7 h-7 text-purple-500 dark:text-purple-400" />
                    Workflow Explanation
                  </h3>
                  <Card className="bg-muted/40 dark:bg-muted/25 shadow-xl hover:shadow-2xl transition-shadow">
                    <CardContent className="p-5 text-md text-muted-foreground/95 leading-relaxed">
                       <ScrollArea className="h-[410px] pr-2.5">
                        <div className="prose prose-base dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.workflowExplanation.replace(/\n/g, '<br />') }} />
                       </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.section>
              </div>
              
              <Separator className="bg-border/70" />

              <motion.section initial={{opacity:0, y:15}} animate={{opacity:1,y:0}} transition={{delay:0.6, duration:0.5, ease:"easeOut"}}>
                <h3 className="text-2xl font-bold mb-5 text-foreground flex items-center gap-3">
                  <SlidersHorizontal className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                  Visual Workflow Diagram (Simulated AI Process)
                </h3>
                <WorkflowDiagram data={result.workflowDiagramData} />
              </motion.section>

            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: (result && !isLoading) ? 0.7 : 0.5 }}
      >
      <Card className="mt-16 bg-card/85 backdrop-blur-lg shadow-2xl border-primary/15">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl md:text-3xl font-semibold text-foreground/95 flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-primary"/>About Neuro Synapse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 text-muted-foreground text-base leading-relaxed prose prose-base dark:prose-invert max-w-none">
                    <p>Neuro Synapse leverages a powerful AI model to understand your complex prompts. When you submit a prompt (with optional image context), the AI orchestrator takes over.</p>
                    <p>It analyzes the input, decomposes it into logical sub-tasks, assigns virtual specialized agents to each task, and simulates their execution. This includes generating plausible results for each sub-task and even simulating the use of tools like web search. An ethical compliance check is performed on the entire process and potential output before a final, synthesized answer is generated.</p>
                    <p>This approach allows Neuro Synapse to tackle multifaceted problems by breaking them into manageable pieces, simulating a collaborative effort among different AI capabilities, and ensuring the output is coherent, comprehensive, and ethically considered.</p>
                </div>
                <motion.div 
                    className="flex-shrink-0 w-full md:w-1/3"
                    initial={{opacity:0, scale:0.8}}
                    animate={{opacity:1, scale:1}}
                    transition={{delay:0.2, duration:0.5}}
                >
                    <NextImage 
                        src="https://picsum.photos/400/350?random=aiBrain" 
                        alt="AI Orchestration Conceptual Art" 
                        width={400} 
                        height={350} 
                        className="rounded-xl shadow-2xl object-cover border-2 border-accent/30"
                        data-ai-hint="ai brain"
                    />
                </motion.div>
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            {[
              { icon: <SearchCode className="w-7 h-7 text-accent" />, title: "Intelligent Decomposition", description: "AI breaks down complex prompts into manageable sub-tasks." },
              { icon: <Users className="w-7 h-7 text-accent" />, title: "Virtual Agent Simulation", description: "Simulates specialized AI agents working on each sub-task." },
              { icon: <Zap className="w-7 h-7 text-accent" />, title: "Tool Usage Simulation", description: "Can simulate agents using tools like search engines." },
              { icon: <ImageIcon className="w-7 h-7 text-accent" />, title: "Image Context", description: "Incorporates visual information into its analysis if provided." },
              { icon: <Share2 className="w-7 h-7 text-accent" />, title: "Result Synthesis", description: "Combines all insights into a single, cohesive answer." },
              { icon: <ShieldCheck className="w-7 h-7 text-accent" />, title: "Ethical Check", description: "Performs an ethical review before finalizing output." },
            ].map((item, idx) => (
              <motion.div 
                key={item.title}
                initial={{opacity:0, y:10}}
                animate={{opacity:1, y:0}}
                transition={{delay:0.3 + idx*0.05, duration:0.4}}
                className="p-4 bg-muted/40 dark:bg-muted/30 rounded-lg shadow-md border border-border/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  {item.icon}
                  <h4 className="text-md font-semibold text-foreground">{item.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
      </motion.div>

    </div>
  );
}

