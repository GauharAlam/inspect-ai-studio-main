// src/components/inspector/MainView.tsx
import React from 'react';
import {
  Code, Edit, Type, Palette, Trash2, Camera, Move, Download, Image as ImageIcon, Ruler, BoxSelect, Sparkles
} from 'lucide-react';
import type { Tool } from '@/Inspector';

interface MainViewProps {
  onToolSelect: (tool: Tool) => void;
}

const features: { id: Tool; label: string; icon: React.ElementType; disabled?: boolean }[] = [
  { id: 'selector', label: 'CSS Inspector', icon: Code },
  { id: 'live-text-editor', label: 'Live Text Editor', icon: Edit },
  { id: 'font-finder', label: 'List All Fonts', icon: Type },
  { id: 'color-picker', label: 'Color Palette', icon: Palette },
  { id: 'move-element', label: 'Move Element', icon: Move, disabled: true },
  { id: 'delete-element', label: 'Delete Element', icon: Trash2 },
  { id: 'extract-images', label: 'Extract Images', icon: ImageIcon, disabled: true },
  { id: 'page-ruler', label: 'Page Ruler', icon: Ruler, disabled: true },
  { id: 'screenshot', label: 'Take Screenshot', icon: Camera, disabled: true },
  { id: 'generative-ai', label: 'AI Suggestions', icon: Sparkles },
  // These are placeholders from the image for future features
  { id: 'page-ruler', label: 'Fonts Changer', icon: Type, disabled: true },
  { id: 'page-ruler', label: 'Export Element', icon: Download, disabled: true },
  { id: 'page-ruler', label: 'Page Outliner', icon: BoxSelect, disabled: true },
  { id: 'page-ruler', label: 'Image Replacer', icon: ImageIcon, disabled: true },
];

const MainView: React.FC<MainViewProps> = ({ onToolSelect }) => {
  return (
    <div className="p-4 bg-background h-full">
      <div className="grid grid-cols-2 gap-3">
        {features.map(feature => (
          <button
            key={feature.id + feature.label}
            onClick={() => onToolSelect(feature.id)}
            disabled={feature.disabled}
            className="group flex flex-col items-center justify-center gap-2 h-20 p-2 rounded-lg bg-card/50 border border-border text-foreground transition-colors hover:bg-primary/10 hover:border-primary/30 disabled:opacity-50 disabled:pointer-events-none disabled:hover:bg-card/50"
          >
            <feature.icon className="w-6 h-6 text-muted-foreground transition-colors group-hover:text-primary" />
            <span className="text-xs font-medium text-center">{feature.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MainView;