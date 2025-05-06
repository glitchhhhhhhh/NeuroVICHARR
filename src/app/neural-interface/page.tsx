
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import Image from "next/image";

export default function NeuralInterfacePage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center space-x-4">
        <BrainCircuit className="w-12 h-12 text-accent" />
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Neural Interface</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Accepts user intentions through an LLM-powered neural interface for intuitive prompt submission.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Intuitive Interaction</CardTitle>
          <CardDescription>
            The Neural Interface redefines how you interact with AI. Instead of traditional text or voice commands, it leverages a sophisticated Large Language Model (LLM) to understand your intentions more naturally and intuitively. This allows for more nuanced and complex prompt submissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex justify-center">
            <Image 
              src="https://picsum.photos/800/400?random=3" 
              alt="Neural Interface illustration" 
              width={800} 
              height={400} 
              className="rounded-lg shadow-md"
              data-ai-hint="mind connection"
            />
          </div>
          <h3 className="text-xl font-semibold">Core Concepts</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Understands intent beyond literal commands.</li>
            <li>Allows for more natural language interaction.</li>
            <li>Reduces ambiguity in prompt submission.</li>
            <li>Adapts to individual user communication styles over time.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            This advanced interface is currently in active development. Stay tuned for demonstrations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
