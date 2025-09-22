// src/components/inspector/InspectorSidebar.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, LayoutDashboard, Type, Sparkles, Palette } from 'lucide-react';

type Tool = 'selector' | 'seeker' | 'dashboard' | 'font-finder' | 'generative-ai' | 'color-picker';

interface InspectorSidebarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

const tools = [
  { id: 'selector', icon: Search, label: 'Selector' },
  { id: 'seeker', icon: SlidersHorizontal, label: 'Seeker' },
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'font-finder', icon: Type, label: 'Font Finder' },
  { id: 'color-picker', icon: Palette, label: 'Color Picker' }, // New Tool
  { id: 'generative-ai', icon: Sparkles, label: 'Generative AI' },
] as const;


const InspectorSidebar: React.FC<InspectorSidebarProps> = ({ activeTool, setActiveTool }) => {
  return (
    <aside className="w-24 bg-card p-2 border-r border-border flex flex-col gap-1">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant={activeTool === tool.id ? 'secondary' : 'ghost'}
          className="w-full h-auto flex flex-col items-center justify-center p-2 gap-1"
          onClick={() => setActiveTool(tool.id)}
        >
          <tool.icon className="w-5 h-5" />
          <span className="text-xs">{tool.label}</span>
        </Button>
      ))}
    </aside>
  );
};

export default InspectorSidebar;