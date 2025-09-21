// public/background.js

let inspectedElementData = null;
let inspectorStatusByTab = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  // This is an async listener, so return true.
  (async () => {
    if (request.type === 'elementInfo') {
      inspectedElementData = request.data;
      await chrome.runtime.sendMessage({ type: 'update', data: inspectedElementData });
    } 
    
    else if (request.type === 'toggleInspector') {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        try {
          const response = await chrome.tabs.sendMessage(tab.id, { toggleInspector: true });
          inspectorStatusByTab[tab.id] = response.inspectorEnabled;
          if (!response.inspectorEnabled) {
            inspectedElementData = null;
          }
          await chrome.runtime.sendMessage({ type: 'inspectorToggled', data: { isEnabled: response.inspectorEnabled } });
        } catch (e) {
          console.warn("Could not toggle inspector. Is the content script injected?", e.message);
        }
      }
    } 
    
    else if (request.type === 'getInspectorStatus') {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
            sendResponse({ 
                isEnabled: inspectorStatusByTab[tab.id] || false,
                lastData: inspectedElementData 
            });
        }
    }
    
    else if (request.type === 'inspectorToggledOff') {
        if(tabId) inspectorStatusByTab[tabId] = false;
        await chrome.runtime.sendMessage({ type: 'inspectorToggled', data: { isEnabled: false } });
    }

  })();
  
  return true;
});

// Clear status when a tab is closed or reloaded
chrome.tabs.onRemoved.addListener((tabId) => {
  delete inspectorStatusByTab[tabId];
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading') {
        delete inspectorStatusByTab[tabId];
    }
});