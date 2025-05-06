'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Zap, Loader2, Workflow, MessageSquare, Activity, CheckCircle2, AlertCircle, Newspaper, Wrench, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { neuroSynapse, type NeuroSynapseOutput, type SubTask, type ToolUsage } from '@/ai/flows/neuro-synapse-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


const WorkflowDiagram: React.FC<{ data: NeuroSynapseOutput['workflowDiagramData'] | undefined }> = ({ data }) => {
  if (!data || !data.nodes || !data.edges) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50 text-center text-muted-foreground">
        Workflow diagram data not available.
      </div>
    );
  }

  const nodePositions: { [key: string]: { x: number; y: number } } = {};
  const nodeSize = 90; // Increased size for better visibility
  const nodeSpacingX = 200; // Increased spacing
  const nodeSpacingY = 140; // Increased spacing
  let agentNodeCount = 0;
  let toolNodeCount = 0;

  // Basic layout logic - can be improved for complex graphs
  data.nodes.forEach((node) => {
    if (node.type === 'input') nodePositions[node.id] = { x: 50, y: 250 };
    else if (node.id === 'neuroSynapse') nodePositions[node.id] = { x: 50 + nodeSpacingX, y: 250 };
    else if (node.type === 'agent') {
      nodePositions[node.id] = { x: 50 + nodeSpacingX * 2, y: 100 + agentNodeCount * nodeSpacingY };
      agentNodeCount++;
    } else if (node.type === 'tool') {
      nodePositions[node.id] = { x: 50 + nodeSpacingX + (toolNodeCount % 2 === 0 ? -50 : 50) , y: 250 + (toolNodeCount % 2 === 0 ? -nodeSpacingY : nodeSpacingY) };
      toolNodeCount++;
    }
    else if (node.type === 'output') nodePositions[node.id] = { x: 50 + nodeSpacingX * 3, y: 250 };
    else nodePositions[node.id] = { x: (Math.random() * nodeSpacingX*2) + 50, y: Math.random() * nodeSpacingY*2 + 50 }; // Fallback for unknown
  });
  
  const allX = Object.values(nodePositions).map(p => p.x);
  const allY = Object.values(nodePositions).map(p => p.y);
  const minX = Math.min(...allX);
  const minY = Math.min(...allY);
  const maxX = Math.max(...allX) + nodeSize + 50;
  const maxY = Math.max(...allY) + nodeSize + 50;


  return (
    <div className="p-4 border rounded-lg bg-background shadow-inner overflow-auto min-h-[400px]">
      <svg width={Math.max(maxX - minX, 600)} height={Math.max(maxY - minY, 450)} viewBox={`${minX-20} ${minY-20} ${maxX-minX+40} ${maxY-minY+40}`} className="min-w-full">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9" // Adjusted for better arrow visibility on node edge
            refY="3.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 0, 10 3.5, 0 7" className="fill-current text-primary" />
          </marker>
        </defs>
        {data.edges.map(edge => {
          const sourcePos = nodePositions[edge.source];
          const targetPos = nodePositions[edge.target];
          if (!sourcePos || !targetPos) return null;

          const dx = targetPos.x - sourcePos.x;
          const dy = targetPos.y - sourcePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Adjust start and end points to be on the edge of the node, not center
          const sourceOffsetX = (dx * (nodeSize / 2)) / distance;
          const sourceOffsetY = (dy * (nodeSize / 2)) / distance;
          const targetOffsetX = (dx * (nodeSize / 2)) / distance;
          const targetOffsetY = (dy * (nodeSize / 2)) / distance;
          
          const pathD = `M ${sourcePos.x + nodeSize / 2 + sourceOffsetX},${sourcePos.y + nodeSize / 2 + sourceOffsetY} L ${targetPos.x + nodeSize / 2 - targetOffsetX},${targetPos.y + nodeSize / 2 - targetOffsetY}`;

          return (
            <motion.path
              key={edge.id}
              d={pathD}
              strokeWidth="2.5"
              markerEnd="url(#arrowhead)"
              className="stroke-current text-primary/70"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 + data.nodes.findIndex(n => n.id === edge.source) * 0.15 }}
            />
          );
        })}
        {data.nodes.map((node, index) => {
          const pos = nodePositions[node.id];
          if (!pos) return null;
          
          let bgColor = "bg-secondary/50";
          let icon = <Activity className="w-6 h-6" />; // Default icon
          let borderColor = "border-muted-foreground/50";

          if (node.type === 'input') { bgColor = "bg-blue-500/20"; icon = <MessageSquare className="w-6 h-6 text-blue-500"/>; borderColor="border-blue-500/50"; }
          else if (node.type === 'process') { bgColor = "bg-purple-500/20"; icon = <Brain className="w-6 h-6 text-purple-500"/>; borderColor="border-purple-500/50"; }
          else if (node.type === 'agent') { bgColor = "bg-green-500/20"; icon = <Zap className="w-6 h-6 text-green-500"/>; borderColor="border-green-500/50"; }
          else if (node.type === 'tool') { bgColor = "bg-orange-500/20"; icon = <Wrench className="w-6 h-6 text-orange-500"/>; borderColor="border-orange-500/50"; }
          else if (node.type === 'output') { bgColor = "bg-amber-500/20"; icon = <CheckCircle2 className="w-6 h-6 text-amber-500"/>; borderColor="border-amber-500/50"; }


          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0.3, x: pos.x + nodeSize/2, y: pos.y + nodeSize/2  }}
              animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y }}
              transition={{ type: "spring", stiffness: 150, damping: 15, delay: index * 0.1 }}
            >
              <foreignObject x={pos.x} y={pos.y} width={nodeSize} height={nodeSize} className="overflow-visible">
                <div className={`w-full h-full p-2.5 rounded-xl shadow-lg flex flex-col items-center justify-center text-center ${bgColor} border-2 ${borderColor} transition-all hover:shadow-2xl hover:scale-105`}>
                  {icon}
                  <span className="text-xs font-medium mt-1.5 text-foreground/90 truncate w-full px-1">{node.label}</span>
                </div>
              </foreignObject>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
};


