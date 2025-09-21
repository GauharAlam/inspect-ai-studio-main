// public/content-script.js

let inspectorEnabled = false;
let highlightElement = null;

function getElementInfo(element) {
    if (!element) return null;
    const styles = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
        tag: element.tagName.toLowerCase(),
        id: element.id || 'N/A',
        classes: Array.from(element.classList).join(', ') || 'N/A',
        styles: {
            width: `${Math.round(rect.width)}px`,
            height: `${Math.round(rect.height)}px`,
            margin: styles.margin,
            padding: styles.padding,
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            color: styles.color,
            backgroundColor: styles.backgroundColor,
        }
    };
}

function updateHighlight(element) {
    if (highlightElement) {
        highlightElement.style.outline = '';
    }
    highlightElement = element;
    if (highlightElement) {
        highlightElement.style.outline = '2px dashed #0ea5e9';
    }
}

function handleMouseOver(event) {
    if (!inspectorEnabled) return;
    updateHighlight(event.target);
}

function handleClick(event) {
    if (!inspectorEnabled) return;

    event.preventDefault();
    event.stopPropagation();
    
    const info = getElementInfo(event.target);
    if (info) {
        chrome.runtime.sendMessage({ type: 'elementInfo', data: info });
    }
    
    // Deactivate after selection
    inspectorEnabled = false;
    updateHighlight(null); // Clear highlight
    chrome.runtime.sendMessage({ type: 'inspectorToggledOff' });

    // Remove the click listener so it only fires once per activation
    document.removeEventListener('click', handleClick, true);
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.toggleInspector) {
        inspectorEnabled = !inspectorEnabled;
        
        if (inspectorEnabled) {
            // Add the click listener ONLY when activated
            document.addEventListener('click', handleClick, true);
        } else {
            // Clean up when deactivated
            if (highlightElement) {
                highlightElement.style.outline = '';
            }
            highlightElement = null;
            document.removeEventListener('click', handleClick, true);
        }
        
        sendResponse({ inspectorEnabled: inspectorEnabled });
    }
    return true; // Keep the message channel open for async response
});

// The mouseover listener can be active all the time
document.addEventListener('mouseover', handleMouseOver, true);