'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, Share2, SearchCode, Globe, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { motion } from 'framer-motion';

const aiFeatures = [
  {
    title: "Neuro Synapse",
    description: "Intelligently divides prompts and delegates to AI agents.",
    icon: <Brain className="w-8 h-8 text-accent" />,
    href: "/neuro-synapse",
  },
  {
    title: "AI Image Generation",
    description: "Create stunning visuals from textual descriptions.",
    icon: <ImageIcon className="w-8 h-8 text-accent" />,
    href: "/ai-image-generation",
  },
  {
    title: "Neural Interface",
    description: "Intuitive LLM-powered prompt submission.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain-circuit text-accent"><path d="M12 5a3 3 0 1 0-5.997.125"/><path d="M12 5a3 3 0 1 1 5.997.125"/><path d="M15 11a3 3 0 1 0-5.997.125"/><path d="M15 11a3 3 0 1 1 5.997.125"/><path d="M9 11a3 3 0 1 0-5.997.125"/><path d="M9 11a3 3 0 1 1 5.997.125"/><path d="M12 17a3 3 0 1 0-5.997.125"/><path d="M12 17a3 3 0 1 1 5.997.125"/><path d="M14 5.5a3 3 0 0 0-2-1"/><path d="M10 5.5a3 3 0 0 1 2-1"/><path d="M17 11.5a3 3 0 0 0-2-1"/><path d="M13 11.5a3 3 0 0 1 2-1"/><path d="M11 11.5a3 3 0 0 0-2-1"/><path d="M7 11.5a3 3 0 0 1 2-1"/><path d="M14 17.5a3 3 0 0 0-2-1"/><path d="M10 17.5a3 3 0 0 1 2-1"/></svg>,
    href: "/neural-interface",
  },
  {
    title: "Dynamic Sub-Prompt Decomposition",
    description: "Real-time AI collaboration for unified outputs.",
    icon: <SearchCode className="w-8 h-8 text-accent" />,
    href: "/sub-prompt-decomposition",
  },
  {
    title: "Live Web Browsing Agents",
    description: "Sandboxed agents for real-time data tracking.",
    icon: <Globe className="w-8 h-8 text-accent" />,
    href: "/web-browsing",
  },
];

const nonAiFeatures = [
   {
    title: "Parallel Processing",
    description: "Simultaneous task execution for enhanced efficiency.",
    icon: <Zap className="w-8 h-8 text-primary" />, // Changed icon color for distinction
    href: "/parallel-processing",
  },
  {
    title: "Distributed Power Sharing",
    description: "Resilient power sharing between devices.",
    icon: <Share2 className="w-8 h-8 text-primary" />, // Changed icon color
    href: "/distributed-power",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.07,
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99], // Custom ease for a more refined spring-like effect
    },
  }),
  hover: {
    scale: 1.04,
    boxShadow: "0px 15px 30px hsla(var(--card-foreground) / 0.12)",
    borderColor: "hsl(var(--accent))",
    transition: { duration: 0.25, ease: "circOut" }
  }
};


const FeatureCard: React.FC<{feature: (typeof aiFeatures)[0] | (typeof nonAiFeatures)[0], index: number, isAI: boolean}> = ({ feature, index, isAI }) => (
  <Link href={feature.href} key={feature.title} className="group block rounded-lg overflow-hidden">
    <motion.custom
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
      className="h-full"
      // @ts-ignore
      as={Card}
    >
      <Card className="h-full transition-all duration-300 ease-in-out border-2 border-transparent group-hover:border-accent bg-card/80 backdrop-blur-sm group-hover:bg-card">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3 pt-5 px-5">
          <motion.div
            className={`p-3 rounded-lg ${isAI ? 'bg-accent/10' : 'bg-primary/10'} group-hover:bg-accent/20 transition-colors`}
            whileHover={{ scale: 1.15, rotate: 7 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            {feature.icon}
          </motion.div>
          <div className="flex-1">
            <CardTitle className="text-xl group-hover:text-accent transition-colors">{feature.title}</CardTitle>
            {isAI && (
              <span className="mt-1 inline-block text-xs font-semibold bg-primary/10 text-primary py-0.5 px-2 rounded-full group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                GenAI Powered
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <CardDescription className="text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
            {feature.description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.custom>
  </Link>
);


export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <motion.header 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Welcome to <span className="text-accent">NeuroVichar</span>
        </h1>
        <p className="text-xl text-muted-foreground mt-4 sm:text-2xl max-w-3xl mx-auto">
          An intelligent platform for collaborative AI-driven insights, pushing the boundaries of what's possible.
        </p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <section className="lg:col-span-3">
          <motion.h2 
            className="text-3xl font-bold mb-6 text-foreground sm:text-4xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            AI-Powered Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiFeatures.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} isAI={true} />
            ))}
          </div>
        </section>

        <section className="lg:col-span-2">
          <motion.h2 
            className="text-3xl font-bold mb-6 text-foreground sm:text-4xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Core Platform Capabilities
          </motion.h2>
          <div className="grid grid-cols-1 gap-6">
            {nonAiFeatures.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index + aiFeatures.length} isAI={false}/>
            ))}
          </div>
        </section>
      </div>

      <motion.section 
        className="mt-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (aiFeatures.length + nonAiFeatures.length) * 0.07 + 0.3, duration: 0.6 }}
      >
        <Card className="shadow-xl hover:shadow-2xl transition-shadow bg-card/70 backdrop-blur-md border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Unlock Your Potential</CardTitle>
            <CardDescription className="text-lg mt-1">
              Explore the features above or dive into creating your first intelligent prompt.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground max-w-2xl mx-auto">
              NeuroVichar empowers you to harness the collective intelligence of multiple AI agents,
              seamlessly integrating diverse data sources and processing capabilities.
              Start by exploring Neuro Synapse or try generating unique visuals with our AI Image Generation tool.
            </p>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}