import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import './inspector.css';

const Inspector = () => {
  const handleToggleInspector = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, { toggleInspector: true });
        window.close(); // Close the popup after activating
      }
    });
  };

  return (
    <div className="inspector-popup">
      <div className="header">
        <Zap className="logo" />
        <h1 className="title">AI CSS Inspector</h1>
      </div>
      <p className="description">
        Click the button below to start inspecting elements on the page.
      </p>
      <Button onClick={handleToggleInspector} className="w-full">
        Activate Inspector
      </Button>
    </div>
  );
};

export default Inspector;