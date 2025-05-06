'use client';

import { useState, type FormEvent, useEffect, useMemo, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Zap, Loader2, Workflow, MessageSquare, Activity, CheckCircle2, AlertCircle, Newspaper, Wrench, Lightbulb, Users, ThermometerSnowflake, ImageUp, Image as ImageIcon } from "lucide-react"; // Added ImageUp, ImageIcon
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { neuroSynapse, type NeuroSynapseOutput, type SubTask, type ToolUsage } from '@/ai/flows/neuro-synapse-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import NextImage from 'next/image'; // Renamed to avoid conflict with Lucide icon
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const NodeIcon: React.FC<{ type: NeuroSynapseOutput['workflowDiagramData']['nodes'][0]['type'], className?: string }> = ({ type, className = "w-6 h-6" }) => {
  switch (type) {
    case 'input': return <MessageSquare className={className + " text-blue-500"} />;
    case 'image_input': return <ImageIcon className={className + " text-teal-500"} />;
    case 'process': return <Brain className={className + " text-purple-500"} />;
    case 'agent': return <Users className={className + " text-green-500"} />;
    case 'tool': return <Wrench className={className + " text-orange-500"} />;
    case 'output': return <CheckCircle2 className={className + " text-amber-500"} />;
    default: return <Activity className={className + " text-gray-500"} />;
  }
};

const WorkflowDiagramNode: React.FC<{ node: NeuroSynapseOutput['workflowDiagramData']['nodes'][0], style: React.CSSProperties }> = ({ node, style }) => (
  <motion.div
    style={style}
    className="absolute"
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
  >
    <Card className="w-36 h-24 p-2 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-accent/70">
      <NodeIcon type={node.type} className="w-7 h-7 mb-1" />
      <span className="text-xs font-medium text-foreground/90 truncate w-full px-1">{node.label}</span>
    </Card>
  </motion.div>
);

const WorkflowDiagramEdge: React.FC<{
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
  edgeId: string;
  delay: number;
}> = ({ sourcePos, targetPos, edgeId, delay }) => {
  const nodeWidth = 144; 
  const nodeHeight = 96; 

  const sx = sourcePos.x + nodeWidth / 2;
  const sy = sourcePos.y + nodeHeight / 2;
  const tx = targetPos.x + nodeWidth / 2;
  const ty = targetPos.y + nodeHeight / 2;

  // This simple logic might need refinement for complex layouts,
  // but aims to attach to the 'closest' edge.
  let sourceEdgeX = sx;
  let sourceEdgeY = sy;
  let targetEdgeX = tx;
  let targetEdgeY = ty;

  const dx = tx - sx;
  const dy = ty - sy;

  if (Math.abs(dx) > Math.abs(dy)) { // More horizontal than vertical
    sourceEdgeX = sx + (dx > 0 ? nodeWidth / 2 : -nodeWidth / 2);
    targetEdgeX = tx + (dx > 0 ? -nodeWidth / 2 : nodeWidth / 2);
  } else { // More vertical than horizontal
    sourceEdgeY = sy + (dy > 0 ? nodeHeight / 2 : -nodeHeight / 2);
    targetEdgeY = ty + (dy > 0 ? -nodeHeight / 2 : nodeHeight / 2);
  }
  
  const pathD = `M ${sourceEdgeX},${sourceEdgeY} L ${targetEdgeX},${targetEdgeY}`;

  return (
    <motion.path
      key={edgeId}
      d={pathD}
      strokeWidth="2"
      markerEnd="url(#arrowhead)"
      className="stroke-primary/60"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: delay, ease: "circOut" }}
    />
  );
};


