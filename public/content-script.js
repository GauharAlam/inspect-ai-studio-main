// public/content-script.js

let inspectorIsActive = false;
let highlightEl = document.createElement('div');
let overlayEl = document.createElement('div');
let currentTarget = null;

function initialize() {
  // Create the highlight element
  highlightEl.style.position = 'absolute';
  highlightEl.style.backgroundColor = 'rgba(0, 123, 255, 0.2)';
  highlightEl.style.border = '2px solid #007bff';
  highlightEl.style.pointerEvents = 'none';
  highlightEl.style.zIndex = '99999998';
  highlightEl.style.transition = 'all 50ms ease';
  document.body.appendChild(highlightEl);

  // Create the overlay element for CSS properties
  overlayEl.style.position = 'absolute';
  overlayEl.style.backgroundColor = 'rgba(30, 30, 30, 0.9)';
  overlayEl.style.color = '#ffffff';
  overlayEl.style.border = '1px solid #555';
  overlayEl.style.borderRadius = '8px';
  overlayEl.style.padding = '8px';
  overlayEl.style.fontFamily = 'monospace';
  overlayEl.style.fontSize = '12px';
  overlayEl.style.pointerEvents = 'none';
  overlayEl.style.zIndex = '99999999';
  overlayEl.style.transition = 'all 50ms ease';
  overlayEl.style.backdropFilter = 'blur(5px)';
  document.body.appendChild(overlayEl);
  
  // Hide them initially
  highlightEl.style.display = 'none';
  overlayEl.style.display = 'none';
}

function handleMouseMove(e) {
  if (!inspectorIsActive) return;
  
  const element = document.elementFromPoint(e.clientX, e.clientY);

  if (!element || element === highlightEl || element === overlayEl || element === currentTarget) {
    return;
  }
  
  currentTarget = element;

  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);

  highlightEl.style.width = `${rect.width}px`;
  highlightEl.style.height = `${rect.height}px`;
  highlightEl.style.top = `${rect.top + window.scrollY}px`;
  highlightEl.style.left = `${rect.left + window.scrollX}px`;

  const cssText = `
    <div style="color: #88aaff;">${element.tagName.toLowerCase()}</div>
    ${element.id ? `<div style="color: #ffcc99;">#${element.id}</div>` : ''}
    ${element.className ? `<div style="color: #99ddff;">.${element.className.split(' ').join('.')}</div>` : ''}
    <hr style="border-color: #555; margin: 4px 0;" />
    <div><strong>W:</strong> ${Math.round(rect.width)}px <strong>H:</strong> ${Math.round(rect.height)}px</div>
    <div><strong>Color:</strong> ${styles.color}</div>
    <div><strong>Font:</strong> ${styles.fontSize} ${styles.fontFamily.split(',')[0]}</div>
    <div><strong>Padding:</strong> ${styles.padding}</div>
    <div><strong>Margin:</strong> ${styles.margin}</div>
  `;
  overlayEl.innerHTML = cssText;

  let overlayTop = rect.top + window.scrollY - 10;
  let overlayLeft = rect.left + window.scrollX;
  
  if (overlayTop < window.scrollY) {
      overlayTop = rect.bottom + window.scrollY + 10;
  }
  
  overlayEl.style.top = `${overlayTop}px`;
  overlayEl.style.left = `${overlayLeft}px`;
  overlayEl.style.transform = 'translateY(-100%)';
}

function activateInspector() {
  inspectorIsActive = true;
  highlightEl.style.display = 'block';
  overlayEl.style.display = 'block';
  document.addEventListener('mousemove', handleMouseMove);
}

function deactivateInspector() {
  inspectorIsActive = false;
  highlightEl.style.display = 'none';
  overlayEl.style.display = 'none';
  document.removeEventListener('mousemove', handleMouseMove);
  currentTarget = null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if the message type is 'TOGGLE_INSPECTOR' before accessing its properties
  if (request.type === 'TOGGLE_INSPECTOR') {
    if (request.isActive) {
      activateInspector();
    } else {
      deactivateInspector();
    }
  }
});

initialize();