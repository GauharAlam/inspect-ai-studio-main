// public/background.js

const tabInspectorState = {};
let lastElementData = null;

function setActionIcon(tabId, isActive) {
  const path = isActive ? 'icons/icon-active.png' : 'icons/icon-default.png';
  chrome.action.setIcon({ path, tabId });
}

async function ensureScriptInjected(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => window.aiCssInspectorInjected,
    });
    if (!results || !results[0] || !results[0].result) {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content-script.js'],
      });
    }
  } catch (e) {
    console.error(`Failed to inject script into tab ${tabId}:`, e);
  }
}

async function toggleInspector(tabId, forceState) {
    const currentState = !!tabInspectorState[tabId];
    const newState = forceState !== undefined ? forceState : !currentState;

    if (currentState === newState) return; // No change needed

    tabInspectorState[tabId] = newState;
    setActionIcon(tabId, newState);

    await ensureScriptInjected(tabId);
    chrome.tabs.sendMessage(tabId, { type: 'SET_INSPECTOR_ACTIVE', isActive: newState });
}

// Extension icon click karne par
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    toggleInspector(tab.id);
  }
});

// User ke tab badalne par icon update karein
chrome.tabs.onActivated.addListener(activeInfo => {
    setActionIcon(activeInfo.tabId, !!tabInspectorState[activeInfo.tabId]);
});

// Alag-alag scripts se messages handle karein
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const tabId = sender.tab?.id;

    if (request.type === 'ELEMENT_SELECTED') {
        lastElementData = request.data;
        // Data ko UI panel mein bhejein
        chrome.runtime.sendMessage({ type: 'UPDATE_ELEMENT_DATA', data: lastElementData });
        sendResponse({ success: true });
    } else if (request.type === 'DEACTIVATE_INSPECTOR' && tabId) {
        // Jab UI panel se "Stop Selecting" click ho
        toggleInspector(tabId, false);
        sendResponse({ success: true });
    } else if (request.type === 'GET_LAST_ELEMENT_DATA') {
        sendResponse({ data: lastElementData });
    }
    
    return true; // Async response ke liye zaroori
});