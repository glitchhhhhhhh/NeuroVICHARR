'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Zap, Loader2, Workflow, MessageSquare, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { neuroSynapse, type NeuroSynapseOutput, type SubTask } from '@/ai/flows/neuro-synapse-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

// A simple component to render the workflow diagram (conceptual)
const WorkflowDiagram: React.FC<{ data: NeuroSynapseOutput['workflowDiagramData'] | undefined }> = ({ data }) => {
  if (!data || !data.nodes || !data.edges) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50 text-center text-muted-foreground">
        Workflow diagram data not available.
      </div>
    );
  }

  const nodePositions: { [key: string]: { x: number; y: number } } = {};
  const nodeSize = 80;
  const nodeSpacingX = 180;
  const nodeSpacingY = 120;
  let agentNodeCount = 0;

  data.nodes.forEach((node, index) => {
    if (node.type === 'input') nodePositions[node.id] = { x: 50, y: 200 };
    else if (node.id === 'neuroSynapse') nodePositions[node.id] = { x: 50 + nodeSpacingX, y: 200 };
    else if (node.type === 'agent') {
      nodePositions[node.id] = { x: 50 + nodeSpacingX * 2, y: 50 + agentNodeCount * nodeSpacingY };
      agentNodeCount++;
    } else if (node.type === 'output') nodePositions[node.id] = { x: 50 + nodeSpacingX * 3, y: 200 };
    else nodePositions[node.id] = { x: (index % 4) * nodeSpacingX + 50, y: Math.floor(index / 4) * nodeSpacingY + 50 };
  });
  
  const maxX = Math.max(...Object.values(nodePositions).map(p => p.x)) + nodeSize + 50;
  const maxY = Math.max(...Object.values(nodePositions).map(p => p.y)) + nodeSize + 50;


  return (
    <div className="p-4 border rounded-lg bg-background shadow-inner overflow-auto">
      <svg width={maxX} height={maxY} className="min-w-full">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="0"
            refY="3.5"
            orient="auto"
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
          const offsetX = (dx * (nodeSize / 2)) / distance;
          const offsetY = (dy * (nodeSize / 2)) / distance;
          
          const pathD = `M ${sourcePos.x + nodeSize / 2 + offsetX},${sourcePos.y + nodeSize / 2 + offsetY} L ${targetPos.x + nodeSize / 2 - offsetX},${targetPos.y + nodeSize / 2 - offsetY}`;

          return (
            <motion.path
              key={edge.id}
              d={pathD}
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
              className="stroke-current text-primary"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 + data.nodes.findIndex(n => n.id === edge.source) * 0.1 }}
            />
          );
        })}
        {data.nodes.map((node, index) => {
          const pos = nodePositions[node.id];
          if (!pos) return null;
          
          let bgColor = "bg-secondary";
          let icon = <Activity className="w-5 h-5" />;
          if (node.type === 'input') { bgColor = "bg-blue-500/20"; icon = <MessageSquare className="w-5 h-5 text-blue-500"/>; }
          else if (node.type === 'process') { bgColor = "bg-purple-500/20"; icon = <Brain className="w-5 h-5 text-purple-500"/>; }
          else if (node.type === 'agent') { bgColor = "bg-green-500/20"; icon = <Zap className="w-5 h-5 text-green-500"/>; }
          else if (node.type === 'output') { bgColor = "bg-amber-500/20"; icon = <CheckCircle2 className="w-5 h-5 text-amber-500"/>;}


          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <foreignObject x={pos.x} y={pos.y} width={nodeSize} height={nodeSize}>
                <div className={`w-full h-full p-2 rounded-lg shadow-md flex flex-col items-center justify-center text-center ${bgColor} border border-current`}>
                  {icon}
                  <span className="text-xs font-medium mt-1 text-foreground truncate w-full">{node.label}</span>
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

  switch (task.status) {
    case 'completed':
      statusIcon = <CheckCircle2 className="w-4 h-4 text-green-500" />;
      statusColorClass = 'border-green-500 bg-green-500/10';
      break;
    case 'processing':
      statusIcon = <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      statusColorClass = 'border-blue-500 bg-blue-500/10';
      break;
    case 'failed':
      statusIcon = <AlertCircle className="w-4 h-4 text-red-500" />;
      statusColorClass = 'border-red-500 bg-red-500/10';
      break;
    default: // pending
      statusIcon = <Activity className="w-4 h-4 text-gray-500" />;
      statusColorClass = 'border-gray-400 bg-gray-400/10';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={`mb-3 shadow-sm transition-all hover:shadow-md ${statusColorClass}`}>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span>{task.id}: {task.assignedAgent}</span>
            <Badge variant="outline" className="flex items-center gap-1 capitalize text-xs">
              {statusIcon}
              {task.status}
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs pt-1">{task.taskDescription}</CardDescription>
        </CardHeader>
        {task.resultSummary && (
          <CardContent className="p-3 pt-0">
            <p className="text-xs text-muted-foreground"><strong>Result:</strong> {task.resultSummary}</p>
          </CardContent>
        )}
      </Card>
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
    // Pre-fill an example prompt
    setPrompt("Analyze the impact of renewable energy adoption on the global economy, considering technological advancements, policy changes, and investment trends. Provide a summary and suggest future research directions.");
  }, []);


  return (
    <div className="space-y-8">
      <header className="flex items-center space-x-4">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
        >
          <Brain className="w-12 h-12 text-accent" />
        </motion.div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Neuro Synapse</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Intelligently divides user prompts into subtasks and delegates them across multiple AI agents.
          </p>
        </div>
      </header>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Engage Neuro Synapse</CardTitle>
          <CardDescription>
            Enter a complex prompt. Neuro Synapse will decompose it, simulate AI agent processing, and synthesize a comprehensive answer.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="neuro-prompt-input" className="text-sm font-medium">Your Complex Prompt</Label>
              <Input
                id="neuro-prompt-input"
                placeholder="e.g., 'Analyze the future of AI in healthcare...'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                required
                className="text-base"
                aria-label="Complex Prompt for Neuro Synapse"
              />
            </div>
             {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto text-base px-6 py-3">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
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
            className="space-y-4 mt-6"
          >
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-accent" />
                  Neuro Synapse is Thinking...
                </CardTitle>
                <CardDescription>Decomposing prompt, simulating agent tasks, and synthesizing results. Please wait.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1,2,3].map(i => (
                   <div key={i} className="space-y-2 p-3 rounded-md bg-muted/50 animate-pulse">
                     <div className="h-4 bg-muted rounded w-1/4"></div>
                     <div className="h-3 bg-muted rounded w-3/4"></div>
                     <div className="h-3 bg-muted rounded w-1/2"></div>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 mt-8"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Brain className="w-7 h-7 mr-2 text-accent" />
                Neuro Synapse Output
              </CardTitle>
              <CardDescription>Results from the orchestrated AI processing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Original Prompt:</h3>
                <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md border">{result.originalPrompt}</p>
              </div>
              
              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Synthesized Answer:</h3>
                <Card className="bg-primary/5 border-primary/20 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-foreground leading-relaxed">{result.synthesizedAnswer}</p>
                  </CardContent>
                </Card>
              </div>

              <Separator />
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-green-500" />
                    Decomposed Sub-Tasks &amp; Agent Simulation
                  </h3>
                   <ScrollArea className="h-[300px] pr-3">
                    {result.decomposedTasks.map((task, index) => (
                      <SubTaskCard key={task.id} task={task} index={index} />
                    ))}
                  </ScrollArea>
                </div>

                <div className="space-y-3">
                   <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <Workflow className="w-5 h-5 mr-2 text-purple-500" />
                    Workflow Explanation
                  </h3>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.workflowExplanation}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center">
                  <Workflow className="w-5 h-5 mr-2 text-blue-500" />
                  Workflow Diagram
                </h3>
                <WorkflowDiagram data={result.workflowDiagramData} />
              </div>

            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>About Neuro Synapse</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
           Neuro Synapse orchestrates AI collaboration by breaking down complex prompts into manageable sub-tasks. These are then "virtually" delegated among specialized AI agents. The results are intelligently merged to provide a comprehensive and refined output, all visible in a single, unified view. This demonstration simulates the agent processing to showcase the decomposition and synthesis capabilities.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}

