
'use client';
import * as React from 'react'; // Added React import
import { type NeuroSynapseOutput, type SubTask as PageSubTask, type ToolUsage as PageToolUsage, type EthicalCompliance as PageEthicalCompliance } from '@/ai/flows/neuro-synapse-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Brain, Zap, Workflow, MessageSquare, Activity, CheckCircle2, AlertCircle, Lightbulb, Users, Wrench, ImageUp, Image as ImageIcon, Share2, SearchCode, SlidersHorizontal, BrainCircuit, TimerOff, ShieldCheck, Wand2, FileText, LinkIcon, Server, Edit3, type LucideIcon } from "lucide-react";

// These components can be co-located or imported if they are in separate files
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

const WorkflowDiagramNode: React.FC<{ node: NeuroSynapseOutput['workflowDiagramData']['nodes'][0], style: React.CSSProperties, isActive?: boolean }> = ({ node, style, isActive }) => (
  <motion.div
    style={style}
    className="absolute transform transition-all duration-500 ease-out"
    initial={{ opacity: 0, scale: 0.5, ...style }}
    animate={{ 
        opacity: 1, 
        scale: 1, 
        ...style,
        boxShadow: isActive ? `0 0 20px 5px hsla(var(--accent), 0.7)` : `0 10px 15px -3px hsla(var(--card-foreground)/0.1), 0 4px 6px -2px hsla(var(--card-foreground)/0.05)`,
        borderColor: isActive ? `hsla(var(--accent), 0.9)` : `hsla(var(--primary)/0.2)`
    }}
    exit={{ opacity: 0, scale: 0.5 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
  >
    <Card className={cn("w-40 h-28 p-2.5 flex flex-col items-center justify-center text-center transition-all duration-300 border-2 group bg-card/90 backdrop-blur-sm", isActive && "ring-2 ring-accent ring-offset-2 ring-offset-background")}>
      <NodeIcon type={node.type} className="w-8 h-8 mb-1.5 transition-transform group-hover:scale-110" />
      <span className="text-xs font-semibold text-foreground/95 truncate w-full px-1 group-hover:text-accent transition-colors">{node.label}</span>
      <span className="text-[10px] text-muted-foreground group-hover:text-accent/80 transition-colors">({node.type})</span>
       {isActive && <motion.div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />}
    </Card>
  </motion.div>
);

const WorkflowDiagramEdge: React.FC<{
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
  edge: NeuroSynapseOutput['workflowDiagramData']['edges'][0];
  delay: number;
  isActive?: boolean;
}> = ({ sourcePos, targetPos, edge, delay, isActive }) => {
  const nodeWidth = 160; 
  const nodeHeight = 112; 

  const sx = sourcePos.x + nodeWidth / 2;
  const sy = sourcePos.y + nodeHeight; 
  const tx = targetPos.x + nodeWidth / 2;
  const ty = targetPos.y; 
  
  const c1x = sx;
  const c1y = sy + (ty - sy) * 0.4;
  const c2x = tx;
  const c2y = ty - (ty - sy) * 0.4;

  const pathD = `M ${sx},${sy} C ${c1x},${c1y} ${c2x},${c2y} ${tx},${ty}`;

  return (
    <>
    <motion.path
      key={edge.id}
      d={pathD}
      strokeWidth={isActive ? "3" : "2"}
      markerEnd="url(#arrowhead)" // Ensure #arrowhead is defined in SVG defs
      className={cn(isActive ? "stroke-accent" : "stroke-primary/70 dark:stroke-primary/50", "transition-all duration-300")}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: isActive ? 1 : 0.8 }}
      transition={{ duration: 1, delay: delay + 0.2, ease: "circOut" }}
    />
    {edge.label && (
       <motion.text
          x={(sx + tx) / 2}
          y={(sy + ty) / 2 - 8} 
          textAnchor="middle"
          className={cn("fill-muted-foreground text-[10px] font-medium", isActive && "fill-accent font-semibold")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: delay + 0.7, duration: 0.5 }}
        >
          {edge.label}
        </motion.text>
    )}
    </>
  );
};

