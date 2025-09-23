// public/background.js

const tabState = {};
let lastElementData = null;

function getTabState(tabId) {
  if (!tabState[tabId]) {
    tabState[tabId] = { isActive: false, tool: null };
  }
  return tabState[tabId];
}

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

async function setInspectorState(tabId, isActive, tool = null) {
  const state = getTabState(tabId);
  if (state.isActive === isActive && state.tool === tool) return;

  state.isActive = isActive;
  state.tool = isActive ? tool : null;
  setActionIcon(tabId, isActive);

  await ensureScriptInjected(tabId);
  chrome.tabs.sendMessage(tabId, { type: 'SET_INSPECTOR_STATE', isActive, tool });
  chrome.runtime.sendMessage({ type: 'INSPECTOR_STATUS_CHANGED', isActive });
}

// Extension icon click toggles the main selector tool
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    const state = getTabState(tab.id);
    // If it's off, turn it on with the selector. If it's on, turn it off.
    const newActiveState = !state.isActive;
    const tool = newActiveState ? 'selector' : null;
    setInspectorState(tab.id, newActiveState, tool);
  }
});

// Update icon when tab is changed
chrome.tabs.onActivated.addListener(activeInfo => {
    const state = getTabState(activeInfo.tabId);
    setActionIcon(activeInfo.tabId, state.isActive);
});

// Handle messages from UI and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const tabId = sender.tab?.id;

    switch (request.type) {
        case 'ACTIVATE_TOOL':
            if (tabId) {
                const isActive = request.tool !== null;
                setInspectorState(tabId, isActive, request.tool);
            }
            break;
        case 'ELEMENT_SELECTED':
            lastElementData = request.data;
            chrome.runtime.sendMessage({ type: 'UPDATE_ELEMENT_DATA', data: lastElementData });
            break;
        case 'GET_LAST_ELEMENT_DATA':
            sendResponse({ data: lastElementData });
            break;
        case 'GET_INSPECTOR_STATUS':
            if (tabId) {
                sendResponse(getTabState(tabId));
            }
            break;
        // Handlers for new features
        case 'GET_COLOR_PALETTE':
        case 'GET_FONT_LIST':
            if (tabId) {
                chrome.tabs.sendMessage(tabId, request, (response) => {
                    sendResponse(response);
                });
            }
            return true; // Indicates async response
    }
    return true; 
});