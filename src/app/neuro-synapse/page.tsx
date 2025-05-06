import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";
import Image from "next/image";

export default function NeuroSynapsePage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center space-x-4">
        <Brain className="w-12 h-12 text-accent" />
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Neuro Synapse</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Intelligently divides user prompts into subtasks and delegates them across multiple AI agents.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Feature Overview</CardTitle>
          <CardDescription>
            Neuro Synapse orchestrates AI collaboration by breaking down complex prompts into manageable sub-tasks. These are then distributed among specialized AI agents. The results are intelligently merged to provide a comprehensive and refined output, all visible in a single, unified view.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Image 
              src="https://picsum.photos/800/400?random=1" 
              alt="Neuro Synapse illustration" 
              width={800} 
              height={400} 
              className="rounded-lg shadow-md"
              data-ai-hint="network abstract" 
            />
          </div>
          <h3 className="text-xl font-semibold">How it Works</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Accepts complex user prompts.</li>
            <li>Decomposes prompts into smaller, actionable sub-tasks.</li>
            <li>Delegates sub-tasks to appropriate AI agents.</li>
            <li>Agents process their assigned tasks concurrently.</li>
            <li>Merges individual agent outputs into a coherent final result.</li>
            <li>Presents the synthesized information in a clear, consolidated view.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            This feature is currently under development. Check back soon for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
