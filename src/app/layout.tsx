
'use client';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; 
import './globals.css';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarFooter, SidebarGroupLabel } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Home, Settings, Brain, Zap, Share2, SearchCode, Globe, Image as ImageIconLucide, DollarSign, Lightbulb, UserCircle, Store, LogIn, BrainCircuit, Sparkles, Rocket, UserPlus, Eye } from 'lucide-react';
import Link from 'next/link';
import { AppLogo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from "@/components/theme-provider";
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { NeuroVicharLoadingLogo } from '@/components/loading-logo';


// Attempt to load .env for server-side (e.g. scripts) if not already loaded by Next.js
// This might be redundant for typical Next.js app flow but useful for standalone scripts.
if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
  try {
    require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });
  } catch (e) {
    // console.warn("dotenv config not found or failed to load in layout.ts, assuming Next.js handles it.");
  }
}


const inter = Inter({ 
  variable: '--font-sans', 
  subsets: ['latin'],
});


export const metadataObject: Metadata = {
  title: 'NeuroVichar - Vichar Before Prahar: Turning Your Neural Thoughts into Collaborative Code Solutions with intelligence',
  description: 'Vichar Before Prahar: Turning Your Neural Thoughts into Collaborative Code Solutions with intelligence',
  icons: {
    icon: '/favicon.ico', // Add this line
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup'; 
  const [isLoadingPage, setIsLoadingPage] = useState(true); 
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);


  useEffect(() => {
    // This effect handles the very first load of the application
    if (!initialLoadComplete) {
       setIsLoadingPage(true); // Show loader on very first load
       const initialTimer = setTimeout(() => {
         setIsLoadingPage(false); // Hide loader
         setInitialLoadComplete(true); // Mark initial load as done
       }, 100); // Short delay for initial load
       return () => clearTimeout(initialTimer);
    }
  }, [initialLoadComplete]);

  useEffect(() => {
    // This effect handles loading state for subsequent page navigations
    if (initialLoadComplete && !isAuthPage) { // Only run if initial load is complete and not an auth page
      setIsLoadingPage(true); // Show loader for page transition
      const pageTransitionTimer = setTimeout(() => {
        setIsLoadingPage(false); // Hide loader after a short delay for transition
      }, 200); // Adjusted delay for page transitions
      return () => clearTimeout(pageTransitionTimer);
    } else if (isAuthPage) {
      setIsLoadingPage(false); // Ensure loader is hidden for auth pages without delay
    }
  }, [pathname, isAuthPage, initialLoadComplete]);

  const getLoadingText = () => {
    if (pathname === '/login') return "Authenticating...";
    if (pathname === '/signup') return "Creating Account...";
    if (pathname === '/neuroshastra') return "Awakening NeuroShastra...";
    if (pathname === '/parallel-processing' || pathname === '/distributed-power' || pathname === '/sub-prompt-decomposition' ) return "Initializing Core Module..."
    return "Initializing Synapses...";
  };


  if (isAuthPage) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>{String(metadataObject.title)}</title> 
          <meta name="description" content={String(metadataObject.description)} />
        </head>
        <body className={`${inter.variable} font-sans antialiased`}>
           <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {isLoadingPage && <NeuroVicharLoadingLogo text={getLoadingText()} />}
            <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 dark:from-background dark:to-muted/10 p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                    key={pathname} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.20, ease: "easeInOut" }}
                    onAnimationComplete={() => {if(isAuthPage) setIsLoadingPage(false)}} 
                    className="w-full max-w-md" 
                    >
                    {children}
                    </motion.div>
                </AnimatePresence>
            </div>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    );
  }


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{String(metadataObject.title)}</title>
        <meta name="description" content={String(metadataObject.description)} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}> {/* Removed animated-bg-pattern from body, it's on SidebarInset wrapper now */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {isLoadingPage && <NeuroVicharLoadingLogo text={getLoadingText()} />}
          <SidebarProvider defaultOpen>
            <Sidebar>
              <SidebarHeader className="p-4">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-background rounded-md outline-none">
                    <AppLogo className="w-10 h-10" /> 
                    <h1 className="text-2xl font-semibold tracking-tight">NeuroVichar</h1>
                  </Link>
                  <SidebarTrigger className="hidden md:flex" />
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dashboard" size="lg">
                      <Link href="/">
                        <Home />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Idea Catalyst" size="lg">
                      <Link href="/idea-catalyst">
                        <Lightbulb />
                        <span>Idea Catalyst</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="NeuroShastra" size="lg">
                      <Link href="/neuroshastra">
                         <Eye /> 
                        <span>NeuroShastra</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Neuro Synapse" size="lg">
                      <Link href="/neuro-synapse">
                        <Brain />
                        <span>Neuro Synapse</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="AI Image Generation" size="lg">
                      <Link href="/ai-image-generation">
                        <ImageIconLucide />
                        <span>AI Image Generation</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Web Browsing Agents" size="lg">
                      <Link href="/web-browsing">
                        <Globe />
                        <span>Web Browsing Agents</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Plugin Marketplace" size="lg">
                      <Link href="/plugin-marketplace">
                        <Store />
                        <span>Plugin Marketplace</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Revenue Model" size="lg">
                      <Link href="/revenue-model">
                        <DollarSign />
                        <span>Revenue Model</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenu className="mt-auto pt-4 border-t border-sidebar-border/50"> 
                    <SidebarGroupLabel className="text-xs text-muted-foreground/70 px-2 pt-2">Platform Features</SidebarGroupLabel>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Parallel Processing" size="lg">
                        <Link href="/parallel-processing">
                          <Zap />
                          <span>Parallel Processing</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Distributed Power" size="lg">
                        <Link href="/distributed-power">
                          <Share2 />
                          <span>Distributed Power</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Sub-Prompt Decomposition" size="lg">
                        <Link href="/sub-prompt-decomposition">
                          <SearchCode />
                          <span>Sub-Prompt Decomposition</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                     <SidebarGroupLabel className="text-xs text-muted-foreground/70 px-2 pt-4">User Account</SidebarGroupLabel>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Profile" size="lg">
                        <Link href="/profile">
                            <UserCircle />
                            <span>Profile</span>
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Login" size="lg">
                        <Link href="/login">
                            <LogIn />
                            <span>Login</span>
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Sign Up" size="lg">
                        <Link href="/signup">
                            <UserPlus />
                            <span>Sign Up</span>
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="p-4 flex items-center justify-between border-t border-sidebar-border/50">
                <ModeToggle />
                <UserNav />
              </SidebarFooter>
            </Sidebar>
            {/* Added animated-bg-pattern to this wrapper div */}
            <div className="flex-1 relative animated-bg-pattern">
              <SidebarInset> 
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }} 
                    transition={{ duration: 0.20, ease: "easeInOut" }}
                    onAnimationComplete={() => {if (!isAuthPage) setIsLoadingPage(false)}} 
                    className="p-4 md:p-6 lg:p-8 min-h-screen" // Simplified min-height
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </SidebarInset>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
