// public/background.js

const tabInspectorState = {};
let lastElementData = null;

function setActionIcon(tabId, isActive) {
  const path = isActive ? '/icons/icon-active.png' : '/icons/icon-default.png';
  chrome.action.setIcon({ path, tabId }, () => {
    if (chrome.runtime.lastError) {
      console.error(`Error setting icon for tab ${tabId}: ${chrome.runtime.lastError.message}`);
    }
  });
}

async function ensureScriptInjected(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => window.aiCssInspectorInjected,
    });
    if (!results || !results[0] || !results[0].result) {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content-script.js'],
      });
    }
  } catch (e) {
    console.error(`Failed to inject script into tab ${tabId}:`, e);
  }
}

async function handleMessage(request, tabId, sendResponse) {
  if (request.type === 'TOGGLE_INSPECTOR' || request.type === 'SET_INSPECTOR_ACTIVE') {
      await ensureScriptInjected(tabId);
      const newState = request.type === 'TOGGLE_INSPECTOR' ? !tabInspectorState[tabId] : request.isActive;
      tabInspectorState[tabId] = newState;
      setActionIcon(tabId, newState);
      chrome.tabs.sendMessage(tabId, { type: 'SET_INSPECTOR_ACTIVE', isActive: newState, mode: request.mode });
      sendResponse({ isActive: newState });
  } else if (request.type === 'GET_INSPECTOR_STATUS') {
    sendResponse({ isActive: !!tabInspectorState[tabId] });
  } else if (request.type === 'ELEMENT_SELECTED') {
    lastElementData = request.data;
    // **Improvement**: Turn off inspector after selection
    tabInspectorState[tabId] = false; 
    setActionIcon(tabId, false);
    chrome.tabs.sendMessage(tabId, { type: 'SET_INSPECTOR_ACTIVE', isActive: false });
    // Notify popup that data is updated AND inspector is now off
    chrome.runtime.sendMessage({ type: 'UPDATE_ELEMENT_DATA', data: lastElementData });
    sendResponse({ success: true });
  } else if (request.type === 'GET_LAST_ELEMENT_DATA') {
    sendResponse({ data: lastElementData });
  } else if (request.type === 'OPERATION_COMPLETE') {
      // For tools like delete/edit that deactivate themselves
      tabInspectorState[tabId] = false;
      setActionIcon(tabId, false);
      chrome.runtime.sendMessage({ type: 'INSPECTOR_DEACTIVATED' });
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const tabId = sender.tab ? sender.tab.id : (request.tabId || (sender.tab ? sender.tab.id : null));
  if (tabId) {
    handleMessage(request, tabId, sendResponse);
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        handleMessage(request, tabs[0].id, sendResponse);
      }
    });
  }
  return true;
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