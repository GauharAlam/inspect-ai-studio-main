// src/Inspector.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Power, Trash2, Copy, Zap } from 'lucide-react';
import InspectorSidebar from './components/inspector/InspectorSidebar';
import GenerativeAIView from './components/inspector/GenerativeAIView';
import './index.css';

// Yeh type definition ab yahan se export ho rahi hai
export type Tool = 'selector' | 'seeker' | 'dashboard' | 'font-finder' | 'generative-ai';

export interface ElementData {
  tag: string;
  id: string | null;
  classes: string | null;
  styles: Record<string, string>;
  html: string;
}

const FontFinderView = () => (
    <div className="p-4 text-center text-muted-foreground">Font Finder (Coming Soon)</div>
);

// SelectorView Component
const SelectorView = ({ elementData, setElementData }: { elementData: ElementData | null, setElementData: (data: ElementData | null) => void }) => {
  const handleStopSelecting = () => {
    chrome.runtime.sendMessage({ type: 'DEACTIVATE_INSPECTOR' });
  };

  const handleCopyCss = () => {
    if (elementData?.styles) {
      const fullCss = `${getReadableSelector(elementData)} {\n${formatCss(elementData.styles)}\n}`;
      navigator.clipboard.writeText(fullCss);
    }
  };

  const formatCss = (styles: Record<string, string>) => {
    if (!styles) return '';
    return Object.entries(styles)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
  };

  const getReadableSelector = (element: ElementData | null) => {
    if (!element) return '';
    const id = element.id ? `#${element.id}` : '';
    const classes = element.classes ? `.${element.classes.trim().replace(/\s+/g, '.')}` : '';
    return `${element.tag}${id}${classes}`;
  };

  return (
    <div className="p-4 flex flex-col h-full">
        <section className="space-y-3">
            <Button onClick={handleStopSelecting} variant="destructive" className="w-full">
                <Power className="mr-2 h-4 w-4" />
                Stop Selecting
            </Button>
            <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setElementData(null)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleCopyCss}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
            </div>
        </section>

        <section className="mt-6 flex-1 flex flex-col">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">Selected Element CSS</h2>
          <div className="flex-1 w-full rounded-md border border-input bg-card p-3 font-mono text-sm text-foreground overflow-auto">
            {elementData ? (
              <pre className="whitespace-pre-wrap">
                {`${getReadableSelector(elementData)} {\n${formatCss(elementData.styles)}\n}`}
              </pre>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Click on an element to see its CSS.
              </div>
            )}
          </div>
        </section>
    </div>
  );
};

// Main Inspector Component
function Inspector() {
  const [activeTool, setActiveTool] = useState<Tool>('selector');
  const [elementData, setElementData] = useState<ElementData | null>(null);

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.type === 'UPDATE_ELEMENT_DATA') {
        setElementData(message.data);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    chrome.runtime.sendMessage({ type: 'GET_LAST_ELEMENT_DATA' }, (response) => {
        if (response && response.data) {
            setElementData(response.data);
        }
    });

    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'selector':
        return <SelectorView elementData={elementData} setElementData={setElementData} />;
      case 'generative-ai':
        return <GenerativeAIView elementData={elementData} />;
      case 'font-finder':
        return <FontFinderView />;
      case 'dashboard':
        return <div className="p-4 text-center text-muted-foreground">Dashboard (Coming Soon)</div>;
      case 'seeker':
        return <div className="p-4 text-center text-muted-foreground">Seeker (Coming Soon)</div>;
      default:
        return <SelectorView elementData={elementData} setElementData={setElementData} />;
    }
  };

  return (
    <div className="w-[380px] h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center gap-2 p-3 border-b border-border flex-shrink-0">
        <div className="w-7 h-7 bg-gradient-to-r from-primary to-accent rounded-md flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-md font-bold">AI CSS Inspector</h1>
      </header>

      <div className="flex flex-grow overflow-hidden">
        <InspectorSidebar activeTool={activeTool} setActiveTool={setActiveTool} />
        <main className="flex-grow overflow-y-auto flex flex-col">{renderActiveTool()}</main>
      </div>
    </div>
  );
}

export default Inspector;