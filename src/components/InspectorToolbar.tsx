import React, { useState } from 'react';
import { Button } from "./ui/button";
import { ArrowLeft, Code, Palette, MousePointer, Trash2, Bot, TextCursor, Minimize, Maximize } from 'lucide-react';

export function InspectorToolbar({ onSelectView, onBack, showBackButton }) {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = () => {
    const newMinimizedState = !isMinimized;
    setIsMinimized(newMinimizedState);
    const event = new CustomEvent('toggle-minimize', { detail: newMinimizedState });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex justify-between items-center p-2 bg-gray-800 text-white flex-shrink-0">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => onSelectView('selector')}>
          <MousePointer className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onSelectView('color-picker')}>
          <Palette className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onSelectView('live-text-editor')}>
          <TextCursor className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onSelectView('delete-element')}>
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onSelectView('generative-ai')}>
          <Bot className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onSelectView('code-editor')}>
          <Code className="h-4 w-4" />
        </Button>
      </div>
      <Button variant="ghost" size="icon" onClick={toggleMinimize}>
        {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
      </Button>
    </div>
  );
}