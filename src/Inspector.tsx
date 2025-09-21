// src/Inspector.tsx
import React, { useEffect, useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Zap } from 'lucide-react';
import './index.css';

interface ElementData {
  tag: string;
  id: string;
  classes: string;
  styles: Record<string, string>;
}

function Inspector() {
  const [inspectorActive, setInspectorActive] = useState(false);
  const [elementData, setElementData] = useState<ElementData | null>(null);

  useEffect(() => {
    const messageListener = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      if (message.type === 'update' && message.data) {
        setElementData(message.data);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    chrome.runtime.sendMessage({ type: 'getElementData' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      if (response) {
        setElementData(response);
      }
    });

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleToggleInspector = () => {
    chrome.runtime.sendMessage({ type: 'toggleInspector' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            // Handle error, maybe show a message to the user
            return;
        }
      if (response && response.success) {
        setInspectorActive(!inspectorActive);
        if(inspectorActive) {
            setElementData(null);
        }
      } else {
        console.error("Failed to toggle inspector:", response?.error);
      }
    });
  };

  return (
    <div className="w-[350px] bg-background text-foreground p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold">AI CSS Inspector</h1>
        </div>
        <Button onClick={handleToggleInspector} variant={inspectorActive ? 'destructive' : 'default'}>
          {inspectorActive ? 'Deactivate' : 'Activate'}
        </Button>
      </div>

      {elementData ? (
        <Card className="tech-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">{elementData.tag}</Badge>
              <span>{elementData.id !== 'N/A' ? `#${elementData.id}` : ''}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-2 break-words">
                Classes: {elementData.classes}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(elementData.styles).map(([key, value]) => (
                <div key={key}>
                  <p className="text-muted-foreground capitalize text-xs">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="font-mono text-xs">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-muted-foreground p-8">
          {inspectorActive ? 'Click on an element on the page to inspect it.' : 'Click "Activate" to start inspecting.'}
        </div>
      )}
    </div>
  );
}

export default Inspector;