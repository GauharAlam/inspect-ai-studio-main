// background.js

// A simple in-memory store for the active tab and its data
let activeTabId = null;
let inspectedElementData = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('AI CSS Inspector installed.');
});

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Message from content script with element data
  if (request.type === 'elementInfo') {
    inspectedElementData = request.data;
    // Optional: Forward to popup if it's open
    chrome.runtime.sendMessage({ type: 'update', data: inspectedElementData });
  }

  // Message from popup asking for the latest data
  if (request.type === 'getElementData') {
    sendResponse(inspectedElementData);
  }

  // Message from popup to toggle the inspector on the active tab
  if (request.type === 'toggleInspector') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        activeTabId = tabs[0].id;
        chrome.tabs.sendMessage(activeTabId, { toggleInspector: true });
        // Clear old data when toggling
        inspectedElementData = null;
        sendResponse({ success: true, tabId: activeTabId });
      } else {
        sendResponse({ success: false, error: "No active tab found." });
      }
    });
    // Return true to indicate you wish to send a response asynchronously
    return true;
  }
});

// Clean up when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    activeTabId = null;
    inspectedElementData = null;
  }
});