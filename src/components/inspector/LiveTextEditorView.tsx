// src/components/inspector/LiveTextEditorView.tsx
import React from 'react';
import { Edit, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LiveTextEditorView = () => {
  // In a real implementation, you would get the selected text
  // and call the Gemini API to get suggestions.
  const handleAiRephrase = () => {
    alert("AI Rephrase feature coming soon! This would send the selected text to an AI for suggestions.");
  };

  return (
    <div className="p-4 h-full flex flex-col items-center justify-center text-center">
      <Edit className="w-12 h-12 text-brand mb-4" />
      <h2 className="text-lg font-semibold">Live Text Editor</h2>
      <p className="text-muted-foreground text-sm mb-4">Click on any text on the page to edit it directly.</p>
      <Button onClick={handleAiRephrase} variant="outline">
        <Sparkles className="w-4 h-4 mr-2" />
        AI Rephrase Selected Text
      </Button>
    </div>
  );
};

export default LiveTextEditorView;