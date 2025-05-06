import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import Image from "next/image";

export default function DistributedPowerPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center space-x-4">
        <Share2 className="w-12 h-12 text-accent" />
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Distributed Power Sharing</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Ensures resilience with a distributed power-sharing mechanism between devices running the app.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Enhanced Resilience & Performance</CardTitle>
          <CardDescription>
            Distributed Power Sharing allows NeuroVichar instances running on multiple devices to pool their computational resources. This creates a resilient and scalable network, ensuring continuous operation and enhanced performance by distributing workloads effectively.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Image 
              src="https://picsum.photos/800/400?random=4" 
              alt="Distributed Power Sharing illustration" 
              width={800} 
              height={400} 
              className="rounded-lg shadow-md"
              data-ai-hint="network devices"
            />
          </div>
          <h3 className="text-xl font-semibold">Advantages</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Improved fault tolerance: The system remains operational even if some devices go offline.</li>
            <li>Scalable performance: More devices mean more processing power for complex tasks.</li>
            <li>Efficient resource utilization: Workloads are balanced across available devices.</li>
            <li>Decentralized architecture: Reduces reliance on a single point of failure.</li>
          </ul>
           <p className="text-sm text-muted-foreground">
            The distributed power sharing mechanism is a core infrastructural component ensuring the robustness of NeuroVichar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
