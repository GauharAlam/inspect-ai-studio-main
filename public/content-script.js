// public/content-script.js
if (!window.aiCssInspectorInjected) {
  window.aiCssInspectorInjected = true;

  let inspectorIsActive = false;
  let currentMode = 'selector';
  let highlightEl, tooltipEl;
  let lastHoveredElement = null;

  function createInspectorElements() {
    // Highlight Box
    if (document.getElementById('ai-css-inspector-highlight')) {
        highlightEl = document.getElementById('ai-css-inspector-highlight');
    } else {
        highlightEl = document.createElement('div');
        highlightEl.id = 'ai-css-inspector-highlight';
        document.body.appendChild(highlightEl);
        Object.assign(highlightEl.style, {
            position: 'absolute', backgroundColor: 'rgba(100, 180, 255, 0.3)', border: '1px solid #64B4FF',
            borderRadius: '3px', pointerEvents: 'none', zIndex: '99999998', transition: 'all 50ms linear', display: 'none'
        });
    }

    // Tooltip for CSS details
    if (document.getElementById('ai-css-inspector-tooltip')) {
        tooltipEl = document.getElementById('ai-css-inspector-tooltip');
    } else {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'ai-css-inspector-tooltip';
        document.body.appendChild(tooltipEl);
        Object.assign(tooltipEl.style, {
            position: 'absolute', backgroundColor: 'rgba(17, 24, 39, 0.9)', color: '#E5E7EB',
            border: '1px solid #4B5563', borderRadius: '6px', padding: '8px', fontFamily: 'monospace',
            fontSize: '12px', pointerEvents: 'none', zIndex: '99999999', display: 'none',
            backdropFilter: 'blur(4px)', webkitBackdropFilter: 'blur(4px)', lineHeight: '1.6', maxWidth: '350px',
            wordWrap: 'break-word'
        });
    }
  }
  
  const getReadableSelector = (element) => {
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className && typeof element.className === 'string' ? `.${element.className.trim().replace(/\s+/g, '.')}` : '';
    return `${tagName}${id}${classes}`;
  }

  const handleMouseMove = (e) => {
    if (!inspectorIsActive) return;
    
    // Hide our elements to find what's underneath
    highlightEl.style.display = 'none';
    if (tooltipEl) tooltipEl.style.display = 'none';
    const element = document.elementFromPoint(e.clientX, e.clientY);
    highlightEl.style.display = 'block';
    if (tooltipEl) tooltipEl.style.display = 'block';

    if (!element || element.id.startsWith('ai-css-inspector-') || ['BODY', 'HTML'].includes(element.tagName)) {
      highlightEl.style.display = 'none';
      if (tooltipEl) tooltipEl.style.display = 'none';
      return;
    }
    
    lastHoveredElement = element;
    
    const rect = element.getBoundingClientRect();
    Object.assign(highlightEl.style, {
      width: `${rect.width}px`, height: `${rect.height}px`,
      top: `${rect.top + window.scrollY}px`, left: `${rect.left + window.scrollX}px`,
      borderColor: currentMode === 'delete-element' ? '#EF4444' : '#64B4FF',
      backgroundColor: currentMode === 'delete-element' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(100, 180, 255, 0.3)',
      display: 'block'
    });

    // **FIX**: This is the logic that was missing. It now builds and shows the tooltip.
    if (tooltipEl && currentMode === 'selector') {
        const computedStyles = window.getComputedStyle(element);
        const relevantProperties = [
            'display', 'font-size', 'font-family', 'font-weight', 'line-height', 'color', 
            'background-color', 'margin', 'padding', 'border-radius'
        ];
        
        let tooltipHTML = `<div style="color: #93C5FD; font-weight: bold;">${getReadableSelector(element)}</div>`;
        tooltipHTML += `<div style="color: #A5B4FC;">${Math.round(rect.width)}px × ${Math.round(rect.height)}px</div><hr style="border-color: #4B5563; margin: 4px 0;">`;

        relevantProperties.forEach(prop => {
            const value = computedStyles.getPropertyValue(prop);
            if (value && value !== 'none') {
                tooltipHTML += `<div><span style="color: #6EE7B7;">${prop}</span>: <span style="color: #F3F4F6;">${value}</span>;</div>`;
            }
        });

        tooltipEl.innerHTML = tooltipHTML;

        let tooltipTop = rect.bottom + window.scrollY + 8;
        if (tooltipTop + tooltipEl.offsetHeight > window.innerHeight + window.scrollY) {
            tooltipTop = rect.top + window.scrollY - tooltipEl.offsetHeight - 8;
        }
        Object.assign(tooltipEl.style, { top: `${tooltipTop}px`, left: `${rect.left + window.scrollX}px`, display: 'block' });
    } else if (tooltipEl) {
      tooltipEl.style.display = 'none';
    }
  };

  const handleClick = (e) => {
    if (!inspectorIsActive || !lastHoveredElement) return;
    e.preventDefault();
    e.stopPropagation();

    const element = lastHoveredElement;

    switch (currentMode) {
      case 'selector':
        const computedStyles = window.getComputedStyle(element);
        const stylesObject = {};
        for (let i = 0; i < computedStyles.length; i++) {
            const prop = computedStyles[i];
            stylesObject[prop] = computedStyles.getPropertyValue(prop);
        }
        const data = {
          tag: element.tagName.toLowerCase(), id: element.id || null, classes: element.className || null,
          html: element.outerHTML, styles: stylesObject
        };
        chrome.runtime.sendMessage({ type: 'ELEMENT_SELECTED', data });
        break;
      case 'live-text-editor':
        element.contentEditable = "true";
        element.focus();
        element.style.outline = "2px dashed #34D399";
        element.addEventListener('blur', () => {
          element.contentEditable = "false";
          element.style.outline = "none";
        }, { once: true });
        break;
      case 'delete-element':
        element.remove();
        break;
    }

    if (['live-text-editor', 'delete-element'].includes(currentMode)) {
      deactivateInspector();
      chrome.runtime.sendMessage({ type: 'OPERATION_COMPLETE' });
    }
  };

  const activateInspector = (mode) => {
    inspectorIsActive = true;
    currentMode = mode;
    createInspectorElements();
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
  };

  const deactivateInspector = () => {
    inspectorIsActive = false;
    if (highlightEl) highlightEl.style.display = 'none';
    if (tooltipEl) tooltipEl.style.display = 'none';
    document.removeEventListener('mousemove', handleMouseMove, true);
    document.removeEventListener('click', handleClick, true);
  };
  
  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'SET_INSPECTOR_ACTIVE') {
      request.isActive ? activateInspector(request.mode) : deactivateInspector();
    }
    // Baaki color aur font wale functions ko yahan rehne dein
  });

  createInspectorElements();
}