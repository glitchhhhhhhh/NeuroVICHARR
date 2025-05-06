import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function NeuralInterfacePage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center space-x-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain-circuit text-accent"><path d="M12 5a3 3 0 1 0-5.997.125"/><path d="M12 5a3 3 0 1 1 5.997.125"/><path d="M15 11a3 3 0 1 0-5.997.125"/><path d="M15 11a3 3 0 1 1 5.997.125"/><path d="M9 11a3 3 0 1 0-5.997.125"/><path d="M9 11a3 3 0 1 1 5.997.125"/><path d="M12 17a3 3 0 1 0-5.997.125"/><path d="M12 17a3 3 0 1 1 5.997.125"/><path d="M14 5.5a3 3 0 0 0-2-1"/><path d="M10 5.5a3 3 0 0 1 2-1"/><path d="M17 11.5a3 3 0 0 0-2-1"/><path d="M13 11.5a3 3 0 0 1 2-1"/><path d="M11 11.5a3 3 0 0 0-2-1"/><path d="M7 11.5a3 3 0 0 1 2-1"/><path d="M14 17.5a3 3 0 0 0-2-1"/><path d="M10 17.5a3 3 0 0 1 2-1"/><circle cx="12" cy="12" r="11"/><path d="M17.5 14a3 3 0 0 0-1-2"/><path d="M17.5 10a3 3 0 0 0-1 2"/><path d="M6.5 14a3 3 0 0 1 1-2"/><path d="M6.5 10a3 3 0 0 1 1 2"/><path d="M14 6.5a3 3 0 0 0-2 1"/><path d="M10 6.5a3 3 0 0 1 2 1"/><path d="M14 17.5a3 3 0 0 0-2-1"/><path d="M10 17.5a3 3 0 0 1 2-1"/></svg>
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
