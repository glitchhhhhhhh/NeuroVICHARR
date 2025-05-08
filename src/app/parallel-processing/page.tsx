
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Network, GitFork, Cpu, Gauge, CheckCircle2, XCircle, Loader2, MessageSquare, BrainCircuit, Lightbulb, Settings, Play, Pause, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

// Types for mock data
interface Agent {
  id: string;
  name: string;
  type: 'LLM' | 'Vision' | 'Web' | 'Code' | 'Summarizer' | 'Evaluator';
  status: 'idle' | 'busy' | 'error';
  currentTaskId: string | null;
  utilization: { cpu: number; gpu: number; ram: number };
  messages: string[];
}

interface SubTask {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'debating';
  assignedAgentId: string | null;
  dependencies: string[];
  startTime: number | null;
  endTime: number | null;
  confidence: number;
  progress: number;
  resultSummary?: string;
  conflicts?: string[];
}

const initialAgents: Agent[] = [
  { id: 'agent-llm-1', name: 'GPT-4 Omni', type: 'LLM', status: 'idle', currentTaskId: null, utilization: { cpu: 10, gpu: 5, ram: 15 }, messages: [] },
  { id: 'agent-vision-1', name: 'VisionPro Alpha', type: 'Vision', status: 'idle', currentTaskId: null, utilization: { cpu: 5, gpu: 20, ram: 10 }, messages: [] },
  { id: 'agent-web-1', name: 'WebCrawler X', type: 'Web', status: 'idle', currentTaskId: null, utilization: { cpu: 15, gpu: 2, ram: 5 }, messages: [] },
  { id: 'agent-code-1', name: 'CodeInterpreter Prime', type: 'Code', status: 'idle', currentTaskId: null, utilization: { cpu: 20, gpu: 10, ram: 20 }, messages: [] },
  { id: 'agent-eval-1', name: 'CritiqueBot 5000', type: 'Evaluator', status: 'idle', currentTaskId: null, utilization: { cpu: 8, gpu: 3, ram: 12 }, messages: [] },
];

const initialTasks: SubTask[] = [
  { id: 'task-1', name: 'Deconstruct User Prompt', dependencies: [], status: 'pending', assignedAgentId: null, startTime: null, endTime: null, confidence: 0, progress: 0 },
  { id: 'task-2', name: 'Identify Key Entities', dependencies: ['task-1'], status: 'pending', assignedAgentId: null, startTime: null, endTime: null, confidence: 0, progress: 0 },
  { id: 'task-3', name: 'Fetch Relevant Web Data', dependencies: ['task-2'], status: 'pending', assignedAgentId: null, startTime: null, endTime: null, confidence: 0, progress: 0 },
  { id: 'task-4', name: 'Generate Initial Draft', dependencies: ['task-2'], status: 'pending', assignedAgentId: null, startTime: null, endTime: null, confidence: 0, progress: 0 },
  { id: 'task-5', name: 'Analyze Image Context (if any)', dependencies: ['task-1'], status: 'pending', assignedAgentId: null, startTime: null, endTime: null, confidence: 0, progress: 0 },
  { id: 'task-6', name: 'Cross-Validate Web Findings', dependencies: ['task-3'], status: 'pending', assignedAgentId: null, startTime: null, endTime: null, confidence: 0, progress: 0, conflicts: [] },
  { id: 'task-7', name: 'Review & Refine Draft', dependencies: ['task-4', 'task-6'], status: 'pending', assignedAgentId: null, startTime: null, endTime: null, confidence: 0, progress: 0, conflicts: [] },
  { id: 'task-8', name: 'Ethical Compliance Check', dependencies: ['task-7'], status: 'pending', assignedAgentId: null, startTime: null, endTime: null, confidence: 0, progress: 0 },
  { id: 'task-9', name: 'Synthesize Final Output', dependencies: ['task-8'], status: 'pending', assignedAgentId: null, startTime: null, endTime: null, confidence: 0, progress: 0 },
];