const WorkflowDiagram: React.FC<{ data: NeuroSynapseOutput['workflowDiagramData'] | undefined }> = ({ data }) => {
  const nodePositions = useMemo(() => {
    if (!data || !data.nodes) return {};

    const positions: { [key: string]: { x: number; y: number } } = {};
    const G: { [key: string]: string[] } = {};
    const inDegree: { [key: string]: number } = {};
    data.nodes.forEach(node => {
      G[node.id] = [];
      inDegree[node.id] = 0;
    });
    data.edges.forEach(edge => {
      if (G[edge.source]) G[edge.source].push(edge.target);
      if (inDegree[edge.target] !== undefined) inDegree[edge.target]++;
    });

    const levels: { [key: number]: string[] } = {};
    let queue = data.nodes.filter(node => inDegree[node.id] === 0).map(node => node.id);
    let level = 0;

    while (queue.length > 0) {
      levels[level] = [...queue];
      const nextQueue: string[] = [];
      for (const u of queue) {
        for (const v of G[u] || []) {
          inDegree[v]--;
          if (inDegree[v] === 0) nextQueue.push(v);
        }
      }
      queue = nextQueue;
      level++;
    }
    
    const nodeWidth = 144; 
    const nodeHeight = 96;
    const horizontalGap = 80;
    const verticalGap = 60;
    const diagramWidth = 800; // Approximate width for centering

    Object.entries(levels).forEach(([lvlStr, nodesInLevel]) => {
      const currentLevel = parseInt(lvlStr);
      const levelHeight = nodesInLevel.length * nodeHeight + (nodesInLevel.length - 1) * verticalGap;
      
      nodesInLevel.forEach((nodeId, index) => {
        const nodeInfo = data.nodes.find(n => n.id === nodeId);
        let posX = currentLevel * (nodeWidth + horizontalGap) + 50;
        let posY = (diagramWidth / 2) - (levelHeight / 2) + index * (nodeHeight + verticalGap);

        // Specific adjustments for input/output nodes
        if (nodeInfo?.type === 'input' || nodeInfo?.type === 'image_input') {
          posX = 50;
          posY = (index * (nodeHeight + verticalGap*1.5)) + (diagramWidth / 2) - levelHeight / (nodesInLevel.length > 1 ? 1.5: 2) ;
        } else if (nodeInfo?.id === 'neuroSynapse') {
           posX = 50 + nodeWidth + horizontalGap;
           posY = (diagramWidth / 2) - (nodeHeight / 2) ; // Center
        } else if (nodeInfo?.type === 'output') {
            posX = Math.max(...Object.values(positions).map(p=>p.x), posX - (nodeWidth + horizontalGap)) + nodeWidth + horizontalGap;
            posY = (diagramWidth / 2) - (nodeHeight / 2); // Center
        } else { // Agent or Tool nodes
            posX = 50 + nodeWidth + horizontalGap + (nodeWidth + horizontalGap); // Level 2
            // Spread them out
            posY = 50 + index * (nodeHeight + verticalGap) - ((nodesInLevel.length -1) * (nodeHeight + verticalGap))/2 + 250;

        }
        positions[nodeId] = { x: posX, y: posY };
      });
    });
    
    data.nodes.forEach(node => {
        if (!positions[node.id]) {
            positions[node.id] = { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50};
        }
    });

    return positions;
  }, [data]);

  if (!data || !data.nodes || !data.edges) {
    return (
      <Card className="p-6 border rounded-lg bg-muted/30 text-center text-muted-foreground shadow-inner min-h-[450px] flex items-center justify-center">
        <p>Workflow diagram data is currently unavailable.</p>
      </Card>
    );
  }
  
  const allX = Object.values(nodePositions).map(p => p.x);
  const allY = Object.values(nodePositions).map(p => p.y);
  const minX = Math.min(0, ...allX);
  const minY = Math.min(0, ...allY);
  const maxX = Math.max(600, ...allX) + 144 + 50; 
  const maxY = Math.max(450, ...allY) + 96 + 50; 


  return (
    <Card className="p-4 border rounded-lg bg-background shadow-xl overflow-auto min-h-[550px] relative">
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
            <polygon points="0 0, 10 3.5, 0 7" className="fill-primary" />
          </marker>
        </defs>
        <g>
          {data.edges.map((edge, index) => {
            const sourcePos = nodePositions[edge.source];
            const targetPos = nodePositions[edge.target];
            if (!sourcePos || !targetPos) return null;
            return <WorkflowDiagramEdge key={edge.id} sourcePos={sourcePos} targetPos={targetPos} edgeId={edge.id} delay={0.5 + index * 0.1} />;
          })}
        </g>
      </svg>
      {data.nodes.map(node => {
        const pos = nodePositions[node.id];
        if (!pos) return null;
        return <WorkflowDiagramNode key={node.id} node={node} style={{ left: pos.x, top: pos.y }} />;
      })}
    </Card>
  );
};


