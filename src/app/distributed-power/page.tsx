'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, LifeBuoy, AlertCircle, Zap, ShieldOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion"; // Ensure motion is imported
import Image from 'next/image';

export default function DistributedPowerPage() {
  return (
    <div className="space-y-10">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center space-x-6"
      >
        <Share2 className="w-14 h-14 text-accent drop-shadow-lg" />
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">Distributed Power & Resource Sharing</h1>
          <p className="text-xl text-muted-foreground mt-2 max-w-2xl">
            Ensures resilience and extends capabilities through a distributed power and resource-sharing mechanism between devices running NeuroVichar.
          </p>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      >
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Enhanced Resilience & Collective Performance</CardTitle>
            <CardDescription className="text-base">
              Distributed Power and Resource Sharing allows NeuroVichar instances on multiple devices to conceptually pool computational resources and network capabilities. This creates a resilient and scalable network, aiming for continuous operation and enhanced performance by distributing workloads and sharing connectivity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-center bg-muted/30 p-6 rounded-lg border border-primary/20 shadow-inner">
                <Zap className="w-24 h-24 text-primary opacity-70 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-foreground/90">Conceptual Advantages:</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground text-base">
                    <li><strong>Improved Fault Tolerance:</strong> The system could remain partially operational or assist in data recovery even if some devices go offline.</li>
                    <li><strong>Scalable Performance:</strong> More devices in the network could mean more collective processing power for complex tasks.</li>
                    <li><strong>Efficient Resource Utilization:</strong> Workloads could be balanced across available devices, and network connectivity shared.</li>
                    <li><strong>Decentralized Architecture:</strong> Aims to reduce reliance on a single point of failure for certain non-critical operations.</li>
                    </ul>
                </div>
            </div>
            <p className="text-sm text-muted-foreground italic pt-2">
              The distributed power and resource sharing mechanism is an advanced conceptual component exploring the future of robust, interconnected applications.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm border-destructive/30">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <LifeBuoy className="w-10 h-10 text-destructive flex-shrink-0" />
              <div>
                <CardTitle className="text-2xl text-destructive">SOS Power & Network Assist (Conceptual)</CardTitle>
                <CardDescription className="text-base mt-1">
                  In critical situations, NeuroVichar envisions leveraging its distributed network to provide vital assistance.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-center bg-destructive/5 p-6 rounded-lg border border-destructive/20 shadow-inner">
                <ShieldOff className="w-24 h-24 text-destructive opacity-70 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-foreground/90">How It Might Work (Theoretically):</h3>
                    <ul className="list-disc list-inside space-y-2.5 text-muted-foreground text-base">
                    <li>
                        <strong>Distress Beacon:</strong> A device critically low on power (or if an SOS mode is manually triggered by the user) could attempt to broadcast a low-energy, encrypted SOS signal to nearby devices also running NeuroVichar.
                    </li>
                    <li>
                        <strong>Network Relay & Alert:</strong> Nearby app instances, upon securely detecting such a signal, could:
                        <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                            <li>Alert their users to the potential emergency and provide an approximate direction or last known location of the distressed device.</li>
                            <li>Offer to relay emergency communications (e.g., pre-defined messages, location updates) if the distressed device has lost its primary network connectivity but the assisting device has it.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Resource Pooling (Conceptual):</strong> While direct device-to-device battery transfer between arbitrary phones is generally not feasible with current standard hardware, the 'power sharing' in an SOS context refers to leveraging the collective network capabilities, processing power (for relaying messages or simple computations), and sensor data (if permitted) of nearby active devices to aid the user in distress.
                    </li>
                    <li>
                        <strong>Guidance to Safety/Help:</strong> If the distressed user is able, the app could guide them towards known safe locations or help points identified by the collective network.
                    </li>
                    </ul>
                </div>
            </div>
            <Alert variant="destructive" className="shadow-md">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-semibold">Important Disclaimer</AlertTitle>
              <AlertDescription className="leading-relaxed">
                This SOS feature, including any form of conceptual power or resource sharing, describes a potential future capability aiming to explore the possibilities of distributed device networks. 
                Its actual implementation would be highly dependent on significant advancements in device hardware capabilities, operating system permissions, robust security protocols, user consent mechanisms, and ethical considerations. 
                <strong>This is not a currently active feature and should not be relied upon for emergency situations. Always use official emergency channels (e.g., calling emergency services) in a crisis.</strong>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}
