import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import Image from "next/image";

export default function ParallelProcessingPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center space-x-4">
        <Zap className="w-12 h-12 text-accent" />
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Parallel Processing</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Enables simultaneous execution of multiple tasks, enhancing overall system efficiency.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Boost Your Workflow</CardTitle>
          <CardDescription>
            Our Parallel Processing capability allows NeuroVichar to handle multiple operations concurrently. This means faster response times, improved throughput, and a more efficient system overall, especially when dealing with complex AI-driven tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
             <Image 
              src="https://picsum.photos/800/400?random=2" 
              alt="Parallel Processing illustration" 
              width={800} 
              height={400} 
              className="rounded-lg shadow-md"
              data-ai-hint="flowchart parallel"
            />
          </div>
          <h3 className="text-xl font-semibold">Key Benefits</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Reduced latency for complex queries.</li>
            <li>Increased capacity to handle more requests simultaneously.</li>
            <li>Optimized resource utilization.</li>
            <li>Smoother user experience with quicker results.</li>
          </ul>
           <p className="text-sm text-muted-foreground">
            This feature is fundamental to NeuroVichar's architecture.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
