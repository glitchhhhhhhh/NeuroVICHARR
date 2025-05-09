
'use client';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; 
import './globals.css';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarFooter, SidebarGroupLabel } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Home, Settings, Brain, Zap, Share2, SearchCode, Globe, Image as ImageIconLucide, DollarSign, Lightbulb, UserCircle, Store, LogIn, BrainCircuit, Sparkles, Rocket } from 'lucide-react';
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
  title: 'NeuroVichar - Vichar Before Prahar: Turning Your Neural Thoughts into Collaborative Code Solutions with inteliigence',
  description: 'Vichar Before Prahar: Turning Your Neural Thoughts into Collaborative Code Solutions with inteliigence',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup'; 
  const [isLoadingPage, setIsLoadingPage] = useState(false); 
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);


  useEffect(() => {
    // This effect manages the visibility of the global loading screen.
    // It shows the loader when navigating to a new non-authentication page.
    // The loader is primarily hidden by the `onAnimationComplete` callback of the main content's motion.div.
    // The setTimeout here is a fallback to ensure the loader doesn't get stuck if onAnimationComplete fails to fire.

    if (!initialLoadComplete) {
       // For the very first load, show loader and then hide after a short delay.
       setIsLoadingPage(true);
       const initialTimer = setTimeout(() => {
         setIsLoadingPage(false);
         setInitialLoadComplete(true);
       }, 700); // Reduced initial loading time
       return () => clearTimeout(initialTimer);
    }


    if (!isAuthPage && initialLoadComplete) {
      setIsLoadingPage(true); 

      const timer = setTimeout(() => {
        setIsLoadingPage(currentIsLoading => {
          if (currentIsLoading) { 
            // console.warn("Loading fallback timer triggered. Investigate if page animations are not completing.");
            return false;
          }
          return currentIsLoading; 
        });
      }, 700); // Reduced fallback timer for page transitions

      return () => clearTimeout(timer);
    } else {
      setIsLoadingPage(false); 
    }
  }, [pathname, isAuthPage, initialLoadComplete]); 


  if (isAuthPage) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>{String(metadataObject.title)}</title> 
          <meta name="description" content={String(metadataObject.description)} />
        </head>
        <body className={`${inter.variable} font-sans antialiased animated-bg-pattern`}>
           <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {isLoadingPage && <NeuroVicharLoadingLogo text="Loading Page..." />}
            <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 dark:from-background dark:to-muted/10 p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                    key={pathname} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }} // Faster transition
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
      <body className={`${inter.variable} font-sans antialiased animated-bg-pattern`}> 
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {isLoadingPage && <NeuroVicharLoadingLogo />}
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
                    <SidebarMenuButton asChild tooltip="Neural Interface" size="lg">
                      <Link href="/neural-interface">
                         <BrainCircuit />
                        <span>Neural Interface</span>
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
                  </SidebarMenu>
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="p-4 flex items-center justify-between border-t border-sidebar-border/50">
                <ModeToggle />
                <UserNav />
              </SidebarFooter>
            </Sidebar>
            <SidebarInset className="sidebar-inset-content relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 10 }} // Reduced y offset
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }} // Reduced y offset
                  transition={{ duration: 0.25, ease: "easeInOut" }} // Faster transition
                  onAnimationComplete={() => setIsLoadingPage(false)} 
                  className="p-4 md:p-6 lg:p-8 min-h-[calc(100vh-theme(spacing.4)-theme(spacing.4))] md:min-h-screen" 
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )