'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, DollarSign, Zap, Users, Briefcase, ShoppingCart, BarChart, Building } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const pricingTiers = [
  {
    name: "Freemium",
    icon: <Users className="w-8 h-8 text-primary" />,
    price: "Free",
    description: "Explore core features and experience the power of NeuroVichar.",
    features: [
      "Basic access to Neuro Synapse",
      "Limited AI image generations",
      "Standard Neural Interface",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "/signup?plan=free",
    highlight: false,
  },
  {
    name: "Pro",
    icon: <Zap className="w-8 h-8 text-accent" />,
    price: "$29",
    pricePeriod: "/month",
    description: "For professionals and power users needing more capacity and advanced features.",
    features: [
      "Full access to Neuro Synapse",
      "High-volume AI image generations",
      "Advanced Neural Interface with context",
      "Priority Web Browsing Agent access",
      "API access (pay-per-use)",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    href: "/signup?plan=pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    icon: <Briefcase className="w-8 h-8 text-green-500" />,
    price: "Custom",
    description: "Tailored solutions for large organizations with specific needs.",
    features: [
      "All Pro features, plus:",
      "Dedicated infrastructure & support",
      "Volume discounts on API usage",
      "Custom model training & integration",
      "B2B Licensing options",
      "Advanced analytics & reporting",
      "SLA & premium security",
    ],
    cta: "Contact Sales",
    href: "/contact-sales",
    highlight: false,
  },
];

const otherRevenueStreams = [
  {
    title: "Pay-Per-Task API Usage",
    icon: <Zap className="w-7 h-7 text-purple-500" />,
    description: "Integrate NeuroVichar's powerful AI capabilities into your own applications and workflows with our flexible API. Pay only for what you use, with scalable pricing for various tasks like complex analysis, image generation, or data summarization.",
    color: "purple",
  },
  {
    title: "Developer Plugin Marketplace",
    icon: <ShoppingCart className="w-7 h-7 text-orange-500" />,
    description: "A vibrant marketplace where developers can create, share, and monetize plugins that extend NeuroVichar's functionality. Revenue sharing model incentivizes innovation and community contributions.",
    color: "orange",
  },
  {
    title: "B2B Licensing & Solutions",
    icon: <Building className="w-7 h-7 text-blue-500" />,
    description: "Customized licensing for enterprises, coding academies, and research labs. We offer tailored solutions, including on-premise deployments, white-labeling, and specialized AI model training to meet specific organizational needs.",
    color: "blue",
  },
  {
    title: "AI-Enhanced Analytics & Automation Services",
    icon: <BarChart className="w-7 h-7 text-teal-500" />,
    description: "Leverage our AI expertise to gain deep insights from your data or automate complex business processes. We offer consultancy and services to build custom AI-driven analytics dashboards and automation workflows.",
    color: "teal",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

const MotionCard = motion(Card);

export default function RevenueModelPage() {
  return (
    <div className="space-y-16">
      <header className="text-center space-y-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 15, delay: 0.1 }}
        >
          <DollarSign className="w-24 h-24 text-accent mx-auto drop-shadow-lg" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-pink-500"
        >
          NeuroVichar Revenue Model
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="text-xl text-muted-foreground max-w-3xl mx-auto"
        >
          Our sustainable and scalable business model is designed for growth, developer engagement, and long-term profitability, ensuring NeuroVichar remains at the cutting edge of AI innovation.
        </motion.p>
      </header>

      {/* Subscription Tiers Section */}
      <section>
        <motion.h2 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
        >
          Subscription Plans
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {pricingTiers.map((tier, index) => (
            <MotionCard
              key={tier.name}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={index + 2} // Adjust delay index
              className={`flex flex-col rounded-xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 bg-card/85 backdrop-blur-md ${tier.highlight ? 'border-4 border-accent ring-4 ring-accent/30' : 'border-primary/20'}`}
            >
              <CardHeader className="text-center p-6">
                <div className={`mx-auto mb-4 p-3 rounded-full bg-muted w-fit ${tier.highlight ? 'text-accent' : 'text-primary'}`}>
                  {tier.icon}
                </div>
                <CardTitle className={`text-3xl font-bold ${tier.highlight ? 'text-accent' : 'text-foreground/95'}`}>{tier.name}</CardTitle>
                <p className="text-2xl font-semibold text-foreground/90 mt-2">
                  {tier.price}
                  {tier.pricePeriod && <span className="text-sm font-normal text-muted-foreground">{tier.pricePeriod}</span>}
                </p>
                <CardDescription className="text-base text-muted-foreground mt-2 min-h-[40px]">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow p-6 space-y-3">
                <ul className="space-y-2.5 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle className={`w-5 h-5 mr-2.5 mt-0.5 flex-shrink-0 ${tier.highlight ? 'text-accent' : 'text-primary'}`} />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 mt-auto">
                <Button 
                  asChild 
                  size="lg" 
                  className={`w-full text-lg py-7 shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 ${tier.highlight ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                >
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </CardFooter>
            </MotionCard>
          ))}
        </div>
      </section>

      {/* Other Revenue Streams Section */}
      <section className="mt-20">
        <motion.h2 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
        >
          Diversified Revenue Streams
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-8">
          {otherRevenueStreams.map((stream, index) => (
            <MotionCard
              key={stream.title}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={index + 5} // Adjust delay index
              className={`rounded-xl shadow-xl hover:shadow-${stream.color}-500/20 transition-all duration-300 bg-card/80 backdrop-blur-sm border-${stream.color}-500/30 border-2`}
            >
              <CardHeader className="flex flex-row items-center gap-4 p-6">
                <div className={`p-3 rounded-full bg-${stream.color}-500/10 text-${stream.color}-500`}>
                    {stream.icon}
                </div>
                <CardTitle className={`text-2xl font-semibold text-${stream.color}-600 dark:text-${stream.color}-400`}>{stream.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-muted-foreground leading-relaxed">{stream.description}</p>
              </CardContent>
            </MotionCard>
          ))}
        </div>
      </section>

      {/* Roadmap & Vision Section */}
      <motion.section 
        className="mt-20"
        initial={{ opacity: 0, y:30 }}
        animate={{ opacity: 1, y:0 }}
        transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
      >
        <Card className="shadow-2xl bg-card/90 backdrop-blur-lg overflow-hidden border-2 border-accent/30 p-8 md:p-12">
          <CardHeader className="text-center mb-6 p-0">
            <CardTitle className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-pink-500">
              Our Growth Vision
            </CardTitle>
            <CardDescription className="text-lg mt-3 text-muted-foreground max-w-2xl mx-auto">
              We are committed to continuous innovation, fostering a strong developer community, and building robust enterprise solutions to ensure NeuroVichar's long-term success and leadership in the AI space.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div variants={cardVariants} custom={8} className="p-4 bg-muted/30 rounded-lg shadow-sm">
              <Users className="w-12 h-12 text-primary mx-auto mb-3" />
              <h4 className="text-xl font-semibold text-foreground/90 mb-1">User Growth</h4>
              <p className="text-sm text-muted-foreground">Expanding our user base through valuable freemium offerings and community engagement.</p>
            </motion.div>
            <motion.div variants={cardVariants} custom={9} className="p-4 bg-muted/30 rounded-lg shadow-sm">
              <Briefcase className="w-12 h-12 text-accent mx-auto mb-3" />
              <h4 className="text-xl font-semibold text-foreground/90 mb-1">Enterprise Integration</h4>
              <p className="text-sm text-muted-foreground">Providing powerful, scalable solutions for businesses to leverage AI effectively.</p>
            </motion.div>
            <motion.div variants={cardVariants} custom={10} className="p-4 bg-muted/30 rounded-lg shadow-sm">
              <ShoppingCart className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="text-xl font-semibold text-foreground/90 mb-1">Developer Ecosystem</h4>
              <p className="text-sm text-muted-foreground">Nurturing a vibrant marketplace for plugins and tools, driving innovation.</p>
            </motion.div>
          </CardContent>
           <CardFooter className="mt-10 flex justify-center">
                <Button asChild size="lg" className="text-lg px-10 py-7 shadow-lg hover:shadow-accent/30 transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground">
                    <Link href="/contact-us">Partner With Us</Link>
                </Button>
            </CardFooter>
        </Card>
      </motion.section>
      
      {/* Image placeholder for visual appeal */}
      <motion.div 
        className="mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
      >
        <Image 
          src="https://picsum.photos/1200/400?random=revenue" 
          alt="Abstract Business Growth Visualization" 
          width={1200} 
          height={400} 
          className="rounded-xl shadow-2xl object-cover border-2 border-primary/20 w-full"
          data-ai-hint="business growth"
        />
      </motion.div>
    </div>
  );
}