const getNodeColor = (status: SubTask['status']) => {
  if (status === 'active') return 'hsl(var(--accent))';
  if (status === 'completed') return 'hsl(var(--primary))';
  if (status === 'failed') return 'hsl(var(--destructive))';
  if (status === 'debating') return 'hsl(var(--yellow-500))'; // You might need to add this color to globals.css or use a predefined one
  return 'hsl(var(--muted-foreground))';
};

const TaskNode: React.FC<{ task: SubTask, onClick: () => void, style?: React.CSSProperties }> = ({ task, onClick, style }) => (
  <motion.div
    layoutId={task.id}
    onClick={onClick}
    style={style}
    className="absolute p-3 border rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all w-40 bg-card/90 backdrop-blur-sm"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1, borderColor: getNodeColor(task.status) }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-semibold truncate text-foreground">{task.name}</span>
      {task.status === 'active' && <Loader2 className="w-3 h-3 text-accent animate-spin" />}
      {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-primary" />}
      {task.status === 'failed' && <XCircle className="w-3 h-3 text-destructive" />}
      {task.status === 'debating' && <MessageSquare className="w-3 h-3 text-yellow-500" />}
    </div>
    <Progress value={task.progress} className="h-1.5 mb-1" indicatorClassName={cn(
        task.status === 'completed' ? 'bg-primary' : task.status === 'active' ? 'bg-accent' : task.status === 'failed' ? 'bg-destructive' : 'bg-muted-foreground'
    )} />
    <p className="text-[10px] text-muted-foreground">Conf: {task.confidence.toFixed(2)}</p>
    {task.assignedAgentId && <p className="text-[10px] text-muted-foreground truncate">Agent: {task.assignedAgentId.split('-')[1]}</p>}
  </motion.div>
);

const EdgeLine: React.FC<{ sourcePos: { x: number, y: number }, targetPos: { x: number, y: number }, isCompleted: boolean }> = ({ sourcePos, targetPos, isCompleted }) => {
  const pathD = `M${sourcePos.x},${sourcePos.y} C${sourcePos.x},${(sourcePos.y + targetPos.y) / 2} ${targetPos.x},${(sourcePos.y + targetPos.y) / 2} ${targetPos.x},${targetPos.y}`;
  return (
    <motion.path
      d={pathD}
      strokeWidth="1.5"
      className={isCompleted ? "stroke-primary/70" : "stroke-muted-foreground/50"}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, ease: "circOut" }}
    />
  );
};


