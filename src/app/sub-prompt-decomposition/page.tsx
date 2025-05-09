'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchCode, GitFork, Brain, Users, Target } from "lucide-react";
import { motion } from "framer-motion";
import Image from 'next/image';

export default function SubPromptDecompositionPage() {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay, ease: "easeOut" },
    }),
  };

  return (
    <div className="space-y-10">
      <motion.header 
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="flex items-center space-x-6"
      >
        <SearchCode className="w-14 h-14 text-accent drop-shadow-lg" />
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">Dynamic Sub-Prompt Decomposition</h1>
          <p className="text-xl text-muted-foreground mt-2 max-w-2xl">
            Real-time collaboration among AI agents and external models to synthesize unified outputs through intelligent task breakdown.
          </p>
        </div>
      </motion.header>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={0.1}
      >
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Intelligent Task Breakdown & Synthesis</CardTitle>
            <CardDescription className="text-base">
              Dynamic Sub-Prompt Decomposition is an advanced mechanism that allows NeuroVichar to break down complex user requests into smaller, more manageable sub-prompts in real-time. This enables multiple AI agents and even external models to collaborate effectively, each contributing their specialized knowledge to synthesize a unified, comprehensive output.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-center bg-muted/30 p-6 rounded-lg border border-primary/20 shadow-inner">
              <GitFork className="w-24 h-24 text-primary opacity-70 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-foreground/90">Key Capabilities:</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-base">
                  <li>Adapts to the complexity and nuances of user prompts using advanced NLP.</li>
                  <li>Dynamically identifies the optimal way to divide tasks for parallel or sequential processing.</li>
                  <li>Facilitates seamless collaboration between internal AI agents (LLMs, vision, web) and external models/tools.</li>
                  <li>Ensures coherent and contextually relevant integration of diverse information sources.</li>
                  <li>Optimizes for both speed and quality of the final synthesized output.</li>
                  <li>Supports conditional logic and branching in task execution based on intermediate results.</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic pt-2">
              This sophisticated decomposition and synthesis process is a core component of NeuroVichar's advanced reasoning capabilities, enabling it to tackle highly complex problems.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={0.2}
      >
        <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">How It Works: A Conceptual Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-muted/40 rounded-lg border border-border/50 shadow-sm">
                <Brain className="w-12 h-12 text-accent mx-auto mb-3" />
                <h4 className="font-semibold text-lg text-foreground/90">1. Prompt Ingestion & Analysis</h4>
                <p className="text-sm text-muted-foreground">User prompt is received and deeply analyzed for intent, entities, and complexity.</p>
              </div>
              <div className="p-4 bg-muted/40 rounded-lg border border-border/50 shadow-sm">
                <Users className="w-12 h-12 text-accent mx-auto mb-3" />
                <h4 className="font-semibold text-lg text-foreground/90">2. Decomposition & Agent Assignment</h4>
                <p className="text-sm text-muted-foreground">Prompt is broken into sub-tasks. Optimal AI agents are assigned to each sub-task.</p>
              </div>
              <div className="p-4 bg-muted/40 rounded-lg border border-border/50 shadow-sm">
                <Target className="w-12 h-12 text-accent mx-auto mb-3" />
                <h4 className="font-semibold text-lg text-foreground/90">3. Execution & Synthesis</h4>
                <p className="text-sm text-muted-foreground">Agents process sub-tasks (potentially in parallel). Results are synthesized into a final, coherent response.</p>
              </div>
            </div>
            <p className="text-muted-foreground pt-4 text-sm leading-relaxed">
              The decomposition isn't static; it can adapt mid-workflow. For example, if an agent returns a result with low confidence or identifies a new required step, the orchestrator can dynamically spawn new sub-prompts or re-assign tasks. This iterative refinement is key to achieving high-quality, comprehensive outputs.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
