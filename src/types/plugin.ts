
import type { LucideIcon } from 'lucide-react';

export interface Plugin {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  icon: LucideIcon; // Or string for image URLs
  tags: string[];
  stars: number;
  downloads: number;
  category: string;
  price: string; // Could be 'Free', 'Freemium', or a price string like '$9.99'
  imageUrl?: string; // Optional: URL for a banner image
  dataAiHint?: string; // Optional: AI hint for image search
  // Add other relevant fields like:
  // lastUpdated: Date;
  // changelogUrl?: string;
  // documentationUrl?: string;
  // compatibleWith: string[]; // e.g., ["Neuro Synapse", "Idea Catalyst"]
}
