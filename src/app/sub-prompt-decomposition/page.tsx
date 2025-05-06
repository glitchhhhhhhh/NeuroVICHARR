import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchCode } from "lucide-react";
import Image from "next/image";

export default function SubPromptDecompositionPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center space-x-4">
        <SearchCode className="w-12 h-12 text-accent" />
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Dynamic Sub-Prompt Decomposition</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Real-time collaboration among AI agents and external models to synthesize unified outputs.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Intelligent Task Breakdown</CardTitle>
          <CardDescription>
            Dynamic Sub-Prompt Decomposition is an advanced mechanism that allows NeuroVichar to break down complex user requests into smaller, more manageable sub-prompts in real-time. This enables multiple AI agents and even external models to collaborate effectively, each contributing their specialized knowledge to synthesize a unified, comprehensive output.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Image 
              src="https://picsum.photos/800/400?random=5" 
              alt="Sub-Prompt Decomposition illustration" 
              width={800} 
              height={400} 
              className="rounded-lg shadow-md"
              data-ai-hint="puzzle pieces"
            />
          </div>
          <h3 className="text-xl font-semibold">Key Capabilities</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Adapts to the complexity and nuances of user prompts.</li>
            <li>Dynamically identifies the optimal way to divide tasks.</li>
            <li>Facilitates seamless collaboration between internal AI agents and external models.</li>
            <li>Ensures coherent and contextually relevant integration of diverse information sources.</li>
            <li>Optimizes for both speed and quality of the final synthesized output.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            This sophisticated decomposition and synthesis process is currently under active research and development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
