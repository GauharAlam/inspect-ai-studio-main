// public/content-script.js

let inspectorIsActive = false;
let highlightEl = null;

function initializeHighlightElement() {
  if (document.getElementById('ai-css-inspector-highlight')) {
    highlightEl = document.getElementById('ai-css-inspector-highlight');
  } else {
    highlightEl = document.createElement('div');
    highlightEl.id = 'ai-css-inspector-highlight';
    document.body.appendChild(highlightEl);
  }
  
  Object.assign(highlightEl.style, {
    position: 'absolute',
    backgroundColor: 'rgba(100, 180, 255, 0.3)',
    border: '1px solid #64B4FF',
    borderRadius: '3px',
    pointerEvents: 'none',
    zIndex: '99999999',
    transition: 'all 50ms linear',
    display: 'none'
  });
}

function handleMouseMove(e) {
  if (!inspectorIsActive) return;

  highlightEl.style.display = 'none';
  const element = document.elementFromPoint(e.clientX, e.clientY);
  highlightEl.style.display = 'block';

  if (!element || element.id === 'ai-css-inspector-highlight' || element.tagName === 'BODY' || element.tagName === 'HTML') {
    return;
  }
  
  const rect = element.getBoundingClientRect();
  Object.assign(highlightEl.style, {
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    top: `${rect.top + window.scrollY}px`,
    left: `${rect.left + window.scrollX}px`
  });
}

function handleClick(e) {
  if (!inspectorIsActive) return;
  
  e.preventDefault();
  e.stopPropagation();

  const element = e.target;
  const computedStyles = window.getComputedStyle(element);
  const stylesObject = {};
  
  const relevantProperties = [
    'color', 'background-color', 'font-family', 'font-size', 'font-weight',
    'line-height', 'text-align', 'width', 'height', 'padding', 'margin', 'border',
    'border-radius', 'display', 'position', 'top', 'left', 'right', 'bottom',
    'flex-direction', 'justify-content', 'align-items', 'gap', 'grid-template-columns'
  ];

  for (const prop of relevantProperties) {
    const value = computedStyles.getPropertyValue(prop);
    if (value) {
      stylesObject[prop] = value;
    }
  }
  
  const data = {
    tag: element.tagName.toLowerCase(),
    id: element.id || null,
    classes: element.className || null,
    html: element.outerHTML,
    styles: stylesObject
  };
  
  chrome.runtime.sendMessage({ type: 'ELEMENT_SELECTED', data: data });
}

function activateInspector() {
  if (inspectorIsActive) return;
  inspectorIsActive = true;
  if (!highlightEl) initializeHighlightElement();
  highlightEl.style.display = 'block';
  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('click', handleClick, true);
}

function deactivateInspector() {
  if (!inspectorIsActive) return;
  inspectorIsActive = false;
  if (highlightEl) {
    highlightEl.style.display = 'none';
  }
  document.removeEventListener('mousemove', handleMouseMove, true);
  document.removeEventListener('click', handleClick, true);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SET_INSPECTOR_ACTIVE') {
    request.isActive ? activateInspector() : deactivateInspector();
    sendResponse({ success: true });
  }
});

if (document.readyState === "complete" || document.readyState === "interactive") {
    initializeHighlightElement();
} else {
    document.addEventListener('DOMContentLoaded', initializeHighlightElement);
}