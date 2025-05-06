'use client';

import { useState, type FormEvent, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Zap, Loader2, Workflow, MessageSquare, Activity, CheckCircle2, AlertCircle, Newspaper, Wrench, Lightbulb, Users, ThermometerSnowflake } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { neuroSynapse, type NeuroSynapseOutput, type SubTask, type ToolUsage } from '@/ai/flows/neuro-synapse-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const NodeIcon: React.FC<{ type: NeuroSynapseOutput['workflowDiagramData']['nodes'][0]['type'], className?: string }> = ({ type, className = "w-6 h-6" }) => {
  switch (type) {
    case 'input': return <MessageSquare className={className + " text-blue-500"} />;
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
  const nodeWidth = 144; // 36 * 4 (w-36)
  const nodeHeight = 96; // 24 * 4 (h-24)

  // Adjust for node center to node edge
  const sx = sourcePos.x + nodeWidth / 2;
  const sy = sourcePos.y + nodeHeight / 2;
  const tx = targetPos.x + nodeWidth / 2;
  const ty = targetPos.y + nodeHeight / 2;

  const dx = tx - sx;
  const dy = ty - sy;
  const angle = Math.atan2(dy, dx);

  // Calculate intersection points with node boundaries (simplified for rectangles)
  // This logic can be more precise for different node shapes or edge cases
  const sourceEdgeX = sx + (nodeWidth / 2) * Math.cos(angle);
  const sourceEdgeY = sy + (nodeHeight / 2) * Math.sin(angle);
  const targetEdgeX = tx - (nodeWidth / 2) * Math.cos(angle);
  const targetEdgeY = ty - (nodeHeight / 2) * Math.sin(angle);


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
    const G: { [key: string]: string[] } = {}; // Adjacency list
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

    Object.entries(levels).forEach(([lvlStr, nodesInLevel]) => {
      const currentLevel = parseInt(lvlStr);
      const levelWidth = nodesInLevel.length * nodeWidth + (nodesInLevel.length - 1) * horizontalGap;
      let currentX = (level * (nodeWidth + horizontalGap * 2)) + 50; // X moves with level

      nodesInLevel.forEach((nodeId, index) => {
        // Y is based on index within the level, centered
        let currentY = index * (nodeHeight + verticalGap) + 50 - ((nodesInLevel.length-1)*(nodeHeight+verticalGap))/2 + 250;

        // Specific adjustments for known node types
        if (data.nodes.find(n => n.id === nodeId)?.type === 'input') currentX = 50;
        if (data.nodes.find(n => n.id === nodeId)?.id === 'neuroSynapse') {
          currentX = 50 + nodeWidth + horizontalGap * 1.5;
          currentY = 250;
        }
        if (data.nodes.find(n => n.id === nodeId)?.type === 'output') {
            currentX = Math.max(...Object.values(positions).map(p=>p.x), 0) + nodeWidth + horizontalGap * 1.5;
            currentY = 250;
        }


        positions[nodeId] = { x: currentX, y: currentY };
      });
    });
     // Fallback for any nodes not placed by topological sort (e.g. cycles, disconnected)
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
  const maxX = Math.max(600, ...allX) + 144 + 50; // node width + padding
  const maxY = Math.max(450, ...allY) + 96 + 50; // node height + padding


  return (
    <Card className="p-4 border rounded-lg bg-background shadow-xl overflow-auto min-h-[450px] relative">
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
      {/* Nodes are rendered as HTML elements for easier styling & interaction */}
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
      statusIcon = <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />;
      statusColorClass = 'border-l-4 border-green-500 bg-green-500/5 dark:bg-green-500/10';
      statusTextColor = 'text-green-600 dark:text-green-300';
      IconComponent = CheckCircle2;
      break;
    case 'processing':
      statusIcon = <Loader2 className="w-4 h-4 animate-spin text-blue-500 dark:text-blue-400" />;
      statusColorClass = 'border-l-4 border-blue-500 bg-blue-500/5 dark:bg-blue-500/10';
      statusTextColor = 'text-blue-600 dark:text-blue-300';
      IconComponent = Loader2;
      break;
    case 'failed':
      statusIcon = <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />;
      statusColorClass = 'border-l-4 border-red-500 bg-red-500/5 dark:bg-red-500/10';
      statusTextColor = 'text-red-600 dark:text-red-300';
      IconComponent = AlertCircle;
      break;
    default: // pending
      statusIcon = <ThermometerSnowflake className="w-4 h-4 text-gray-500 dark:text-gray-400" />; // Using ThermometerSnowflake for pending
      statusColorClass = 'border-l-4 border-gray-400 bg-gray-400/5 dark:bg-gray-400/10';
      statusTextColor = 'text-gray-600 dark:text-gray-300';
      IconComponent = ThermometerSnowflake;
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
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NeuroSynapseOutput | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    // Keep previous result during loading for a smoother UX if desired, or set to null
    // setResult(null); 

    try {
      if (!prompt.trim()) {
        setError('Please enter a prompt for Neuro Synapse.');
        setIsLoading(false);
        return;
      }
      const response = await neuroSynapse({ mainPrompt: prompt });
      setResult(response);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred with Neuro Synapse.');
      console.error("Neuro Synapse error:", e);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Pre-fill with an example prompt
    setPrompt("What are the latest breakthroughs in quantum computing, how do they compare to classical AI, and what are some recent news headlines about their potential global economic impact?");
  }, []);


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
            Orchestrate AI agents and tools to tackle complex problems and synthesize intelligent insights.
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
              Enter a complex prompt. Neuro Synapse will decompose it, simulate AI agent processing (and use tools if needed), and synthesize a comprehensive answer.
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
            key="loading-indicator"
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
                <CardDescription className="text-base">Decomposing prompt, simulating agent tasks, potentially using tools, and synthesizing results. This may take a moment.</CardDescription>
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
          key="result-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30, transition: { duration: 0.3 } }}
          transition={{ duration: 0.5, ease: "circOut", delay: 0.1 }}
          className="space-y-8 mt-10"
        >
          <Card className="shadow-xl bg-card/90 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-3xl flex items-center gap-3">
                <Brain className="w-9 h-9 text-accent drop-shadow-md" />
                Neuro Synapse Output
              </CardTitle>
              <CardDescription className="text-base mt-1">Results from the orchestrated AI processing pipeline.</CardDescription>
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
                    <p className="text-foreground/95 leading-relaxed text-md prose prose-sm dark:prose-invert max-w-none">{result.synthesizedAnswer}</p>
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
                    <Users className="w-6 h-6 text-green-500" /> {/* Changed icon */}
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
                    <CardContent className="p-5 text-md text-muted-foreground/95 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                       <ScrollArea className="h-[360px] pr-2">
                        {result.workflowExplanation}
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
        transition={{ duration: 0.5, delay: (result && !isLoading) ? 0.7 : 0.5 }} // Adjust delay based on result presence
      >
      <Card className="mt-12 bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">About Neuro Synapse</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-base leading-relaxed prose prose-sm dark:prose-invert max-w-none">
           Neuro Synapse orchestrates sophisticated AI collaboration by intelligently deconstructing complex user prompts into granular sub-tasks. 
           These tasks are then virtually assigned to specialized AI agents, which can leverage integrated tools for real-time data acquisition or external actions. 
           The processed information and agent-derived insights are meticulously synthesized to produce a coherent, comprehensive, and nuanced final output. 
           This interactive demonstration showcases this entire pipeline, from prompt decomposition and tool integration through to final synthesis, providing a transparent view into the AI's reasoning process.
          </p>
        </CardContent>
      </Card>
      </motion.div>

    </div>
  );
}
