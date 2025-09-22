// src/components/inspector/ColorPickerView.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const ColorPickerView = () => {
  const [colors, setColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'COLOR_PALETTE') {
        setColors(message.data);
        setIsLoading(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    chrome.runtime.sendMessage({ type: 'GET_COLOR_PALETTE' });

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: 'Color Copied!',
      description: (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color }} />
          <span>{color}</span>
        </div>
      ),
    });
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Color Palette</h2>
      <ScrollArea className="flex-grow">
        {isLoading ? (
          <p className="text-muted-foreground text-center">Extracting colors...</p>
        ) : colors.length > 0 ? (
          <div className="grid grid-cols-4 gap-3">
            {colors.map((color, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-full border cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => handleCopyColor(color)}
                />
                <Button variant="ghost" size="sm" className="h-auto px-1 py-0.5 text-xs" onClick={() => handleCopyColor(color)}>
                  <Copy className="w-3 h-3 mr-1" />
                  {color}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">No colors found on this page.</p>
        )}
      </ScrollArea>
    </div>
  );
};

export default ColorPickerView;