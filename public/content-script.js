// content-script.js

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
        highlightElement.style.outline = '2px dashed #0ea5e9'; // A nice blue color
    }
}

document.addEventListener('mouseover', (event) => {
    if (!inspectorEnabled) return;
    updateHighlight(event.target);
});

document.addEventListener('click', (event) => {
    if (!inspectorEnabled) return;

    event.preventDefault();
    event.stopPropagation();
    
    const info = getElementInfo(event.target);
    if (info) {
        // Send the element info to the background script
        chrome.runtime.sendMessage({ type: 'elementInfo', data: info });
    }
}, true);


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.toggleInspector) {
        inspectorEnabled = !inspectorEnabled;
        
        if (!inspectorEnabled && highlightElement) {
            highlightElement.style.outline = '';
            highlightElement = null;
        }
        // Let the popup know the state has changed
        sendResponse({ inspectorEnabled: inspectorEnabled });
    }
});