export default function ParallelProcessingCorePage() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [tasks, setTasks] = useState<SubTask[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<SubTask | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);

  const nodePositions = useMemo(() => {
    const positions: { [key: string]: { x: number, y: number, level: number } } = {};
    const levels: string[][] = [];
    const inDegree: { [key: string]: number } = {};
    const graph: { [key: string]: string[] } = {};

    tasks.forEach(task => {
      inDegree[task.id] = 0;
      graph[task.id] = [];
    });

    tasks.forEach(task => {
      task.dependencies.forEach(depId => {
        if (graph[depId]) {
           graph[depId].push(task.id);
           inDegree[task.id]++;
        }
      });
    });

    let queue = tasks.filter(task => inDegree[task.id] === 0).map(t => t.id);
    let level = 0;
    while (queue.length > 0) {
      levels[level] = queue;
      const nextQueue: string[] = [];
      for (const u of queue) {
        graph[u].forEach(v => {
          inDegree[v]--;
          if (inDegree[v] === 0) {
            nextQueue.push(v);
          }
        });
      }
      queue = nextQueue;
      level++;
    }
    
    // Simple layout: equally spaced horizontally within levels, levels spaced vertically
    const nodeWidth = 160;
    const nodeHeight = 90;
    const horizontalGap = 50;
    const verticalGap = 80;
    const diagramPadding = 20;

    levels.forEach((levelTasks, lvlIdx) => {
      const levelWidth = levelTasks.length * (nodeWidth + horizontalGap) - horizontalGap;
      let currentX = diagramPadding + ( (levels.reduce((max, l) => Math.max(max, l.length), 0) * (nodeWidth + horizontalGap) - horizontalGap) - levelWidth) / 2; // Center level
      levelTasks.forEach(taskId => {
        positions[taskId] = { x: currentX, y: diagramPadding + lvlIdx * (nodeHeight + verticalGap), level: lvlIdx };
        currentX += nodeWidth + horizontalGap;
      });
    });
     // Fallback for any nodes missed (e.g. cycles, though this simple layout doesn't handle them well)
    tasks.forEach(task => {
        if (!positions[task.id]) {
            positions[task.id] = { x: Math.random() * 600 + 50, y: Math.random() * 400 + 50, level: levels.length };
        }
    });


    return positions;
  }, [tasks]);

  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    setSimulationTime(0);
    setTasks(JSON.parse(JSON.stringify(initialTasks))); // Deep copy
    setAgents(JSON.parse(JSON.stringify(initialAgents)));
    setSelectedTask(null);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSimulationTime(prev => prev + 1);
        // Simulate task progress and agent activity
        setTasks(currentTasks => currentTasks.map(task => {
          if (task.status === 'pending') {
            const depsCompleted = task.dependencies.every(depId => currentTasks.find(t => t.id === depId)?.status === 'completed');
            if (depsCompleted) {
              const availableAgent = agents.find(a => a.status === 'idle' && 
                ( (task.name.toLowerCase().includes("web") && a.type === 'Web') ||
                  (task.name.toLowerCase().includes("image") && a.type === 'Vision') ||
                  (task.name.toLowerCase().includes("code") && a.type === 'Code') ||
                  (task.name.toLowerCase().includes("draft") && a.type === 'LLM') ||
                  (task.name.toLowerCase().includes("validate") && a.type === 'Evaluator') ||
                  (!task.name.toLowerCase().includes("web") && !task.name.toLowerCase().includes("image") && !task.name.toLowerCase().includes("code") && !task.name.toLowerCase().includes("draft") && !task.name.toLowerCase().includes("validate")) 
                )
              );
              if (availableAgent) {
                setAgents(prevAgents => prevAgents.map(a => a.id === availableAgent.id ? {...a, status: 'busy', currentTaskId: task.id, messages: [...a.messages, `Started ${task.name}`]} : a));
                return { ...task, status: 'active', assignedAgentId: availableAgent.id, startTime: simulationTime, progress: 0, confidence: Math.random() * 0.3 };
              }
            }
          } else if (task.status === 'active') {
            let newProgress = task.progress + Math.random() * 15;
            let newConfidence = task.confidence + Math.random() * 0.1;
            if (newProgress >= 100) {
              newProgress = 100;
              // Simulate debate/conflict
              if (task.name.toLowerCase().includes("validate") || task.name.toLowerCase().includes("review")) {
                 if (Math.random() < 0.3) { // 30% chance of entering debate
                    setAgents(prevAgents => prevAgents.map(a => a.id === task.assignedAgentId ? {...a, messages: [...a.messages, `Debating on ${task.name}...`]} : a));
                    return {...task, status: 'debating', progress: newProgress, confidence: Math.min(newConfidence, 1), resultSummary: "Awaiting debate resolution."};
                 }
              }
              
              setAgents(prevAgents => prevAgents.map(a => a.id === task.assignedAgentId ? {...a, status: 'idle', currentTaskId: null, utilization: {...a.utilization, cpu: Math.max(5, a.utilization.cpu - 5)}, messages: [...a.messages, `Completed ${task.name}`] } : a));
              return { ...task, status: 'completed', endTime: simulationTime, progress: 100, confidence: Math.min(newConfidence, 1), resultSummary: `Output for ${task.name} generated.` };
            }
            // Simulate agent sending a message
            if(Math.random() < 0.1) {
                setAgents(prevAgents => prevAgents.map(a => a.id === task.assignedAgentId ? {...a, messages: [...a.messages, `Update on ${task.name}: ${newProgress.toFixed(0)}% done.`]} : a));
            }
            return { ...task, progress: newProgress, confidence: Math.min(newConfidence, 1) };
          } else if (task.status === 'debating') {
            // Simulate debate resolution
            if (Math.random() < 0.4) {
                setAgents(prevAgents => prevAgents.map(a => a.id === task.assignedAgentId ? {...a, status: 'idle', currentTaskId: null, messages: [...a.messages, `Debate on ${task.name} resolved.`] } : a));
                return { ...task, status: 'completed', endTime: simulationTime, confidence: task.confidence + Math.random() * 0.2, resultSummary: `Output for ${task.name} (post-debate).`, conflicts: Math.random() < 0.5 ? ["Minor discrepancy found and resolved."] : undefined };
            }
          }
          return task;
        }));
        setAgents(currentAgents => currentAgents.map(agent => ({
          ...agent,
          utilization: {
            cpu: agent.status === 'busy' ? Math.min(100, agent.utilization.cpu + Math.random() * 5) : Math.max(5, agent.utilization.cpu - Math.random() * 3),
            gpu: agent.status === 'busy' ? Math.min(100, agent.utilization.gpu + Math.random() * 8) : Math.max(2, agent.utilization.gpu - Math.random() * 4),
            ram: agent.status === 'busy' ? Math.min(100, agent.utilization.ram + Math.random() * 6) : Math.max(10, agent.utilization.ram - Math.random() * 2),
          }
        })));

        if (tasks.every(t => t.status === 'completed' || t.status === 'failed')) {
            setIsRunning(false);
        }

      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, simulationTime, agents, tasks]);

  const allTasksCompleted = tasks.every(t => t.status === 'completed' || t.status === 'failed');


  return (
    <div className="space-y-12">
      <header className="flex flex-col items-center text-center space-y-4">
         <motion.div
          animate={{ 
            scale: [1, 1.1, 1], 
            filter: ['drop-shadow(0 0 0.2rem hsl(var(--accent)))', 'drop-shadow(0 0 0.8rem hsl(var(--accent)))', 'drop-shadow(0 0 0.2rem hsl(var(--accent)))'] 
          }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
        <Zap className="w-20 h-20 text-accent" />
        </motion.div>
        <div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-pink-500">
                Parallel Processing Core
            </h1>
            <p className="text-xl text-muted-foreground mt-3 max-w-3xl mx-auto">
                NeuroVichar's real-time, multi-agent orchestration engine. Witness intelligent task deconstruction, concurrent execution, and collaborative AI synthesis.
            </p>
        </div>
         <div className="flex gap-4 pt-4">
            <Button size="lg" onClick={() => setIsRunning(!isRunning)} disabled={allTasksCompleted && isRunning} className="text-lg px-8 py-6 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
              {isRunning ? <><Pause className="mr-2 h-5 w-5" /> Pause Simulation</> : <><Play className="mr-2 h-5 w-5" /> Start Simulation</>}
            </Button>
            <Button size="lg" variant="outline" onClick={resetSimulation} className="text-lg px-8 py-6 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
              <RefreshCw className="mr-2 h-5 w-5" /> Reset
            </Button>
        </div>
         <p className="text-sm text-muted-foreground">Simulation Time: {simulationTime}s</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Main DAG Visualization */}
        <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
            <Card className="shadow-2xl bg-card/85 backdrop-blur-md border-primary/20 min-h-[700px] relative overflow-auto">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2 text-foreground/95"><GitFork className="w-7 h-7 text-primary"/>Dynamic Task Execution Graph (DAG)</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">Live visualization of subtask deconstruction, dependencies, and parallel execution.</CardDescription>
                </CardHeader>
                <CardContent className="relative h-[550px]"> {/* Ensure content area has height for absolute positioning */}
                 <svg width="100%" height="100%" className="absolute top-0 left-0 pointer-events-none">
                    <defs>
                        <marker id="arrow" viewBox="0 -5 10 10" refX="8" refY="0" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M0,-5L10,0L0,5" className="fill-primary/60" />
                        </marker>
                    </defs>
                    {tasks.map(task => 
                        task.dependencies.map(depId => {
                        const sourceNode = tasks.find(t => t.id === depId);
                        const sourcePos = sourceNode ? nodePositions[depId] : null;
                        const targetPos = nodePositions[task.id];
                        if (!sourcePos || !targetPos) return null;
                        
                        // Adjust positions for node centers
                        const sx = sourcePos.x + 160 / 2; // nodeWidth / 2
                        const sy = sourcePos.y + 90 / 2;  // nodeHeight / 2
                        const tx = targetPos.x + 160 / 2;
                        const ty = targetPos.y + 90 / 2;

                        return <EdgeLine key={`${depId}-${task.id}`} sourcePos={{x: sx, y: sy}} targetPos={{x: tx, y: ty}} isCompleted={sourceNode?.status === 'completed'} />;
                        })
                    )}
                 </svg>
                  {tasks.map(task => {
                    const pos = nodePositions[task.id];
                    if (!pos) return null;
                    return <TaskNode key={task.id} task={task} onClick={() => setSelectedTask(task)} style={{ left: pos.x, top: pos.y }} />;
                  })}
                </CardContent>
            </Card>
        </motion.div>

        {/* Agent Status & Selected Task Details */}
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
            <Card className="shadow-xl bg-card/75 backdrop-blur-md border-primary/15">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2 text-foreground/90"><Network className="w-6 h-6 text-accent"/>AI Agent Status</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">Overview of active and idle AI micro-agents.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[280px] pr-3">
                        <div className="space-y-3">
                        {agents.map(agent => (
                            <motion.div 
                                key={agent.id}
                                layout
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 border rounded-md bg-muted/50 shadow-sm"
                            >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-foreground">{agent.name} ({agent.type})</span>
                                <Badge variant={agent.status === 'idle' ? 'default' : agent.status === 'busy' ? 'secondary' : 'destructive'} className={cn(agent.status === 'busy' && "bg-accent text-accent-foreground")}>
                                {agent.status}
                                </Badge>
                            </div>
                            {agent.status === 'busy' && agent.currentTaskId && <p className="text-xs text-muted-foreground truncate">Task: {tasks.find(t=>t.id === agent.currentTaskId)?.name || 'Unknown'}</p>}
                            <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground mt-1.5">
                                <span>CPU: {agent.utilization.cpu}%</span>
                                <span>GPU: {agent.utilization.gpu}%</span>
                                <span>RAM: {agent.utilization.ram}%</span>
                            </div>
                             {agent.messages.length > 0 && (
                                <Accordion type="single" collapsible className="w-full mt-1 -mx-1">
                                    <AccordionItem value="messages" className="border-none">
                                        <AccordionTrigger className="text-xs font-medium hover:no-underline text-muted-foreground/80 py-1 px-1 text-left">
                                            View Agent Log ({agent.messages.length})
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-1">
                                            <ScrollArea className="h-[60px] bg-background/50 p-1.5 rounded border text-xs">
                                                {agent.messages.map((msg, i) => <p key={i} className="truncate">{msg}</p>)}
                                            </ScrollArea>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                             )}
                            </motion.div>
                        ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <AnimatePresence>
            {selectedTask && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                <Card className="shadow-xl bg-card/75 backdrop-blur-md border-accent/20">
                    <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2 text-foreground/90"><Settings className="w-6 h-6 text-accent"/>Task Details: {selectedTask.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">Status: <span className="font-medium capitalize">{selectedTask.status}</span></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>ID:</strong> {selectedTask.id}</p>
                        <p><strong>Assigned Agent:</strong> {selectedTask.assignedAgentId || 'None'}</p>
                        <p><strong>Confidence:</strong> {selectedTask.confidence.toFixed(2)}</p>
                        <p><strong>Progress:</strong> {selectedTask.progress}%</p>
                        {selectedTask.startTime !== null && <p><strong>Start Time:</strong> {selectedTask.startTime}s</p>}
                        {selectedTask.endTime !== null && <p><strong>End Time:</strong> {selectedTask.endTime}s</p>}
                        {selectedTask.dependencies.length > 0 && <p><strong>Dependencies:</strong> {selectedTask.dependencies.join(', ')}</p>}
                        {selectedTask.resultSummary && <p className="mt-2 pt-2 border-t"><strong>Summary:</strong> {selectedTask.resultSummary}</p>}
                         {selectedTask.conflicts && selectedTask.conflicts.length > 0 && <p className="mt-1 text-destructive/80 text-xs"><strong>Conflicts:</strong> {selectedTask.conflicts.join(', ')}</p>}
                    </CardContent>
                </Card>
                </motion.div>
            )}
            </AnimatePresence>
        </motion.div>
      </div>

      <Separator className="my-12 bg-border/60" />

      <section className="space-y-8">
        <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Advanced Orchestration Concepts</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">NeuroVichar's Parallel Processing Core goes beyond simple concurrency.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Cpu className="w-7 h-7 text-primary"/>Self-Balancing Workload</CardTitle>
                </CardHeader>
                <CardContent>
                    <Image src="https://picsum.photos/seed/workload/400/200" alt="Workload Balancing" width={400} height={200} className="rounded-md mb-3 shadow-md" data-ai-hint="server cluster" />
                    <p className="text-muted-foreground text-sm">The system dynamically monitors resource utilization (CPU, GPU, RAM) across available compute nodes (containers, edge devices, cloud instances). It intelligently redistributes tasks in real-time to optimize performance, ensure failover resilience, and minimize idle time. This ensures efficient use of all processing capabilities.</p>
                </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquare className="w-7 h-7 text-accent"/>Inter-Agent Collaboration</CardTitle>
                </CardHeader>
                <CardContent>
                    <Image src="https://picsum.photos/seed/collaboration/400/200" alt="Agent Collaboration" width={400} height={200} className="rounded-md mb-3 shadow-md" data-ai-hint="team discussion" />
                    <p className="text-muted-foreground text-sm">AI agents operate with sophisticated messaging protocols, enabling them to cross-validate findings, send confidence scores, share contextual markers, and even issue rebuttals. This simulates a collaborative reasoning process, leading to more refined and robust outcomes than isolated agent execution.</p>
                </CardContent>
            </Card>
             <Card className="shadow-lg hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BrainCircuit className="w-7 h-7 text-green-500"/>Cognitive Overlap Detection</CardTitle>
                </CardHeader>
                <CardContent>
                    <Image src="https://picsum.photos/seed/overlap/400/200" alt="Cognitive Overlap" width={400} height={200} className="rounded-md mb-3 shadow-md" data-ai-hint="venn diagram" />
                    <p className="text-muted-foreground text-sm">A unique logic module actively scans for redundancies or contradictions across the results generated by parallel-running agents. This "cognitive overlap detector" flags potential conflicts and can trigger self-correction mechanisms or debates during the final response synthesis phase, ensuring a coherent and accurate final output.</p>
                </CardContent>
            </Card>
        </div>
      </section>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="mt-12 text-center"
        >
            <Card className="inline-block p-8 shadow-2xl bg-gradient-to-tr from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/30 rounded-xl backdrop-blur-lg">
                <Lightbulb className="w-16 h-16 text-accent mx-auto mb-5 animate-pulse" />
                <h3 className="text-2xl font-bold text-foreground mb-3">The Future of Intelligent Automation</h3>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    NeuroVichar's Parallel Processing Core is not just about speed; it's about building a decentralized, intelligent reasoning engine. 
                    By simulating cognitive processes like task deconstruction, parallel thought, collaborative debate, and synthesized understanding, 
                    we are pushing the boundaries of what AI can achieve.
                </p>
            </Card>
        </motion.div>


    </div>
  );
}

    