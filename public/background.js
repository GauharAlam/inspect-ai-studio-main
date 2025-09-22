// public/background.js

const tabInspectorState = {};
let lastElementData = null; // Element ka data store karne ke liye variable

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
  if (request.type === 'TOGGLE_INSPECTOR') {
    await ensureScriptInjected(tabId);
    tabInspectorState[tabId] = !tabInspectorState[tabId];
    setActionIcon(tabId, tabInspectorState[tabId]);
    chrome.tabs.sendMessage(tabId, { type: 'SET_INSPECTOR_ACTIVE', isActive: tabInspectorState[tabId] });
    sendResponse({ isActive: tabInspectorState[tabId] });
  } else if (request.type === 'GET_INSPECTOR_STATUS') {
    sendResponse({ isActive: !!tabInspectorState[tabId] });
  } else if (request.type === 'ELEMENT_SELECTED') {
    lastElementData = request.data; // Data ko yahan store karein
    tabInspectorState[tabId] = false;
    setActionIcon(tabId, false);
    chrome.tabs.sendMessage(tabId, { type: 'SET_INSPECTOR_ACTIVE', isActive: false });
    chrome.runtime.sendMessage({ type: 'UPDATE_ELEMENT_DATA', data: lastElementData });
    sendResponse({ success: true });
  } else if (request.type === 'GET_LAST_ELEMENT_DATA') {
    // Jab popup data maange, to yahan se bhejein
    sendResponse({ data: lastElementData });
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const tabId = sender.tab ? sender.tab.id : request.tabId;
  if (!tabId) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        handleMessage(request, tabs[0].id, sendResponse);
      }
    });
  } else {
    handleMessage(request, tabId, sendResponse);
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