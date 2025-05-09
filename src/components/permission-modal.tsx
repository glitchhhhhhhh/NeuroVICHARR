
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface PermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
  onClose: () => void;
}

export function PermissionModal({ isOpen, onAllow, onDeny, onClose }: PermissionModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px] bg-card/95 backdrop-blur-lg border-primary/30 shadow-2xl rounded-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <DialogHeader className="text-center">
            <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
            <DialogTitle className="text-2xl font-bold text-foreground">Background Activity Permission</DialogTitle>
            <DialogDescription className="text-md text-muted-foreground mt-2 leading-relaxed">
              To provide intelligent, context-aware assistance, NeuroVichar&apos;s Neural Interface needs permission to understand your typical app usage and digital interactions. This helps us infer your intent without you needing to type.
            </DialogDescription>
          </DialogHeader>
          <div className="my-6 p-4 bg-muted/50 rounded-lg border border-border/50">
            <h4 className="font-semibold text-foreground/90 mb-2">What we track (locally on your device):</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
              <li>General app usage patterns (e.g., frequently used apps).</li>
              <li>Interaction footprints (e.g., typing rhythm, app switch frequency - simulated for demo).</li>
              <li>Contextual metadata (e.g., time of day, calendar event types - simulated for demo).</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3 italic">
              Your specific content (e.g., what you type in documents) is NOT tracked or stored. This feature is designed with privacy in mind. All processing for intent inference primarily happens based on patterns and telemetry for this demonstration.
            </p>
          </div>
          <DialogFooter className="gap-3 sm:gap-2">
            <Button
              variant="outline"
              onClick={onDeny}
              className="transition-all hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <AlertTriangle className="mr-2 h-4 w-4" /> Deny & Use Limited Features
            </Button>
            <Button
              onClick={onAllow}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <ShieldCheck className="mr-2 h-4 w-4" /> Allow Background Activity
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

    