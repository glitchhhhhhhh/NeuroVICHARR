
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Edit3, Bell, Shield, Palette, Activity, Sun, Moon, Laptop, Save, EyeOff, Eye, Settings2, KeyRound } from "lucide-react";
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link'; // Added import for Link

// Mock data - replace with actual data fetching
const userProfile = {
  name: "Neuro User",
  email: "user@neurovichar.ai",
  bio: "AI enthusiast exploring the frontiers of intelligent systems. Passionate about creative AI and complex problem-solving.",
  avatarUrl: "https://picsum.photos/200/200",
  dateJoined: "2023-05-15",
  preferences: {
    notifications: {
      emailUpdates: true,
      appAlerts: false,
    },
    theme: "system", // 'light', 'dark', 'system'
    privacy: {
      activityTracking: true, // for Neural Interface personalization
      dataSharing: false,
    },
  },
  recentActivity: [
    { id: 'act1', type: 'Neuro Synapse', description: "Analyzed 'Future of Quantum Computing'", timestamp: "2024-05-01T10:30:00Z" },
    { id: 'act2', type: 'Image Generation', description: "Created 'Cyberpunk Cityscape'", timestamp: "2024-04-30T15:45:00Z" },
    { id: 'act3', type: 'Idea Catalyst', description: "Explored 'Sustainable Urban Living'", timestamp: "2024-04-29T09:12:00Z" },
  ],
  apiKey: "nv_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Mock API key
};


