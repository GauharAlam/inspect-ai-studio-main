// public/background.js

// This object will store the active state for each tab
const tabStates = {};

// When the user clicks the extension icon
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  // Toggle the state for the current tab
  const currentState = tabStates[tab.id] || false;
  const newState = !currentState;
  tabStates[tab.id] = newState;

  // Change the icon based on the state
  const iconPath = newState ? "/icons/icon-active.png" : "/icons/icon-default.png";
  chrome.action.setIcon({ path: iconPath, tabId: tab.id });

  // Send a message to the content script to turn the inspector on or off
  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: 'TOGGLE_INSPECTOR',
      isActive: newState,
    });
  } catch (e) {
    console.error("Could not send message to the content script. It might not be injected on this page.", e);
  }
});

// Clean up when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabStates[tabId];
});

// Reset state when a page is reloaded
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading') {
        delete tabStates[tabId];
        chrome.action.setIcon({ path: "/icons/icon-default.png", tabId: tabId });
    }
});