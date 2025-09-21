// src/Inspector.tsx
import React, { useState } from 'react';
import InspectorSidebar from './components/inspector/InspectorSidebar';
import SelectorView from './components/inspector/SelectorView';
import FontFinderView from './components/inspector/SelectorView'; // Import the new Font Finder view
import { Zap } from 'lucide-react';
import './index.css';

// Yahan aap apne sabhi tools ke naam define kar sakte hain
type Tool = 'selector' | 'seeker' | 'dashboard' | 'font-finder' | 'generative-ai';

function Inspector() {
  const [activeTool, setActiveTool] = useState<Tool>('selector');

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'selector':
        return <SelectorView />;
      // Abhi ke liye dusre tools placeholder hain
      case 'dashboard':
        return <div className="p-4 text-center text-muted-foreground">Dashboard View (Coming Soon)</div>;
      case 'font-finder':
        return <div className="p-4 text-center text-muted-foreground">Font Finder (Coming Soon)</div>;
      default:
        return <SelectorView />;
    }
  };

  return (
    <div className="w-[380px] h-[550px] bg-background text-foreground flex flex-col">
      <header className="flex items-center gap-2 p-3 border-b border-border flex-shrink-0">
        <div className="w-7 h-7 bg-gradient-to-r from-primary to-accent rounded-md flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-md font-bold">AI CSS Inspector</h1>
      </header>
      
      <div className="flex flex-grow overflow-hidden">
        <InspectorSidebar activeTool={activeTool} setActiveTool={setActiveTool} />
        <main className="flex-grow overflow-y-auto">
          {renderActiveTool()}
        </main>
      </div>
    </div>
  );
}

export default Inspector;