import React, { useState, useEffect } from 'react';
import InspectorSidebar from './components/inspector/InspectorSidebar';
import SelectorView from './components/inspector/SelectorView';
import GenerativeAIView from './components/inspector/GenerativeAIView';
import { Zap } from 'lucide-react';
import './index.css';

const FontFinderView = () => (
  <div className="p-4 text-center text-muted-foreground">Font Finder (Coming Soon)</div>
);

export interface ElementData {
  tag: string;
  id: string | null;
  classes: string | null;
  styles: Record<string, string>;
  html: string;
}

type Tool = 'selector' | 'seeker' | 'dashboard' | 'font-finder' | 'generative-ai';

function Inspector() {
  const [activeTool, setActiveTool] = useState<Tool>('selector');
  const [elementData, setElementData] = useState<ElementData | null>(null);
  const [inspectorActive, setInspectorActive] = useState(false);

  useEffect(() => {
    const messageListener = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.type === 'UPDATE_ELEMENT_DATA') {
        console.log("Popup received element data:", message.data);
        setElementData(message.data);
        setInspectorActive(false);
        setActiveTool('selector');
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    chrome.runtime.sendMessage({ type: 'GET_INSPECTOR_STATUS' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      if (response) {
        setInspectorActive(response.isActive);
      }
    });

    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const handleToggleInspector = () => {
    chrome.runtime.sendMessage({ type: 'TOGGLE_INSPECTOR' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      if (response) {
        console.log("Inspector toggled. Active:", response.isActive);
        setInspectorActive(response.isActive);
      }
    });
  };

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'selector':
        return (
          <SelectorView
            elementData={elementData}
            inspectorActive={inspectorActive}
            onToggleInspector={handleToggleInspector}
          />
        );
      case 'generative-ai':
        return <GenerativeAIView elementData={elementData} />;
      case 'font-finder':
        return <FontFinderView />;
      case 'dashboard':
        return <div className="p-4 text-center text-muted-foreground">Dashboard (Coming Soon)</div>;
      case 'seeker':
        return <div className="p-4 text-center text-muted-foreground">Seeker (Coming Soon)</div>;
      default:
        return (
          <SelectorView
            elementData={elementData}
            inspectorActive={inspectorActive}
            onToggleInspector={handleToggleInspector}
          />
        );
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
        <main className="flex-grow overflow-y-auto">{renderActiveTool()}</main>
      </div>
    </div>
  );
}

export default Inspector;
