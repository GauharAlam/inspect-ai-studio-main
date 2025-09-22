// public/background.js

// Har tab ke lie inspector ki state yahan store hogi
const tabState = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Popup se aane wale message ke lie sender.tab undefined hoga.
    // Content script se aane wale message ke lie sender.tab me jaankari hogi.
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
    
    return true; // Asynchronous response ke lie
});

function handleMessage(request, tabId, sendResponse) {
    switch (request.type) {
        // Message from POPUP to toggle the inspector
        case 'TOGGLE_INSPECTOR':
            const newState = !tabState[tabId];
            tabState[tabId] = newState;
            
            // Update icon
            const iconPath = newState ? 'icons/icon-active.png' : 'icons/icon-default.png';
            chrome.action.setIcon({ path: iconPath, tabId: tabId });

            // Send command to content script
            chrome.tabs.sendMessage(tabId, { type: 'SET_INSPECTOR_ACTIVE', isActive: newState });
            
            // Respond to popup
            sendResponse({ isActive: newState });
            break;

        // Message from POPUP to get current status
        case 'GET_INSPECTOR_STATUS':
            sendResponse({ isActive: !!tabState[tabId] });
            break;
        
        // Message from CONTENT SCRIPT with selected element data
        case 'ELEMENT_SELECTED':
            // Turn off inspector after selection
            tabState[tabId] = false;
            chrome.action.setIcon({ path: 'icons/icon-default.png', tabId: tabId });

            // Forward data to popup
            chrome.runtime.sendMessage({ type: 'UPDATE_ELEMENT_DATA', data: request.data });
            break;
    }
}

// Cleanup on tab removal or update
chrome.tabs.onRemoved.addListener((tabId) => delete tabState[tabId]);
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading') {
        delete tabState[tabId];
    }
});