const SubTaskCard: React.FC<{ task: SubTask, index: number }> = ({ task, index }) => {
  let statusIcon;
  let statusColorClass;
  let statusTextColor;

  switch (task.status) {
    case 'completed':
      statusIcon = <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />;
      statusColorClass = 'border-l-4 border-green-500 bg-green-500/10 dark:bg-green-500/5';
      statusTextColor = 'text-green-700 dark:text-green-300';
      break;
    case 'processing':
      statusIcon = <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />;
      statusColorClass = 'border-l-4 border-blue-500 bg-blue-500/10 dark:bg-blue-500/5';
      statusTextColor = 'text-blue-700 dark:text-blue-300';
      break;
    case 'failed':
      statusIcon = <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      statusColorClass = 'border-l-4 border-red-500 bg-red-500/10 dark:bg-red-500/5';
      statusTextColor = 'text-red-700 dark:text-red-300';
      break;
    default: // pending
      statusIcon = <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      statusColorClass = 'border-l-4 border-gray-400 bg-gray-400/10 dark:bg-gray-400/5';
      statusTextColor = 'text-gray-700 dark:text-gray-300';
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
    >
      <Card className={`mb-3 shadow-md transition-all hover:shadow-lg ${statusColorClass}`}>
        <CardHeader className="p-4">
          <CardTitle className="text-base font-semibold flex items-center justify-between">
            <span className="truncate max-w-[70%]">{task.id}: {task.assignedAgent}</span>
            <Badge variant="outline" className={`flex items-center gap-1.5 capitalize text-xs px-2 py-1 ${statusTextColor} bg-transparent border-current`}>
              {statusIcon}
              {task.status}
            </Badge>
          </CardTitle>
          <CardDescription className="text-sm pt-1.5">{task.taskDescription}</CardDescription>
        </CardHeader>
        {task.resultSummary && (
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground"><strong>Result:</strong> {task.resultSummary}</p>
          </CardContent>
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
      transition={{ duration: 0.3, delay: index * 0.15 }}
    >
    <AccordionItem value={`tool-${index}`} className="border-b border-border/50">
      <AccordionTrigger className="hover:no-underline text-base font-medium">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-orange-500" />
          Tool Used: {toolUsage.toolName}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-4 px-2 space-y-3 text-sm">
        <div>
          <h4 className="font-semibold text-foreground/90">Input:</h4>
          <pre className="mt-1 p-2.5 bg-muted/70 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(toolUsage.toolInput, null, 2) || 'No input provided'}
          </pre>
        </div>
        <div>
          <h4 className="font-semibold text-foreground/90">Output:</h4>
          <pre className="mt-1 p-2.5 bg-muted/70 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(toolUsage.toolOutput, null, 2) || 'No output received'}
          </pre>
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
    setResult(null);

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
    setPrompt("What are the latest developments in AI and how might they impact the global economy according to recent news?");
  }, []);


  return (
    <div className="space-y-10">
      <header className="flex items-center space-x-6">
        <motion.div
          animate={{ rotateY: [0, 15, -15, 0], scale: [1, 1.1, 1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
          <Brain className="w-16 h-16 text-accent drop-shadow-lg" />
        </motion.div>
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">Neuro Synapse</h1>
          <p className="text-xl text-muted-foreground mt-2 max-w-2xl">
            Intelligently orchestrates AI agents and tools to process complex prompts and deliver synthesized insights.
          </p>
        </div>
      </header>

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
                placeholder="e.g., 'Analyze the future of AI in healthcare, considering recent news...'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                required
                className="text-lg p-3"
                aria-label="Complex Prompt for Neuro Synapse"
              />
            </div>
             {error && (
              <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <Alert variant="destructive" className="shadow-md">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle className="font-semibold">Processing Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} size="lg" className="text-lg px-8 py-6 w-full sm:w-auto shadow-md hover:shadow-lg transition-all transform hover:scale-105">
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

      <AnimatePresence>
        {isLoading && (
           <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 mt-8"
          >
            <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Loader2 className="mr-3 h-6 w-6 animate-spin text-accent" />
                  Neuro Synapse is Thinking...
                </CardTitle>
                <CardDescription className="text-base">Decomposing prompt, simulating agent tasks, potentially using tools, and synthesizing results. Please wait.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {[...Array(3)].map((_, i) => (
                   <div key={i} className="space-y-2.5 p-4 rounded-lg bg-muted/60 animate-pulse">
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8 mt-10"
        >
          <Card className="shadow-xl bg-card/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl flex items-center gap-3">
                <Brain className="w-9 h-9 text-accent drop-shadow-md" />
                Neuro Synapse Output
              </CardTitle>
              <CardDescription className="text-base">Results from the orchestrated AI processing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
                <h3 className="text-xl font-semibold mb-2.5 text-foreground">Original Prompt:</h3>
                <blockquote className="text-md text-muted-foreground p-4 bg-muted/50 rounded-lg border-l-4 border-primary italic">
                  {result.originalPrompt}
                </blockquote>
              </motion.div>
              
              <Separator />

              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
                <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-amber-500" />
                  Synthesized Answer:
                </h3>
                <Card className="bg-primary/5 border-2 border-primary/20 shadow-md">
                  <CardContent className="p-5">
                    <p className="text-foreground/90 leading-relaxed text-md">{result.synthesizedAnswer}</p>
                  </CardContent>
                </Card>
              </motion.div>

              <Separator />
              
              {(result.toolUsages && result.toolUsages.length > 0) && (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
                  <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-orange-500" />
                    Tool Usage
                  </h3>
                  <Accordion type="single" collapsible className="w-full bg-muted/30 rounded-lg p-2 shadow-sm">
                    {result.toolUsages.map((toolUsage, index) => (
                      <ToolUsageDisplay key={`tool-${index}`} toolUsage={toolUsage} index={index} />
                    ))}
                  </Accordion>
                </motion.div>
              )}
              
              <Separator />
              
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div className="space-y-4" initial={{opacity:0, x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.4}}>
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Zap className="w-6 h-6 text-green-500" />
                    Decomposed Sub-Tasks &amp; Agent Simulation
                  </h3>
                   <ScrollArea className="h-[350px] pr-4 -mr-2 border p-3 rounded-lg bg-muted/30 shadow-inner">
                    {result.decomposedTasks.map((task, index) => (
                      <SubTaskCard key={task.id} task={task} index={index} />
                    ))}
                  </ScrollArea>
                </motion.div>

                <motion.div className="space-y-4" initial={{opacity:0, x:20}} animate={{opacity:1,x:0}} transition={{delay:0.5}}>
                   <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Workflow className="w-6 h-6 text-purple-500" />
                    Workflow Explanation
                  </h3>
                  <Card className="bg-muted/50 shadow-sm">
                    <CardContent className="p-5 text-md text-muted-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                      <p>{result.workflowExplanation}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
              
              <Separator />

              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay:0.6}}>
                <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Workflow className="w-6 h-6 text-blue-500" />
                  Workflow Diagram
                </h3>
                <WorkflowDiagram data={result.workflowDiagramData} />
              </motion.div>

            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
      
      <Card className="mt-12 bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">About Neuro Synapse</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-base leading-relaxed">
           Neuro Synapse orchestrates AI collaboration by breaking down complex prompts into manageable sub-tasks. These are then "virtually" delegated among specialized AI agents and can leverage tools for external data retrieval or actions. The results are intelligently merged to provide a comprehensive and refined output, all visible in a single, unified view. This demonstration simulates agent processing and tool usage to showcase decomposition, tool integration, and synthesis capabilities.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}