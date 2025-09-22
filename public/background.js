// public/background.js

const tabInspectorState = {};

function setActionIcon(tabId, isActive) {
  // FIX: Added a leading '/' to make the paths absolute
  const path = isActive ? '/icons/icon-active.png' : '/icons/icon-default.png';
  
  chrome.action.setIcon({ path: path, tabId: tabId }, () => {
    if (chrome.runtime.lastError) {
      console.error(`Error setting icon to ${path}: ${chrome.runtime.lastError.message}`);
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const getTabIdAndExecute = (callback) => {
    const tabId = sender.tab ? sender.tab.id : request.tabId;
    if (tabId) {
      callback(tabId);
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          callback(tabs[0].id);
        }
      });
    }
  };

  if (request.type === 'TOGGLE_INSPECTOR') {
    getTabIdAndExecute((id) => {
      tabInspectorState[id] = !tabInspectorState[id];
      setActionIcon(id, tabInspectorState[id]);
      chrome.tabs.sendMessage(id, { type: 'SET_INSPECTOR_ACTIVE', isActive: tabInspectorState[id] });
      sendResponse({ isActive: tabInspectorState[id] });
    });
  } else if (request.type === 'GET_INSPECTOR_STATUS') {
    getTabIdAndExecute((id) => {
      sendResponse({ isActive: !!tabInspectorState[id] });
    });
  } else if (request.type === 'ELEMENT_SELECTED') {
    getTabIdAndExecute((id) => {
      tabInspectorState[id] = false;
      setActionIcon(id, false);
      chrome.tabs.sendMessage(id, { type: 'SET_INSPECTOR_ACTIVE', isActive: false });
      chrome.runtime.sendMessage({ type: 'UPDATE_ELEMENT_DATA', data: request.data });
      sendResponse({ success: true });
    });
  }
  
  return true; // Keep message channel open for async responses
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabInspectorState[tabId];
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    tabInspectorState[tabId] = false;
    setActionIcon(tabId, false);
  }
});