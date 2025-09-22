// src/components/inspector/FontFinderView.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Type } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

const FontFinderView = () => {
  const [fonts, setFonts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'FONT_LIST') {
        setFonts(message.data);
        setIsLoading(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    chrome.runtime.sendMessage({ type: 'GET_FONT_LIST' });

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);
  
  const handleCopyFont = (font: string) => {
    navigator.clipboard.writeText(font);
    toast({
      title: 'Font Copied!',
      description: `"${font}" copied to clipboard.`,
    });
  };

  return (
    <div className="p-4 h-full flex flex-col">
       <div className="flex items-center gap-2 mb-4">
        <Type className="w-6 h-6 text-primary" />
        <h2 className="text-lg font-semibold">Fonts on Page</h2>
      </div>
      <ScrollArea className="flex-grow">
        {isLoading ? (
          <p className="text-muted-foreground text-center">Finding fonts...</p>
        ) : fonts.length > 0 ? (
          <div className="space-y-3">
            {fonts.map((font, index) => (
              <Card key={index} className="bg-card/50">
                <CardContent className="p-3 flex items-center justify-between">
                   <p className="font-mono text-sm" style={{ fontFamily: font }}>{font}</p>
                   <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleCopyFont(font)}>
                       <Copy className="w-4 h-4" />
                   </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">No unique fonts found.</p>
        )}
      </ScrollArea>
    </div>
  );
};

export default FontFinderView;