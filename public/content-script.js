// public/content-script.js

let inspectorIsActive = false;
let highlightEl; // Initialize ko function me le jayein

function initialize() {
  if (document.getElementById('ai-css-inspector-highlight')) return; // Agar pahle se hai to dubara na banayein

  highlightEl = document.createElement('div');
  highlightEl.id = 'ai-css-inspector-highlight';
  highlightEl.style.position = 'absolute';
  highlightEl.style.backgroundColor = 'rgba(0, 123, 255, 0.2)';
  highlightEl.style.border = '2px solid #007bff';
  highlightEl.style.pointerEvents = 'none';
  highlightEl.style.zIndex = '99999998';
  highlightEl.style.transition = 'all 50ms ease';
  document.body.appendChild(highlightEl);
  highlightEl.style.display = 'none';
}

function handleMouseMove(e) {
  if (!inspectorIsActive) return;
  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (!element || element.id === 'ai-css-inspector-highlight') return;
  
  const rect = element.getBoundingClientRect();
  highlightEl.style.width = `${rect.width}px`;
  highlightEl.style.height = `${rect.height}px`;
  highlightEl.style.top = `${rect.top + window.scrollY}px`;
  highlightEl.style.left = `${rect.left + window.scrollX}px`;
}

function handleClick(e) {
    if (!inspectorIsActive) return;
    
    e.preventDefault();
    e.stopPropagation();

    const element = e.target;
    const styles = window.getComputedStyle(element);
    const stylesObject = {};
    for (const prop of styles) {
        stylesObject[prop] = styles.getPropertyValue(prop);
    }
    
    const data = {
        tag: element.tagName.toLowerCase(),
        id: element.id || null,
        classes: element.className || null,
        html: element.outerHTML,
        styles: stylesObject
    };
    
    // Deactivate inspector first
    deactivateInspector();

    // Send data to background script
    chrome.runtime.sendMessage({ type: 'update', data: data });
}

function activateInspector() {
  if (inspectorIsActive) return;
  inspectorIsActive = true;
  highlightEl.style.display = 'block';
  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('click', handleClick, true);
}

function deactivateInspector() {
  if (!inspectorIsActive) return;
  inspectorIsActive = false;
  highlightEl.style.display = 'none';
  document.removeEventListener('mousemove', handleMouseMove, true);
  document.removeEventListener('click', handleClick, true);
  
  // Inform background that inspector is now off
  chrome.runtime.sendMessage({ type: 'inspectorToggled', data: { isEnabled: false } });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOGGLE_INSPECTOR') {
    if (request.isActive) {
      activateInspector();
    } else {
      deactivateInspector();
    }
  }
});

// Run initialize when the script is injected
initialize();