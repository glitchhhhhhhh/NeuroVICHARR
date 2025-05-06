'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Brain, Zap, Share2, SearchCode, Globe, Image as ImageIcon, DollarSign } from "lucide-react"; // Removed unused Settings2, Users, Package
import Link from "next/link";
import { motion } from 'framer-motion';

const aiFeatures = [
  {
    title: "Neuro Synapse",
    description: "Intelligently divides prompts and delegates to AI agents.",
    icon: <Brain className="w-8 h-8 text-accent" />,
    href: "/neuro-synapse",
    tag: "Core AI Engine"
  },
  {
    title: "AI Image Generation",
    description: "Create stunning visuals from textual descriptions.",
    icon: <ImageIcon className="w-8 h-8 text-accent" />,
    href: "/ai-image-generation",
    tag: "Creative Suite"
  },
  {
    title: "Neural Interface",
    description: "Intuitive LLM-powered prompt submission & context awareness.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain-circuit text-accent"><path d="M12 5a3 3 0 1 0-5.997.125"/><path d="M12 5a3 3 0 1 1 5.997.125"/><path d="M15 11a3 3 0 1 0-5.997.125"/><path d="M15 11a3 3 0 1 1 5.997.125"/><path d="M9 11a3 3 0 1 0-5.997.125"/><path d="M9 11a3 3 0 1 1 5.997.125"/><path d="M12 17a3 3 0 1 0-5.997.125"/><path d="M12 17a3 3 0 1 1 5.997.125"/><path d="M14 5.5a3 3 0 0 0-2-1"/><path d="M10 5.5a3 3 0 0 1 2-1"/><path d="M17 11.5a3 3 0 0 0-2-1"/><path d="M13 11.5a3 3 0 0 1 2-1"/><path d="M11 11.5a3 3 0 0 0-2-1"/><path d="M7 11.5a3 3 0 0 1 2-1"/><path d="M14 17.5a3 3 0 0 0-2-1"/><path d="M10 17.5a3 3 0 0 1 2-1"/></svg>,
    href: "/neural-interface",
    tag: "Interaction AI"
  },
  {
    title: "Live Web Browsing Agents",
    description: "Sandboxed agents for real-time data tracking & summarization.",
    icon: <Globe className="w-8 h-8 text-accent" />,
    href: "/web-browsing",
    tag: "Data Acquisition"
  },
  {
    title: "Revenue Model",
    description: "Sustainable growth through tiered plans, API usage, and B2B solutions.",
    icon: <DollarSign className="w-8 h-8 text-accent" />,
    href: "/revenue-model",
    tag: "Business Strategy"
  },
];

const platformFeatures = [
   {
    title: "Parallel Processing",
    description: "Simultaneous task execution for enhanced efficiency.",
    icon: <Zap className="w-8 h-8 text-primary" />, 
    href: "/parallel-processing",
    tag: "Core Infrastructure"
  },
  {
    title: "Distributed Power Sharing",
    description: "Resilient power sharing between devices.",
    icon: <Share2 className="w-8 h-8 text-primary" />, 
    href: "/distributed-power",
    tag: "Resilience Tech"
  },
  {
    title: "Dynamic Sub-Prompt Decomposition",
    description: "Real-time AI collaboration for unified outputs.",
    icon: <SearchCode className="w-8 h-8 text-primary" />,
    href: "/sub-prompt-decomposition",
    tag: "Advanced AI Orchestration"
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
      ease: [0.6, -0.05, 0.01, 0.99], 
    },
  }),
  hover: {
    scale: 1.04,
    boxShadow: "0px 15px 30px hsla(var(--card-foreground) / 0.15)", // Enhanced shadow
    borderColor: "hsl(var(--accent))",
    transition: { duration: 0.25, ease: "circOut" }
  }
};

const MotionCard = motion(Card);

const FeatureCard: React.FC<{feature: (typeof aiFeatures)[0] | (typeof platformFeatures)[0], index: number, isAI: boolean}> = ({ feature, index, isAI }) => (
  <Link href={feature.href} key={feature.title} className="group block rounded-xl overflow-hidden h-full"> {/* Ensure h-full for parent to take effect */}
    <MotionCard
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
      className="h-full flex flex-col transition-all duration-300 ease-in-out border-2 border-transparent group-hover:border-accent bg-card/80 backdrop-blur-sm group-hover:bg-card/95 group-hover:shadow-accent/10 shadow-lg"
    >
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
          {feature.tag && (
            <span className={`mt-1 inline-block text-xs font-semibold py-0.5 px-2 rounded-full transition-colors ${isAI ? 'bg-primary/10 text-primary group-hover:bg-accent/10 group-hover:text-accent' : 'bg-accent/10 text-accent group-hover:bg-primary/10 group-hover:text-primary'}`}>
              {feature.tag}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 flex-grow"> {/* flex-grow to push description down */}
        <CardDescription className="text-muted-foreground group-hover:text-foreground/90 transition-colors leading-relaxed">
          {feature.description}
        </CardDescription>
      </CardContent>
    </MotionCard>
  </Link>
);


export default function DashboardPage() {
  return (
    <div className="space-y-12">
      <motion.header 
        className="text-center mb-16"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h1 className="text-5xl font-extrabold tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
          Welcome to <span 
            className="bg-gradient-to-r from-primary via-accent to-pink-500 text-transparent bg-clip-text animate-gradient-x"
            style={{backgroundSize: '200% 200%'}}
          >NeuroVichar</span>
        </h1>
        <p className="text-xl text-muted-foreground mt-5 sm:text-2xl max-w-3xl mx-auto">
          An intelligent platform for collaborative AI-driven insights, pushing the boundaries of what's possible.
        </p>
      </motion.header>

      <div>
        <motion.h2 
          className="text-3xl font-bold mb-8 text-foreground sm:text-4xl text-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          AI-Powered Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiFeatures.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} isAI={true} />
          ))}
        </div>
      </div>

      <div className="mt-16">
        <motion.h2 
          className="text-3xl font-bold mb-8 text-foreground sm:text-4xl text-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Core Platform Capabilities
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformFeatures.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index + aiFeatures.length} isAI={false}/>
          ))}
        </div>
      </div>

      <motion.section 
        className="mt-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (aiFeatures.length + platformFeatures.length) * 0.07 + 0.3, duration: 0.6 }}
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
            <div className="mt-8 flex justify-center gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-accent/30 transition-all transform hover:scale-105 active:scale-95">
                    <Link href="/neuro-synapse">
                        <Brain className="mr-2" /> Explore Neuro Synapse
                    </Link>
                </Button>
                 <Button asChild size="lg" variant="outline" className="shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95">
                    <Link href="/ai-image-generation">
                       <ImageIcon className="mr-2"/> Create Images
                    </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 5s ease infinite;
        }
      `}</style>
    </div>
  );
}

