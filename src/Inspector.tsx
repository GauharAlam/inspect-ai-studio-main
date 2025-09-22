// src/Inspector.tsx
import React, { useState, useEffect } from 'react';
import { Home, Zap, X } from 'lucide-react';
import { Button } from './components/ui/button';
import MainView from './components/inspector/MainView';
import SelectorView from './components/inspector/SelectorView';
import GenerativeAIView from './components/inspector/GenerativeAIView';
import FontFinderView from './components/inspector/FontFinderView';
import ColorPickerView from './components/inspector/ColorPickerView';
import LiveTextEditorView from './components/inspector/LiveTextEditorView';
import DeleteElementView from './components/inspector/DeleteElementView';
import './index.css';

export interface ElementData {
  tag: string;
  id: string | null;
  classes: string | null;
  styles: Record<string, string>;
  html: string;
}

// **FIX**: Added 'dashboard' and 'seeker' back to the list of allowed tools.
type Tool = 'main' | 'selector' | 'live-text-editor' | 'font-finder' | 'color-picker' | 'delete-element' | 'screenshot' | 'generative-ai' | 'dashboard' | 'seeker';

function Inspector() {
  const [activeTool, setActiveTool] = useState<Tool>('main');
  const [elementData, setElementData] = useState<ElementData | null>(null);
  const [inspectorActive, setInspectorActive] = useState(false);

  // The rest of this file remains the same as the previous version...
  // ... (useEffect, handlers, and renderActiveTool function)
  
  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.type === 'UPDATE_ELEMENT_DATA') {
        setElementData(message.data);
        setInspectorActive(false); 
      }
      if (message.type === 'INSPECTOR_DEACTIVATED') {
          setInspectorActive(false);
          setActiveTool('main');
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    chrome.runtime.sendMessage({ type: 'GET_LAST_ELEMENT_DATA' }, (response) => {
      if (chrome.runtime.lastError) { return; }
      if (response && response.data) { setElementData(response.data); }
    });
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
            chrome.runtime.sendMessage({ type: 'GET_INSPECTOR_STATUS', tabId: tabs[0].id }, (response) => {
                if (chrome.runtime.lastError) { return; }
                if (response) { setInspectorActive(response.isActive); }
            });
        }
    });

    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const handleToggleInspector = (forceState?: boolean) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        const newState = forceState ?? !inspectorActive;
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_INSPECTOR_ACTIVE', isActive: newState, mode: activeTool });
        setInspectorActive(newState);
      }
    });
  };
  
  useEffect(() => {
    const toolsRequiringInspector = ['selector', 'live-text-editor', 'delete-element'];
    const shouldBeActive = toolsRequiringInspector.includes(activeTool);
    
    if (shouldBeActive && !inspectorActive) {
      handleToggleInspector(true);
    } else if (!shouldBeActive && inspectorActive) {
      handleToggleInspector(false);
    }
  }, [activeTool]);

  const handleToolSelect = (tool: string) => {
    if (tool === 'screenshot') {
      chrome.tabs.captureVisibleTab(null, {}, (dataUrl) => {
        const link = document.createElement('a');
        link.download = 'screenshot.png';
        link.href = dataUrl;
        link.click();
      });
      return;
    }
    setActiveTool(tool as Tool);
  };
  
  const handleClose = () => {
    if (inspectorActive) {
        handleToggleInspector(false);
    }
    window.close();
  };

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'selector':
        return (
          <SelectorView
            elementData={elementData}
            inspectorActive={inspectorActive}
            onToggleInspector={() => handleToggleInspector()}
            setElementData={setElementData}
          />
        );
      case 'live-text-editor':
        return <LiveTextEditorView />;
      case 'font-finder':
        return <FontFinderView />;
      case 'color-picker':
        return <ColorPickerView />;
      case 'delete-element':
        return <DeleteElementView />;
      case 'generative-ai':
        return <GenerativeAIView elementData={elementData} />;
      case 'dashboard':
          chrome.tabs.create({ url: 'index.html' });
          return <div className="p-4 text-center text-muted-foreground">Opening dashboard...</div>;
      case 'seeker':
        return <div className="p-4 text-center text-muted-foreground">Seeker (Coming Soon)</div>;
      default:
        return <MainView onToolSelect={handleToolSelect} />;
    }
  };

  return (
    <div className="w-[380px] h-[550px] bg-gray-900 text-gray-100 flex flex-col">
      <header className="flex items-center justify-between gap-2 p-3 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-r from-brand to-green-400 rounded-md flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-md font-bold">AI CSS Inspector</h1>
        </div>
        <div>
            {activeTool !== 'main' && (
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setActiveTool('main')}>
                    <Home className="w-4 h-4" />
                </Button>
            )}
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleClose}>
                <X className="w-4 h-4" />
            </Button>
        </div>
      </header>
      <main className="flex-grow overflow-y-auto">
        {renderActiveTool()}
      </main>
    </div>
  );
}


export default Inspector;