// src/components/inspector/SelectorView.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Power } from 'lucide-react';

interface ElementData {
  tag: string;
  id: string;
  classes: string;
  styles: Record<string, string>;
}

const SelectorView = () => {
  const [inspectorActive, setInspectorActive] = useState(false);
  const [elementData, setElementData] = useState<ElementData | null>(null);

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.type === 'update' && message.data) {
        setElementData(message.data);
      }
      if (message.type === 'inspectorToggled') {
        setInspectorActive(message.data.isEnabled);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    chrome.runtime.sendMessage({ type: 'getInspectorStatus' }, (response) => {
        if (chrome.runtime.lastError) return;
        if (response) {
            setInspectorActive(response.isEnabled);
            if (response.lastData) {
                setElementData(response.lastData);
            }
        }
    });

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleToggleInspector = () => {
    chrome.runtime.sendMessage({ type: 'toggleInspector' });
  };

  const handleCopyCss = () => {
    if (elementData) {
      const cssString = Object.entries(elementData.styles)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
        .join('\n');
      navigator.clipboard.writeText(cssString);
      // Optional: Add a toast notification for copy success
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <Button onClick={handleToggleInspector} className="w-full mb-4" variant={inspectorActive ? 'destructive' : 'default'}>
        <Power className="w-4 h-4 mr-2" />
        {inspectorActive ? 'Stop Selecting' : 'Start Selecting Element'}
      </Button>
      
      <div className="flex-grow overflow-y-auto border border-border rounded-md p-3 bg-card/50">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm">Compiled CSS</h3>
            <Button variant="ghost" size="sm" onClick={handleCopyCss} disabled={!elementData}>
                <Copy className="w-3 h-3 mr-1" />
                Copy
            </Button>
        </div>
        
        {elementData ? (
            <div className="font-mono text-xs space-y-1 text-muted-foreground">
                <p><span className="text-primary">{elementData.tag}</span> {elementData.id !== 'N/A' && <span className="text-accent">#{elementData.id}</span>}</p>
                <p>.<span className="text-secondary">{elementData.classes.replace(/, /g, '.')}</span></p>
                <p>{"{"}</p>
                <div className="pl-4">
                    {Object.entries(elementData.styles).map(([key, value]) => (
                        <p key={key}>
                            <span className="text-primary-glow">{key.replace(/([A-Z])/g, '-$1').toLowerCase()}</span>: <span className="text-foreground">{value}</span>;
                        </p>
                    ))}
                </div>
                <p>{"}"}</p>
            </div>
        ) : (
            <div className="text-center text-sm text-muted-foreground pt-10">
                {inspectorActive ? "Click on any element on the page to see its CSS." : "Click 'Start Selecting' to begin."}
            </div>
        )}
      </div>
    </div>
  );
};

export default SelectorView;