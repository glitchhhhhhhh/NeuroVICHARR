
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Brain, Zap, Share2, SearchCode, Globe, Image as ImageIconLucide, DollarSign, Lightbulb, Store, Sparkles, Rocket } from "lucide-react";
import Link from "next/link";
import { motion } from 'framer-motion';

const aiFeatures = [
  {
    title: "Idea Catalyst",
    description: "Generates complex questions and starter prompts from a theme.",
    icon: <Lightbulb className="w-8 h-8 text-accent" />,
    href: "/idea-catalyst",
    tag: "Pre-computation AI"
  },
  {
    title: "Neuro Synapse",
    description: "Intelligently divides prompts and delegates to AI agents, with optional image context.",
    icon: <Brain className="w-8 h-8 text-accent" />,
    href: "/neuro-synapse",
    tag: "Core AI Engine"
  },
  {
    title: "AI Image Generation",
    description: "Create stunning visuals from textual descriptions.",
    icon: <ImageIconLucide className="w-8 h-8 text-accent" />,
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
    title: "Plugin Marketplace",
    description: "Extend NeuroVichar with community and official plugins.",
    icon: <Store className="w-8 h-8 text-accent" />,
    href: "/plugin-marketplace",
    tag: "Ecosystem"
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
    boxShadow: "0px 20px 40px hsla(var(--card-foreground) / 0.2)", // Enhanced shadow
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

const AnimatedSectionTitle: React.FC<{ children: React.ReactNode, className?: string, delay?: number }> = ({ children, className, delay = 0.2 }) => (
  <motion.h2
    className={`text-3xl font-bold mb-10 text-foreground sm:text-4xl text-center relative ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
  >
    {children}
    <motion.div
      className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-primary via-accent to-pink-500 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: '6rem' }} // 96px
      transition={{ delay: delay + 0.3, duration: 0.7, ease: "circOut" }}
    />
  </motion.h2>
);


export default function DashboardPage() {
  const heroTitlePrefix = "Welcome to ";
  const heroTitleMain = "NeuroVichar";
  const heroSubtitle = "Vichar Before Prahar";

  const titleVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.08,
        duration: 0.5,
      },
    }),
  };

  return (
    <div className="space-y-16 md:space-y-24 relative overflow-hidden">
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 -z-10 opacity-5 dark:opacity-[0.03]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dashboard-pattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="scale(1) rotate(0)">
              <path d="M10 10 Q20 0 30 10 T50 10" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none"/>
              <path d="M10 30 Q20 20 30 30 T50 30" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none"/>
              <path d="M10 50 Q20 40 30 50 T50 50" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashboard-pattern)" />
        </svg>
      </div>

      <motion.header 
        className="text-center pt-8 pb-12 md:pt-12 md:pb-16"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1 }}
      >
        <motion.h1 
          className="text-5xl font-extrabold tracking-tighter text-foreground sm:text-6xl lg:text-7xl mb-6"
          variants={{
            hidden: { opacity: 0, y: -30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
          }}
        >
          {heroTitlePrefix.split("").map((char, i) => (
            <motion.span key={`prefix-${i}`} variants={titleVariants} custom={i} className="inline-block">
              {char === " " && i > 0 && heroTitlePrefix[i-1] !== " " ? "\u00A0" : char}
            </motion.span>
          ))}
           <motion.span 
              className="bg-gradient-to-r from-primary via-accent to-pink-500 text-transparent bg-clip-text animate-gradient-x ml-1"
              style={{backgroundSize: '200% 200%'}}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: heroTitlePrefix.length * 0.08, duration: 0.5}}
            >
              {heroTitleMain.split("").map((char, i) => (
                <motion.span key={`main-${i}`} variants={titleVariants} custom={heroTitlePrefix.length + i} className="inline-block">
                  {char}
                </motion.span>
              ))}
            </motion.span>
           <motion.span 
              className="text-foreground" // Ensure exclamation mark matches surrounding text or has its own style
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (heroTitlePrefix.length + heroTitleMain.length) * 0.08 + 0.2, duration: 0.5}}
            >!</motion.span>
        </motion.h1>
        <motion.p 
          className="text-xl text-muted-foreground mt-5 sm:text-2xl max-w-3xl mx-auto leading-relaxed"
           variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: (heroTitlePrefix.length + heroTitleMain.length) * 0.08 + 0.3, ease: "easeOut" } }
          }}
        >
          {heroSubtitle}
        </motion.p>
      </motion.header>

      <section>
        <AnimatedSectionTitle delay={0.5}>
          <Sparkles className="inline-block w-10 h-10 mr-3 text-accent transform -translate-y-1" />
          AI-Powered Features
        </AnimatedSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aiFeatures.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} isAI={true} />
          ))}
        </div>
      </section>

      <section className="mt-16 md:mt-24">
        <AnimatedSectionTitle delay={0.7}>
          <Rocket className="inline-block w-10 h-10 mr-3 text-primary transform -translate-y-1" />
          Core Platform Capabilities
        </AnimatedSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {platformFeatures.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index + aiFeatures.length} isAI={false}/>
          ))}
        </div>
      </section>

      <motion.section 
        className="mt-20 md:mt-28"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (aiFeatures.length + platformFeatures.length) * 0.07 + 0.5, duration: 0.6 }}
      >
        <Card className="shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 bg-gradient-to-br from-card via-muted/20 to-card/70 backdrop-blur-lg border-2 border-primary/30 rounded-2xl overflow-hidden">
          <CardHeader className="text-center pt-10 pb-6">
            <motion.div 
              animate={{ y: [0, -5, 0] }} 
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              <Sparkles className="w-16 h-16 text-accent mx-auto mb-4" />
            </motion.div>
            <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-pink-500">Unlock Your Potential</CardTitle>
            <CardDescription className="text-lg mt-2 text-muted-foreground max-w-2xl mx-auto">
              Explore the features above or dive into creating your first intelligent prompt.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center px-6">
            <p className="text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              NeuroVichar empowers you to harness the collective intelligence of multiple AI agents,
              seamlessly integrating diverse data sources and processing capabilities.
              Start by exploring Neuro Synapse or try generating unique visuals with our AI Image Generation tool.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pb-10">
                <Button asChild size="lg" className="text-lg py-7 px-10 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-xl hover:shadow-accent/40 transition-all transform hover:scale-105 active:scale-95 rounded-xl">
                    <Link href="/neuro-synapse">
                        <Brain className="mr-2.5" /> Explore Neuro Synapse
                    </Link>
                </Button>
                 <Button asChild size="lg" variant="outline" className="text-lg py-7 px-10 border-2 border-input hover:border-accent hover:bg-accent/10 hover:text-accent shadow-lg hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 rounded-xl">
                    <Link href="/ai-image-generation">
                       <ImageIconLucide className="mr-2.5"/> Create Images
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

