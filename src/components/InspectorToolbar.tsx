import React, { useState } from 'react';
import {
  Lock,
  Hand,
  MousePointer,
  Square,
  Minus,
  Pencil,
  Type,
  ImageIcon,
  Trash2,
  Grid,
  Settings,
} from 'lucide-react';
import { Button } from './ui/button';

const InspectorToolbar = () => {
  const [activeTool, setActiveTool] = useState('select');
  const [isLocked, setIsLocked] = useState(false);

  const handleToolClick = (tool: string) => {
    setActiveTool(tool);
    // Send message to content script to change mode
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { tool });
      }
    });
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { lock: !isLocked });
        }
    });
  };

  return (
    <div
      className="fixed top-1/2 left-4 -translate-y-1/2 z-[9999] bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-border flex flex-col gap-2"
    >
        <Button variant={isLocked ? "secondary" : "ghost"} size="icon" onClick={toggleLock}>
            <Lock size={16} />
        </Button>
      <Button variant={activeTool === 'pan' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolClick('pan')}>
        <Hand size={16} />
      </Button>
      <Button variant={activeTool === 'select' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolClick('select')}>
        <MousePointer size={16} />
      </Button>
      <Button variant={activeTool === 'draw-rect' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolClick('draw-rect')}>
        <Square size={16} />
      </Button>
      <Button variant={activeTool === 'draw-line' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolClick('draw-line')}>
        <Minus size={16} />
      </Button>
      <Button variant={activeTool === 'edit-text' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolClick('edit-text')}>
        <Pencil size={16} />
      </Button>
      <Button variant={activeTool === 'font-inspector' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolClick('font-inspector')}>
        <Type size={16} />
      </Button>
      <Button variant={activeTool === 'image-inspector' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolClick('image-inspector')}>
        <ImageIcon size={16} />
      </Button>
      <Button variant={activeTool === 'delete' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolClick('delete')}>
        <Trash2 size={16} />
      </Button>
      <Button variant={activeTool === 'grid' ? "secondary" : "ghost"} size="icon" onClick={() => handleToolClick('grid')}>
        <Grid size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => window.open(chrome.runtime.getURL('index.html'))}>
        <Settings size={16} />
      </Button>
    </div>
  );
};

export default InspectorToolbar;