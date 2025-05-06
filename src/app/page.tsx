
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, Share2, SearchCode, Globe, BrainCircuit } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Neuro Synapse",
    description: "Intelligently divides prompts and delegates to AI agents.",
    icon: <Brain className="w-8 h-8 text-accent" />,
    href: "/neuro-synapse",
    ai: true,
  },
  {
    title: "Parallel Processing",
    description: "Simultaneous task execution for enhanced efficiency.",
    icon: <Zap className="w-8 h-8 text-accent" />,
    href: "/parallel-processing",
    ai: false,
  },
  {
    title: "Neural Interface",
    description: "Intuitive LLM-powered prompt submission.",
    icon: <BrainCircuit className="w-8 h-8 text-accent" />,
    href: "/neural-interface",
    ai: true,
  },
  {
    title: "Distributed Power Sharing",
    description: "Resilient power sharing between devices.",
    icon: <Share2 className="w-8 h-8 text-accent" />,
    href: "/distributed-power",
    ai: false,
  },
  {
    title: "Dynamic Sub-Prompt Decomposition",
    description: "Real-time AI collaboration for unified outputs.",
    icon: <SearchCode className="w-8 h-8 text-accent" />,
    href: "/sub-prompt-decomposition",
    ai: true,
  },
  {
    title: "Live Web Browsing Agents",
    description: "Sandboxed agents for real-time data tracking.",
    icon: <Globe className="w-8 h-8 text-accent" />,
    href: "/web-browsing",
    ai: true,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome to NeuroVichar</h1>
        <p className="text-lg text-muted-foreground mt-2">
          An intelligent platform for collaborative AI-driven insights.
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link href={feature.href} key={feature.title} className="group">
              <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:border-accent transform hover:-translate-y-1">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                  <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl group-hover:text-accent transition-colors">{feature.title}</CardTitle>
                    {feature.ai && (
                       <span className="text-xs font-semibold bg-primary/10 text-primary py-0.5 px-1.5 rounded-full group-hover:bg-accent/10 group-hover:text-accent transition-colors">GenAI</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground group-hover:text-foreground transition-colors">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Explore the features above or dive into creating your first intelligent prompt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              NeuroVichar empowers you to harness the collective intelligence of multiple AI agents,
              seamlessly integrating diverse data sources and processing capabilities.
              Start by exploring the Neuro Synapse or try out the Live Web Browsing Agents.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
