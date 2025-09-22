// src/components/inspector/MainView.tsx
import React from 'react';
import {
  Code, Edit, Type, List, Palette, Trash2, Camera, LayoutDashboard, SlidersHorizontal,
  Move, Download, Image, Ruler, BoxSelect, Replace
} from 'lucide-react';

interface MainViewProps {
  onToolSelect: (tool: string) => void;
}

const features = [
  { id: 'selector', label: 'CSS Inspector', icon: Code },
  { id: 'live-text-editor', label: 'Live Text Editor', icon: Edit },
  { id: 'font-finder', label: 'List All Fonts', icon: List },
  { id: 'color-picker', label: 'Color Palette', icon: Palette },
  { id: 'delete-element', label: 'Delete Element', icon: Trash2 },
  { id: 'screenshot', label: 'Take Screenshot', icon: Camera },
  // **FIX**: Added Dashboard and Seeker buttons back in
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'seeker', label: 'Seeker', icon: SlidersHorizontal, disabled: true },
  // These are placeholders for future implementation
  { id: 'move-element', label: 'Move Element', icon: Move, disabled: true },
  { id: 'fonts-changer', label: 'Fonts Changer', icon: Type, disabled: true },
  { id: 'extract-images', label: 'Extract Images', icon: Image, disabled: true },
  { id: 'page-ruler', label: 'Page Ruler', icon: Ruler, disabled: true },
];

const MainView: React.FC<MainViewProps> = ({ onToolSelect }) => {
  return (
    <div className="p-4 bg-gray-900/50 h-full">
      <div className="grid grid-cols-2 gap-3">
        {features.map(feature => (
          <button
            key={feature.id}
            onClick={() => onToolSelect(feature.id)}
            disabled={feature.disabled}
            className="btn-feature disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800/50 disabled:hover:border-gray-700 disabled:hover:shadow-none"
          >
            <feature.icon size={24} />
            <span className="text-xs font-medium">{feature.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MainView;