const SubTaskCard: React.FC<{ task: SubTask, index: number }> = ({ task, index }) => {
  let statusIcon;
  let statusColorClass;
  let statusTextColor;
  let IconComponent;

  switch (task.status) {
    case 'completed':
      IconComponent = CheckCircle2;
      statusColorClass = 'border-l-4 border-green-500 bg-green-500/5 dark:bg-green-500/10';
      statusTextColor = 'text-green-600 dark:text-green-300';
      break;
    case 'processing':
      IconComponent = Loader2;
      statusColorClass = 'border-l-4 border-blue-500 bg-blue-500/5 dark:bg-blue-500/10';
      statusTextColor = 'text-blue-600 dark:text-blue-300';
      break;
    case 'failed':
      IconComponent = AlertCircle;
      statusColorClass = 'border-l-4 border-red-500 bg-red-500/5 dark:bg-red-500/10';
      statusTextColor = 'text-red-600 dark:text-red-300';
      break;
    default: // pending
      IconComponent = ThermometerSnowflake;
      statusColorClass = 'border-l-4 border-gray-400 bg-gray-400/5 dark:bg-gray-400/10';
      statusTextColor = 'text-gray-600 dark:text-gray-300';
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "circOut" }}
    >
      <Card className={`mb-3 shadow-md transition-all hover:shadow-lg ${statusColorClass} overflow-hidden`}>
        <CardHeader className="p-4 flex flex-row items-start justify-between space-x-3">
            <div className="flex-shrink-0 pt-1">
                 <IconComponent className={`w-5 h-5 ${statusTextColor} ${task.status === 'processing' ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex-grow">
                <CardTitle className="text-base font-semibold text-foreground/95">
                    {task.assignedAgent} <span className="text-xs text-muted-foreground">({task.id})</span>
                </CardTitle>
                <CardDescription className="text-sm pt-0.5">{task.taskDescription}</CardDescription>
            </div>
            <Badge variant="outline" className={`flex items-center gap-1.5 capitalize text-xs px-2 py-0.5 ${statusTextColor} bg-transparent border-current rounded-full font-medium`}>
              {task.status}
            </Badge>
        </CardHeader>
        {task.resultSummary && (
          <>
            <Separator className="my-0 bg-border/50"/>
            <CardContent className="p-4 pt-3">
                <p className="text-sm text-muted-foreground"><strong className="font-medium text-foreground/80">Result:</strong> {task.resultSummary}</p>
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
    <AccordionItem value={`tool-${index}`} className="border-b border-border/30 last:border-b-0">
      <AccordionTrigger className="hover:no-underline text-base font-medium py-3 px-1 text-left group">
        <div className="flex items-center gap-2.5">
          <Wrench className="w-5 h-5 text-orange-500 transition-transform group-hover:rotate-12" />
          Tool Used: <span className="font-semibold text-accent">{toolUsage.toolName}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-4 px-1 space-y-3 text-sm bg-muted/20 rounded-b-md">
        <div>
          <h4 className="font-semibold text-foreground/90 mb-1">Input:</h4>
          <ScrollArea className="max-h-32">
            <pre className="p-2.5 bg-muted/50 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(toolUsage.toolInput, null, 2) || 'No input provided'}
            </pre>
          </ScrollArea>
        </div>
        <div>
          <h4 className="font-semibold text-foreground/90 mb-1">Output:</h4>
          <ScrollArea className="max-h-48">
            <pre className="p-2.5 bg-muted/50 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-all">
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
      // Optionally, trigger submission or just prefill
      // handleSubmit(new Event('submit') as any); // This might be too aggressive
    } else {
      // Default example prompt if not from query
      setPrompt("What are the latest breakthroughs in quantum computing, how do they compare to classical AI, and what are some recent news headlines about their potential global economic impact?");
    }
  }, [searchParams]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
      if (selectedImage) {
        imageDataUri = previewImage ?? undefined; // Already in data URI format from FileReader
      }

      const response = await neuroSynapse({ mainPrompt: prompt, imageDataUri });
      setResult(response);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred with Neuro Synapse.');
      console.error("Neuro Synapse error:", e);
      toast({
        title: "Synapse Error",
        description: e.message || 'Failed to process the request.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex items-center space-x-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.1 }}
        >
          <Brain className="w-16 h-16 text-accent drop-shadow-lg" />
        </motion.div>
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl font-bold tracking-tight text-foreground"
          >
            Neuro Synapse
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl text-muted-foreground mt-2 max-w-2xl"
          >
            Orchestrate AI agents and tools to tackle complex problems. Optionally add image context.
          </motion.p>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Engage Neuro Synapse</CardTitle>
            <CardDescription className="text-base">
              Enter a complex prompt. Optionally upload an image for visual context. Neuro Synapse will decompose, simulate AI agent processing, and synthesize a comprehensive answer.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="neuro-prompt-input" className="text-md font-medium">Your Complex Prompt</Label>
                <Input
                  id="neuro-prompt-input"
                  placeholder="e.g., 'Analyze the future of AI in healthcare...'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isLoading}
                  required
                  className="text-lg p-3 h-12"
                  aria-label="Complex Prompt for Neuro Synapse"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-input" className="text-md font-medium">Optional Image Context (Max 5MB)</Label>
                <div className="flex items-center gap-4">
                    <Input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isLoading}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
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
                    className="mt-3 p-2 border border-dashed rounded-lg bg-muted/50 inline-block"
                  >
                    <NextImage src={previewImage} alt="Selected image preview" width={100} height={100} className="rounded-md object-contain max-h-[100px]" />
                  </motion.div>
                )}
              </div>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  <Alert variant="destructive" className="shadow-md">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="font-semibold">Processing Error</AlertTitle>
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
                    Orchestrating...
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
            className="space-y-6 mt-8"
          >
            <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Loader2 className="mr-3 h-6 w-6 animate-spin text-accent" />
                  Neuro Synapse is Thinking...
                </CardTitle>
                <CardDescription className="text-base">Decomposing prompt, analyzing image (if provided), simulating agent tasks, potentially using tools, and synthesizing results. This may take a moment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {[...Array(3)].map((_, i) => (
                   <div key={i} className="space-y-2.5 p-4 rounded-lg bg-muted/50 animate-pulse">
                     <div className="h-5 bg-muted rounded w-1/3"></div>
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
          transition={{ duration: 0.5, ease: "circOut", delay: 0.1 }}
          className="space-y-8 mt-10"
        >
          <Card className="shadow-xl bg-card/90 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-3xl flex items-center gap-3">
                        <Brain className="w-9 h-9 text-accent drop-shadow-md" />
                        Neuro Synapse Output
                    </CardTitle>
                    <CardDescription className="text-base mt-1">Results from the orchestrated AI processing pipeline.</CardDescription>
                </div>
                {result.hasImageContext && (
                    <Badge variant="outline" className="text-sm border-teal-500 text-teal-600 bg-teal-500/10 py-1 px-3 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4" /> Image Context Used
                    </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              
              <motion.section initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay:0.15, ease:"easeOut"}}>
                <h3 className="text-xl font-semibold mb-2.5 text-foreground">Original Prompt:</h3>
                <blockquote className="text-md text-muted-foreground p-4 bg-muted/40 rounded-lg border-l-4 border-primary italic shadow-sm">
                  {result.originalPrompt}
                </blockquote>
              </motion.section>
              
              <Separator />

              <motion.section initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay:0.25, ease:"easeOut"}}>
                <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center gap-2.5">
                  <Lightbulb className="w-7 h-7 text-amber-500" />
                  Synthesized Answer:
                </h3>
                <Card className="bg-primary/5 border-2 border-primary/20 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="text-foreground/95 leading-relaxed text-md prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.synthesizedAnswer.replace(/\n/g, '<br />') }} />
                  </CardContent>
                </Card>
              </motion.section>

              {(result.toolUsages && result.toolUsages.length > 0) && (
                <>
                  <Separator />
                  <motion.section initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay:0.35, ease:"easeOut"}}>
                    <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center gap-2.5">
                      <Wrench className="w-6 h-6 text-orange-500" />
                      Tool Usage Details
                    </h3>
                    <Accordion type="single" collapsible className="w-full bg-muted/20 rounded-lg p-1 shadow-sm border border-border/40">
                      {result.toolUsages.map((toolUsage, index) => (
                        <ToolUsageDisplay key={`tool-${index}`} toolUsage={toolUsage} index={index} />
                      ))}
                    </Accordion>
                  </motion.section>
                </>
              )}
              
              <Separator />
              
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <motion.section className="space-y-4" initial={{opacity:0, x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.45, ease:"easeOut"}}>
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2.5">
                    <Users className="w-6 h-6 text-green-500" />
                    Decomposed Sub-Tasks
                  </h3>
                   <ScrollArea className="h-[400px] pr-3 -mr-1 border p-3 rounded-lg bg-muted/20 shadow-inner">
                    {result.decomposedTasks.map((task, index) => (
                      <SubTaskCard key={task.id} task={task} index={index} />
                    ))}
                  </ScrollArea>
                </motion.section>

                <motion.section className="space-y-4" initial={{opacity:0, x:20}} animate={{opacity:1,x:0}} transition={{delay:0.5, ease:"easeOut"}}>
                   <h3 className="text-xl font-semibold text-foreground flex items-center gap-2.5">
                    <Workflow className="w-6 h-6 text-purple-500" />
                    Workflow Explanation
                  </h3>
                  <Card className="bg-muted/40 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 text-md text-muted-foreground/95 leading-relaxed">
                       <ScrollArea className="h-[360px] pr-2">
                        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.workflowExplanation.replace(/\n/g, '<br />') }} />
                       </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.section>
              </div>
              
              <Separator />

              <motion.section initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay:0.6, ease:"easeOut"}}>
                <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2.5">
                  <Workflow className="w-7 h-7 text-blue-500" />
                  Visual Workflow Diagram
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
      <Card className="mt-12 bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">About Neuro Synapse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-base leading-relaxed prose prose-sm dark:prose-invert max-w-none">
           <p>Neuro Synapse orchestrates sophisticated AI collaboration by intelligently deconstructing complex user prompts—and optional visual context from images—into granular sub-tasks. 
           These tasks are then virtually assigned to specialized AI agents, which can leverage integrated tools for real-time data acquisition or external actions. 
           The processed information and agent-derived insights are meticulously synthesized to produce a coherent, comprehensive, and nuanced final output. 
           This interactive demonstration showcases this entire pipeline, from prompt and image decomposition and tool integration through to final synthesis, providing a transparent view into the AI's reasoning process.
           </p>
          </div>
        </CardContent>
      </Card>
      </motion.div>

    </div>
  );
}