const WorkflowDiagram: React.FC<{ data: NeuroSynapseOutput['workflowDiagramData'] | undefined, activeNodeIds?: string[] }> = ({ data, activeNodeIds = [] }) => {
    const nodePositions = React.useMemo(() => { 
      if (!data || !data.nodes || !data.nodes.length) return {};
      const positions: { [key: string]: { x: number; y: number } } = {};
      const nodeWidth = 160;
      const nodeHeight = 112;
      const horizontalGap = 60; 
      const verticalGap = 70; 
      const diagramPadding = 30;

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
          graph[u]?.forEach(v => {
            inDegree[v]--;
            if (inDegree[v] === 0) {
              nextQueue.push(v);
            }
          });
        }
        queue = nextQueue;
      }
      
       if (data.nodes.length !== levels.flat().length) {
        data.nodes.forEach(node => {
          if (!levels.flat().includes(node.id)) {
            if (levels.length === 0) levels.push([]);
            levels[levels.length - 1].push(node.id); 
          }
        });
      }

      let currentY = diagramPadding;
      levels.forEach((levelNodes) => {
        const maxNodesInLevel = levels.reduce((max, l) => Math.max(max, l.length), 0);
        const totalDiagramWidth = maxNodesInLevel * (nodeWidth + horizontalGap) - horizontalGap;
        const levelWidth = levelNodes.length * (nodeWidth + horizontalGap) - horizontalGap;
        let currentX = diagramPadding + (totalDiagramWidth - levelWidth) / 2; 
        
        levelNodes.forEach(nodeId => {
          positions[nodeId] = { x: currentX, y: currentY };
          currentX += nodeWidth + horizontalGap;
        });
        currentY += nodeHeight + verticalGap;
      });
      
      data.nodes.forEach(node => { 
            if (!positions[node.id]) {
                positions[node.id] = { x: Math.random() * 500 + 50, y: Math.random() * 300 + 50 };
            }
      });

      return positions;
    }, [data]);

  if (!data || !data.nodes || !data.nodes.length || !data.edges) {
    return (
      <Card className="p-6 border rounded-lg bg-muted/30 text-center text-muted-foreground shadow-inner min-h-[650px] flex items-center justify-center">
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
  const maxXCanvas = Math.max(800, ...allX) + 160 + 40; 
  const maxYCanvas = Math.max(600, ...allY) + 112 + 40;


  return (
    <Card className="p-4 border-2 border-primary/20 rounded-xl bg-gradient-to-br from-card to-muted/10 shadow-2xl overflow-auto min-h-[650px] relative">
      <svg width={maxXCanvas - minX + 40} height={maxYCanvas - minY + 40} viewBox={`${minX - 20} ${minY - 20} ${maxXCanvas - minX + 40} ${maxYCanvas - minY + 40}`} className="min-w-full min-h-full">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 10 3.5, 0 7" className="fill-primary/80 group-hover:fill-accent transition-colors" />
          </marker>
        </defs>
        <g className="edges">
          {data.edges.map((edge, index) => {
            const sourcePos = nodePositions[edge.source];
            const targetPos = nodePositions[edge.target];
            if (!sourcePos || !targetPos) return null;
            const edgeIsActive = activeNodeIds.includes(edge.source) && activeNodeIds.includes(edge.target);
            return <WorkflowDiagramEdge key={edge.id} sourcePos={sourcePos} targetPos={targetPos} edge={edge} delay={0.5 + index * 0.1} isActive={edgeIsActive} />;
          })}
        </g>
      </svg>
      <div className="nodes absolute top-0 left-0">
        {data.nodes.map(node => {
            const pos = nodePositions[node.id];
            if (!pos) return null; 
            return <WorkflowDiagramNode key={node.id} node={node} style={{ left: pos.x, top: pos.y }} isActive={activeNodeIds.includes(node.id)} />;
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
      <Card className={cn(`mb-3.5 shadow-lg transition-all hover:shadow-xl border-l-4 overflow-hidden rounded-lg`, statusColorClass, statusBgClass)}>
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

interface NeuroSynapseResultDisplayProps {
  result: NeuroSynapseOutput;
  activeDiagramNodes?: string[];
}

const NeuroSynapseResultDisplay: React.FC<NeuroSynapseResultDisplayProps> = ({ result, activeDiagramNodes = [] }) => {
  if (!result) return null;

  // If activeDiagramNodes is empty, make all nodes active for full view
  const diagramNodesToActivate = activeDiagramNodes.length > 0 ? activeDiagramNodes : (result.workflowDiagramData?.nodes.map(n => n.id) || []);


  return (
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
          <WorkflowDiagram data={result.workflowDiagramData} activeNodeIds={diagramNodesToActivate} />
        </motion.section>
      </CardContent>
    </Card>
  );
};

export default NeuroSynapseResultDisplay;
