// src/Inspector.tsx
import React, { useState, useEffect } from 'react';
import { Power, ArrowLeft, Zap } from 'lucide-react';
import MainView from './components/inspector/MainView';
import CssInspectorView from './components/inspector/CssInspectorView'; 
import GenerativeAIView from './components/inspector/GenerativeAIView';
import ColorPickerView from './components/inspector/ColorPickerView';
import FontFinderView from './components/inspector/FontFinderView';
import LiveTextEditorView from './components/inspector/LiveTextEditorView';
import DeleteElementView from './components/inspector/DeleteElementView';
import { Button } from './components/ui/button';
import './index.css';

export type Tool = 'selector' | 'live-text-editor' | 'font-finder' | 'color-picker' | 'delete-element' | 'generative-ai' | 'screenshot' | 'move-element' | 'extract-images' | 'page-ruler';

export interface ElementData {
  tag: string;
  id: string | null;
  classes: string | null;
  styles: Record<string, string>;
  html: string;
}

const viewMap: Record<string, React.FC<any>> = {
  'selector': CssInspectorView,
  'generative-ai': GenerativeAIView,
  'color-picker': ColorPickerView,
  'font-finder': FontFinderView,
  'live-text-editor': LiveTextEditorView,
  'delete-element': DeleteElementView,
  'screenshot': () => <div className="p-4 text-center">Screenshot Tool (Coming Soon)</div>,
  'move-element': () => <div className="p-4 text-center">Move Element Tool (Coming Soon)</div>,
  'extract-images': () => <div className="p-4 text-center">Extract Images Tool (Coming Soon)</div>,
  'page-ruler': () => <div className="p-4 text-center">Page Ruler Tool (Coming Soon)</div>,
};

function Inspector() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [elementData, setElementData] = useState<ElementData | null>(null);
  const [inspectorActive, setInspectorActive] = useState(false);

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.type === 'UPDATE_ELEMENT_DATA') {
        setElementData(message.data);
      } else if (message.type === 'INSPECTOR_STATUS_CHANGED') {
        setInspectorActive(message.isActive);
        if (!message.isActive) {
          setActiveTool(null);
        }
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    chrome.runtime.sendMessage({ type: 'GET_LAST_ELEMENT_DATA' }, (response) => {
      if (response?.data) setElementData(response.data);
    });
    chrome.runtime.sendMessage({ type: 'GET_INSPECTOR_STATUS' }, (response) => {
        if (response) setInspectorActive(response.isActive);
    });

    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const setToolAndActivateInspector = (tool: Tool | null) => {
    setActiveTool(tool);
    const toolsRequiringActivation: Tool[] = ['selector', 'delete-element', 'live-text-editor', 'move-element'];
    const shouldActivate = tool !== null && toolsRequiringActivation.includes(tool);
    
    chrome.runtime.sendMessage({ 
      type: 'ACTIVATE_TOOL', 
      tool: shouldActivate ? tool : null 
    });
  };

  const handleBack = () => {
    setToolAndActivateInspector(null);
  };
  
  const renderActiveTool = () => {
    if (!activeTool) {
      return <MainView onToolSelect={setToolAndActivateInspector} />;
    }
    const ViewComponent = viewMap[activeTool];
    return ViewComponent ? <ViewComponent elementData={elementData} setElementData={setElementData} /> : <MainView onToolSelect={setToolAndActivateInspector} />;
  };

  return (
    <div className="w-[380px] h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between gap-2 p-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          {activeTool && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-7 w-7">
              <ArrowLeft />
            </Button>
          )}
          <div className="w-7 h-7 bg-gradient-to-r from-primary to-accent rounded-md flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-md font-bold">AI CSS Inspector</h1>
        </div>
        {inspectorActive && (
          <Button variant="destructive" size="sm" onClick={() => setToolAndActivateInspector(null)}>
            <Power className="mr-2 h-4 w-4" />
            Stop
          </Button>
        )}
      </header>
      
      <main className="flex-grow overflow-y-auto flex flex-col">{renderActiveTool()}</main>
    </div>
  );
}

export default Inspector;