'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea for longer prompts
import { Label } from "@/components/ui/label";
import { ImageIcon as PageIcon, Sparkles, Loader2, AlertCircle, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateImage, type GenerateImageOutput } from '@/ai/flows/generate-image-flow';
import Image from 'next/image'; // Using next/image for optimized image display
import { motion, AnimatePresence } from 'framer-motion';

export default function AiImageGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateImageOutput | null>(null);
  const [showcasePrompts] = useState([
    "A futuristic cityscape at sunset, with flying vehicles and holographic billboards, synthwave style.",
    "A photorealistic portrait of a majestic lion wearing a crown, regal background.",
    "An enchanting forest scene with mystical creatures and glowing flora, digital painting.",
    "A surreal dreamscape with floating islands and a giant moon, Dali-esque.",
    "Cute cartoon robot exploring a vibrant alien planet.",
  ]);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');

  useEffect(() => {
    setCurrentPlaceholder(showcasePrompts[Math.floor(Math.random() * showcasePrompts.length)]);
  }, [showcasePrompts]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!prompt.trim()) {
        setError('Please enter a prompt to generate an image.');
        setIsLoading(false);
        return;
      }
      const response = await generateImage({ prompt });
      setResult(response);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred while generating the image.');
      console.error("Image generation error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (result?.imageDataUri) {
      const link = document.createElement('a');
      link.href = result.imageDataUri;
      // Extract a filename from the prompt or use a default
      const filename = result.promptUsed.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'generated_image';
      link.download = `${filename}.png`; // Assuming PNG, adjust if model can return other types
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  return (
    <div className="space-y-10">
      <header className="flex items-center space-x-6">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
          <PageIcon className="w-16 h-16 text-accent drop-shadow-lg" />
        </motion.div>
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">AI Image Generation</h1>
          <p className="text-xl text-muted-foreground mt-2 max-w-2xl">
            Transform your textual ideas into stunning visuals with the power of generative AI.
          </p>
        </div>
      </header>

      <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create Your Image</CardTitle>
          <CardDescription className="text-base">
            Describe the image you want to create. Be as detailed or as imaginative as you like!
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image-prompt-input" className="text-md font-medium">Image Prompt</Label>
              <Textarea
                id="image-prompt-input"
                placeholder={`e.g., ${currentPlaceholder}`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                required
                className="text-lg p-3 min-h-[100px] resize-y"
                aria-label="Prompt for AI Image Generation"
              />
            </div>
             <div className="text-xs text-muted-foreground">
              Try one of these example prompts:
              <div className="flex flex-wrap gap-2 mt-1">
                {showcasePrompts.slice(0,3).map(p => (
                  <Button key={p} variant="outline" size="sm" className="text-xs" onClick={() => setPrompt(p)} disabled={isLoading}>
                    {p.substring(0,40) + "..."}
                  </Button>
                ))}
              </div>
            </div>
             {error && (
              <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <Alert variant="destructive" className="shadow-md">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle className="font-semibold">Generation Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} size="lg" className="text-lg px-8 py-6 w-full sm:w-auto shadow-md hover:shadow-lg transition-all transform hover:scale-105">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2.5 h-6 w-6 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2.5 h-6 w-6" />
                  Generate Image
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <AnimatePresence>
        {isLoading && (
           <motion.div
            key="loading-indicator"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8"
          >
            <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center space-y-4">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent" />
                <p className="text-lg text-muted-foreground font-medium">Your image is being conjured by the AI spirits... Please wait.</p>
                <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                  <div className="bg-accent h-2.5 rounded-full animate-pulse" style={{width: "75%"}}></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
      {result && !isLoading && (
        <motion.div
          key="image-result"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99], delay: 0.1 }}
          className="mt-10"
        >
          <Card className="shadow-xl bg-card/90 backdrop-blur-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <PageIcon className="w-9 h-9 text-accent drop-shadow-md" />
                Generated Image
              </CardTitle>
              <CardDescription className="text-base">Prompt: <span className="italic text-foreground/80">{result.promptUsed}</span></CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-4 md:p-6">
              <motion.div 
                className="relative w-full max-w-2xl aspect-square rounded-lg shadow-2xl overflow-hidden border-4 border-accent/30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              >
                <Image
                  src={result.imageDataUri}
                  alt={`AI generated image for prompt: ${result.promptUsed}`}
                  layout="fill"
                  objectFit="contain" // 'cover' might be better if aspect ratio is fixed by model
                  className="transition-transform duration-500 hover:scale-105"
                  unoptimized={result.imageDataUri.startsWith('data:')} // Important for data URIs
                />
              </motion.div>
            </CardContent>
            <CardFooter className="justify-center">
              <Button onClick={handleDownload} size="lg" variant="outline" className="text-md shadow-sm hover:shadow-md transition-all">
                <Download className="mr-2 h-5 w-5" />
                Download Image
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
      
      <Card className="mt-12 bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">About AI Image Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-base leading-relaxed">
           Our AI Image Generation feature uses state-of-the-art generative models to transform your text prompts into unique images. 
           Whether you're looking for photorealistic scenes, abstract art, or imaginative illustrations, this tool can help bring your vision to life. 
           Experiment with different styles, subjects, and artistic keywords to explore the vast creative potential. 
           The quality and coherence of the generated image often depend on the clarity and specificity of your prompt.
          </p>
          <h4 className="font-semibold mt-4 mb-2 text-foreground/90">Tips for Better Prompts:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
            <li>Be specific: Instead of "a cat", try "a fluffy ginger cat sleeping on a bookshelf".</li>
            <li>Mention style: Add terms like "photorealistic", "oil painting", "cartoon style", "pixel art", "synthwave".</li>
            <li>Describe lighting and mood: "dramatic lighting", "serene atmosphere", "cyberpunk neon glow".</li>
            <li>Combine concepts: "An astronaut riding a horse on the moon, impressionist painting".</li>
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}