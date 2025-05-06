'use client';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist
import './globals.css';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarFooter } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Home, Settings, Brain, Zap, Share2, SearchCode, Globe, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { AppLogo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from "@/components/theme-provider";
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const inter = Inter({ // Changed from geistSans
  variable: '--font-sans', // Changed variable name
  subsets: ['latin'],
});

// Removed geistMono as Inter can be used for mono as well or a specific mono font can be added if needed

// Metadata can remain static unless dynamic generation is required
export const metadataObject: Metadata = {
  title: 'NeuroVichar',
  description: 'Intelligent Prompt Collaboration Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  return (
    <html lang="en" suppressHydrationWarning>
      {/* It's generally better to set metadata in the Head component of individual pages or a specific _app.js/_document.js if needed dynamically */}
      <head>
        <title>{String(metadataObject.title)}</title>
        <meta name="description" content={String(metadataObject.description)} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}> {/* Use font-sans which maps to --font-sans */}
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
                        <ImageIcon />
                        <span>AI Image Generation</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Parallel Processing">
                      <Link href="/parallel-processing">
                        <Zap />
                        <span>Parallel Processing</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Neural Interface">
                      <Link href="/neural-interface">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain-circuit"><path d="M12 5a3 3 0 1 0-5.997.125"/><path d="M12 5a3 3 0 1 1 5.997.125"/><path d="M15 11a3 3 0 1 0-5.997.125"/><path d="M15 11a3 3 0 1 1 5.997.125"/><path d="M9 11a3 3 0 1 0-5.997.125"/><path d="M9 11a3 3 0 1 1 5.997.125"/><path d="M12 17a3 3 0 1 0-5.997.125"/><path d="M12 17a3 3 0 1 1 5.997.125"/><path d="M14 5.5a3 3 0 0 0-2-1"/><path d="M10 5.5a3 3 0 0 1 2-1"/><path d="M17 11.5a3 3 0 0 0-2-1"/><path d="M13 11.5a3 3 0 0 1 2-1"/><path d="M11 11.5a3 3 0 0 0-2-1"/><path d="M7 11.5a3 3 0 0 1 2-1"/><path d="M14 17.5a3 3 0 0 0-2-1"/><path d="M10 17.5a3 3 0 0 1 2-1"/><circle cx="12" cy="12" r="11"/><path d="M17.5 14a3 3 0 0 0-1-2"/><path d="M17.5 10a3 3 0 0 0-1 2"/><path d="M6.5 14a3 3 0 0 1 1-2"/><path d="M6.5 10a3 3 0 0 1 1 2"/><path d="M14 6.5a3 3 0 0 0-2 1"/><path d="M10 6.5a3 3 0 0 1 2 1"/><path d="M14 17.5a3 3 0 0 0-2-1"/><path d="M10 17.5a3 3 0 0 1 2-1"/></svg>
                        <span>Neural Interface</span>
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
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Web Browsing Agents">
                      <Link href="/web-browsing">
                        <Globe />
                        <span>Web Browsing Agents</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="p-4 flex items-center justify-between">
                <ModeToggle />
                <UserNav />
              </SidebarFooter>
            </Sidebar>
            <SidebarInset className="sidebar-inset-content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="p-4 md:p-6 lg:p-8 min-h-screen" // Added min-h-screen
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