export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [bio, setBio] = useState(userProfile.bio);
  const [emailNotifications, setEmailNotifications] = useState(userProfile.preferences.notifications.emailUpdates);
  const [appAlerts, setAppAlerts] = useState(userProfile.preferences.notifications.appAlerts);
  const [activityTracking, setActivityTracking] = useState(userProfile.preferences.privacy.activityTracking);
  const [dataSharing, setDataSharing] = useState(userProfile.preferences.privacy.dataSharing);
  const [showApiKey, setShowApiKey] = useState(false);

  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleSave = () => {
    // Simulate API call to save profile
    console.log("Saving profile:", { name, bio, emailNotifications, appAlerts, activityTracking, dataSharing, theme });
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Laptop;

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
            <Avatar className="w-24 h-24 border-4 border-primary shadow-lg">
              <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} data-ai-hint="user portrait" />
              <AvatarFallback className="text-3xl">{userProfile.name.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{isEditing ? name : userProfile.name}</h1>
            <p className="text-lg text-muted-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 opacity-70" /> {userProfile.email}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Joined: {formatDate(userProfile.dateJoined)}</p>
          </div>
        </div>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
          size="lg" 
          className="shadow-md hover:shadow-lg transition-all transform hover:scale-105"
        >
          {isEditing ? <Save className="w-5 h-5 mr-2" /> : <Edit3 className="w-5 h-5 mr-2" />}
          {isEditing ? 'Save Profile' : 'Edit Profile'}
        </Button>
      </motion.header>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <Separator className="my-8 bg-border/50" />
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Profile Details & Settings */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="md:col-span-2 space-y-8"
        >
          <Card className="shadow-xl bg-card/90 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><User className="w-6 h-6 text-primary" /> Profile Information</CardTitle>
              <CardDescription>Manage your public and private profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="profile-name" className="text-md font-medium">Display Name</Label>
                {isEditing ? (
                  <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 text-lg p-3" />
                ) : (
                  <p className="text-lg text-foreground/90 mt-1">{name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="profile-bio" className="text-md font-medium">Bio</Label>
                {isEditing ? (
                  <Textarea id="profile-bio" value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 text-md min-h-[100px] p-3" placeholder="Tell us a bit about yourself..." />
                ) : (
                  <p className="text-md text-muted-foreground mt-1 italic">{bio || "No bio provided."}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-card/90 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><Settings2 className="w-6 h-6 text-primary" /> Preferences</CardTitle>
              <CardDescription>Customize your NeuroVichar experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2"><Bell className="w-5 h-5 text-accent" />Notifications</h4>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <Label htmlFor="email-notifications" className="text-md">Email Updates & Newsletters</Label>
                    <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} disabled={!isEditing} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <Label htmlFor="app-alerts" className="text-md">In-App Task Alerts</Label>
                    <Switch id="app-alerts" checked={appAlerts} onCheckedChange={setAppAlerts} disabled={!isEditing} />
                  </div>
              </div>
              <Separator className="bg-border/40" />
              <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2"><Palette className="w-5 h-5 text-accent" />Appearance</h4>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <Label htmlFor="theme-selector" className="text-md flex items-center gap-2"><ThemeIcon className="w-5 h-5" /> Current Theme</Label>
                    <div className="flex gap-2">
                      {(['light', 'dark', 'system'] as const).map((t) => (
                        <Button key={t} variant={theme === t ? "default" : "outline"} size="sm" onClick={() => { setTheme(t); if(isEditing) userProfile.preferences.theme = t; }} disabled={!isEditing && theme === t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
              </div>
              <Separator className="bg-border/40" />
              <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-accent" />Privacy & Personalization</h4>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <Label htmlFor="activity-tracking" className="text-md">Enable Neural Interface Personalization <span className="text-xs text-muted-foreground">(uses activity data)</span></Label>
                    <Switch id="activity-tracking" checked={activityTracking} onCheckedChange={setActivityTracking} disabled={!isEditing} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <Label htmlFor="data-sharing" className="text-md">Share Anonymized Data for Model Improvement</Label>
                    <Switch id="data-sharing" checked={dataSharing} onCheckedChange={setDataSharing} disabled={!isEditing} />
                  </div>
              </div>
            </CardContent>
             {isEditing && (
                <CardFooter className="border-t pt-6">
                    <Button onClick={handleSave} size="lg" className="ml-auto shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                        <Save className="w-5 h-5 mr-2" /> Save Preferences
                    </Button>
                </CardFooter>
             )}
          </Card>

          <Card className="shadow-xl bg-card/90 backdrop-blur-sm border-primary/10">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2"><KeyRound className="w-6 h-6 text-primary" /> API Access</CardTitle>
                <CardDescription>Manage your API key for programmatic access to NeuroVichar features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
                    <Input 
                        id="api-key" 
                        type={showApiKey ? "text" : "password"} 
                        readOnly 
                        value={userProfile.apiKey} 
                        className="flex-grow text-sm font-mono bg-transparent border-0 shadow-none focus-visible:ring-0"
                    />
                    <Button variant="ghost" size="icon" onClick={() => setShowApiKey(!showApiKey)} aria-label={showApiKey ? "Hide API Key" : "Show API Key"}>
                        {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                        navigator.clipboard.writeText(userProfile.apiKey);
                        toast({title: "API Key Copied!", description: "Your API key has been copied to the clipboard."});
                    }}>
                        Copy Key
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Keep your API key secure. Do not share it publicly. 
                    <Button variant="link" asChild className="p-0 ml-1 text-xs text-accent hover:text-accent/80"><Link href="/docs/api">Learn more about API usage.</Link></Button>
                </p>
            </CardContent>
          </Card>

        </motion.div>

        {/* Right Column: Recent Activity */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-8"
        >
          <Card className="shadow-xl bg-card/90 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><Activity className="w-6 h-6 text-primary" />Recent Activity</CardTitle>
              <CardDescription>Your latest interactions with NeuroVichar.</CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile.recentActivity.length > 0 ? (
                <ul className="space-y-4">
                  {userProfile.recentActivity.map((activity, index) => (
                    <motion.li 
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                      className="p-3 bg-muted/40 rounded-md shadow-sm border border-border/50"
                    >
                      <p className="font-semibold text-foreground/90">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">{formatDate(activity.timestamp)}</p>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent activity to display.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

