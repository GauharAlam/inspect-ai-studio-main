let inspectorEnabled = false;
let highlightElement = null;

function getElementInfo(element) {
    const styles = window.getComputedStyle(element);
    return {
        tag: element.tagName.toLowerCase(),
        id: element.id,
        classes: Array.from(element.classList),
        styles: {
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            // Add other styles you want to inspect
        }
    };
}

document.addEventListener('mouseover', (event) => {
    if (!inspectorEnabled) return;
    if (highlightElement) {
        highlightElement.style.outline = '';
    }
    highlightElement = event.target;
    highlightElement.style.outline = '2px dashed #f00';
});

document.addEventListener('click', (event) => {
    if (!inspectorEnabled) return;
    event.preventDefault();
    event.stopPropagation();
    const info = getElementInfo(event.target);
    console.log(info); // For now, we just log the info
    // In a real implementation, you would send this to the popup or a sidebar
}, true);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.toggleInspector) {
        inspectorEnabled = !inspectorEnabled;
        if (!inspectorEnabled && highlightElement) {
            highlightElement.style.outline = '';
            highlightElement = null;
        }
    }
});