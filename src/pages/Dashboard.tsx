import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Palette,
  Brain,
  Settings,
  LogOut,
  Calendar,
  ExternalLink,
  Trash2,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import type { User as UserModel } from '@/models/User';

// Updated interfaces for MongoDB
interface Profile extends UserModel {}

interface SavedPalette {
  _id: string;
  name: string;
  colors: string[];
  website_url?: string;
  createdAt: string;
}

interface AISuggestion {
  _id: string;
  element_html: string;
  suggestions: any[];
  website_url?: string;
  createdAt: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [palettes, setPalettes] = useState<SavedPalette[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // If there's no user, we don't need to load data.
      setLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Fetch data from your new API endpoints
      const [profileRes, palettesRes, suggestionsRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/palettes'),
        fetch('/api/suggestions'),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      if (palettesRes.ok) {
        const palettesData = await palettesRes.json();
        setPalettes(palettesData);
      }

      if (suggestionsRes.ok) {
        const suggestionsData = await suggestionsRes.json();
        setSuggestions(suggestionsData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Could not load user data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePalette = async (paletteId: string) => {
    try {
      const res = await fetch(`/api/palettes?id=${paletteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      setPalettes(palettes.filter(p => p._id !== paletteId));
      toast({
        title: "Palette deleted",
        description: "The color palette has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error deleting palette",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleInspector = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { toggleInspector: true });
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                {profile?.displayName?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your saved palettes, AI suggestions, and extension settings
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="tech-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Palettes</CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{palettes.length}</div>
              <p className="text-xs text-muted-foreground">
                Color schemes discovered
              </p>
            </CardContent>
          </Card>

          <Card className="tech-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suggestions.length}</div>
              <p className="text-xs text-muted-foreground">
                Elements analyzed
              </p>
            </CardContent>
          </Card>

          <Card className="tech-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Account created
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mb-8">
          <Button onClick={handleToggleInspector}>Toggle Inspector</Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="palettes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="palettes">Color Palettes</TabsTrigger>
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Palettes Tab */}
          <TabsContent value="palettes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Saved Color Palettes</h2>
              <Button className="bg-gradient-to-r from-primary to-accent">
                <Plus className="w-4 h-4 mr-2" />
                Save New Palette
              </Button>
            </div>

            {palettes.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No palettes saved yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Use the Chrome extension to discover and save color palettes from websites
                  </p>
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Add to Chrome
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {palettes.map((palette) => (
                  <Card key={palette._id} className="tech-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{palette.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePalette(palette._id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {palette.website_url && (
                        <CardDescription className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {new URL(palette.website_url).hostname}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mb-4">
                        {palette.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {palette.colors.map((color, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* AI Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6">
            <h2 className="text-2xl font-bold">Recent AI Suggestions</h2>

            {suggestions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No AI suggestions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Use the Chrome extension to analyze elements and get AI-powered design suggestions
                  </p>
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Add to Chrome
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion._id} className="tech-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Element Analysis</CardTitle>
                        <Badge variant="secondary">
                          {new Date(suggestion.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      {suggestion.website_url && (
                        <CardDescription className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {new URL(suggestion.website_url).hostname}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-2">Element:</h4>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {suggestion.element_html.substring(0, 100)}...
                          </code>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">AI Suggestions:</h4>
                          <div className="space-y-2">
                            {suggestion.suggestions.map((sug: any, index: number) => (
                              <div key={index} className="border-l-2 border-primary/30 pl-3">
                                <div className="font-medium">{sug.title}</div>
                                <div className="text-sm text-muted-foreground">{sug.reason}</div>
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {sug.category}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Extension Settings</h2>

            <Card className="tech-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Extension Configuration
                </CardTitle>
                <CardDescription>
                  Configure your AI CSS Inspector Chrome extension
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Auto-save Palettes</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically save discovered color palettes
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Theme</h4>
                    <p className="text-sm text-muted-foreground">
                      Extension appearance theme
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Dark Mode
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Default Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Default tool when extension is activated
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Element Inspector
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;