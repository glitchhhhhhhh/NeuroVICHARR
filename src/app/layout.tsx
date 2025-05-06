
'use client';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist
import './globals.css';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarFooter, SidebarGroupLabel } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Home, Settings, Brain, Zap, Share2, SearchCode, Globe, Image as ImageIconLucide, DollarSign, Lightbulb, UserCircle, Store, LogIn, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { AppLogo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from "@/components/theme-provider";
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

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

  if (isAuthPage) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>{String(metadataObject.title)}</title> {/* Updated to use full title */}
          <meta name="description" content={String(metadataObject.description)} />
        </head>
        <body className={`${inter.variable} font-sans antialiased`}>
           <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 dark:from-background dark:to-muted/10 p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
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
      <body className={`${inter.variable} font-sans antialiased`}> 
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen>
            <Sidebar>
              <SidebarHeader className="p-4">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2">
                    <AppLogo className="w-8 h-8" />
                    <h1 className="text-xl font-semibold">NeuroVichar</h1>
                  </Link>
                  <SidebarTrigger className="hidden md:flex" />
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dashboard">
                      <Link href="/">
                        <Home />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Idea Catalyst">
                      <Link href="/idea-catalyst">
                        <Lightbulb />
                        <span>Idea Catalyst</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Neuro Synapse">
                      <Link href="/neuro-synapse">
                        <Brain />
                        <span>Neuro Synapse</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="AI Image Generation">
                      <Link href="/ai-image-generation">
                        <ImageIconLucide />
                        <span>AI Image Generation</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Neural Interface">
                      <Link href="/neural-interface">
                         <BrainCircuit />
                        <span>Neural Interface</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Web Browsing Agents">
                      <Link href="/web-browsing">
                        <Globe />
                        <span>Web Browsing Agents</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Plugin Marketplace">
                      <Link href="/plugin-marketplace">
                        <Store />
                        <span>Plugin Marketplace</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Revenue Model">
                      <Link href="/revenue-model">
                        <DollarSign />
                        <span>Revenue Model</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenu className="mt-auto pt-4 border-t border-border/30"> 
                    <SidebarGroupLabel className="text-xs text-muted-foreground/70 px-2 pt-2">Platform Features</SidebarGroupLabel>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Parallel Processing">
                        <Link href="/parallel-processing">
                          <Zap />
                          <span>Parallel Processing</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Distributed Power">
                        <Link href="/distributed-power">
                          <Share2 />
                          <span>Distributed Power</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Sub-Prompt Decomposition">
                        <Link href="/sub-prompt-decomposition">
                          <SearchCode />
                          <span>Sub-Prompt Decomposition</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarGroupLabel className="text-xs text-muted-foreground/70 px-2 pt-4">User Account</SidebarGroupLabel>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Profile">
                        <Link href="/profile">
                            <UserCircle />
                            <span>Profile</span>
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Login">
                        <Link href="/login">
                            <LogIn />
                            <span>Login</span>
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="p-4 flex items-center justify-between">
                <ModeToggle />
                <UserNav />
              </SidebarFooter>
            </Sidebar>
            <SidebarInset className="sidebar-inset-content relative">
              <div className="absolute inset-0 -z-10 opacity-5 dark:opacity-[0.02] pointer-events-none">
                 <svg width="100%" height="100%">
                    <defs>
                      <pattern id="main-bg-pattern" patternUnits="userSpaceOnUse" width="80" height="80" patternTransform="scale(1) rotate(45)">
                        <circle cx="10" cy="10" r="1" fill="hsl(var(--foreground))" opacity="0.5"/>
                        <circle cx="40" cy="40" r="1.5" fill="hsl(var(--foreground))" opacity="0.7"/>
                         <path d="M0 40 H80 M40 0 V80" stroke="hsl(var(--foreground))" strokeWidth="0.2" opacity="0.3"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#main-bg-pattern)" />
                  </svg>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
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
  );
}

