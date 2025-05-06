
'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (email === 'user@neurovichar.ai' && password === 'password') {
      toast({
        title: "Login Successful!",
        description: "Welcome back to NeuroVichar.",
      });
      // In a real app, you would redirect or set auth state here
      // For demo, we'll just clear the form
      setEmail('');
      setPassword('');
    } else {
      setError('Invalid email or password. Please try again.');
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 space-y-10">
      <motion.header 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center text-center space-y-3"
      >
        <LogIn className="w-20 h-20 text-accent drop-shadow-lg" />
        <h1 className="text-5xl font-bold tracking-tight text-foreground">Sign In to NeuroVichar</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Access your personalized AI dashboard and unlock powerful features.
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 bg-card/85 backdrop-blur-md border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl text-center font-semibold text-foreground/95">Welcome Back</CardTitle>
            <CardDescription className="text-base text-center text-muted-foreground">
              Enter your credentials to continue.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email-input" className="text-md font-medium text-foreground/80 flex items-center">
                  <Mail className="w-4 h-4 mr-2 opacity-70" /> Email Address
                </Label>
                <Input
                  id="email-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="text-lg p-4 h-14 bg-background/60 focus:bg-background focus:ring-accent focus:border-accent text-foreground/90 placeholder-muted-foreground/70 rounded-lg shadow-inner"
                  aria-label="Email Address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-input" className="text-md font-medium text-foreground/80 flex items-center">
                  <Lock className="w-4 h-4 mr-2 opacity-70" /> Password
                </Label>
                <Input
                  id="password-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="text-lg p-4 h-14 bg-background/60 focus:bg-background focus:ring-accent focus:border-accent text-foreground/90 placeholder-muted-foreground/70 rounded-lg shadow-inner"
                  aria-label="Password"
                />
              </div>
              <div className="flex items-center justify-end">
                <Button variant="link" size="sm" asChild className="text-sm text-accent hover:text-accent/80 p-0">
                  <Link href="#">Forgot password?</Link>
                </Button>
              </div>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                  <Alert variant="destructive" className="shadow-md">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="font-semibold">Login Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                disabled={isLoading} 
                size="lg" 
                className="text-lg px-10 py-7 w-full shadow-lg hover:shadow-accent/30 transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2.5 h-6 w-6 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2.5 h-6 w-6" />
                    Sign In
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Button variant="link" asChild className="text-accent hover:text-accent/80 p-0">
                  <Link href="#">Sign Up</Link>
                </Button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
