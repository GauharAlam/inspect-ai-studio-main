// public/content-script.js

// Yeh check zaroori hai taki script ek page par ek se zyada baar na chale
if (typeof window.aiCssInspectorInjected === 'undefined') {
  window.aiCssInspectorInjected = true;

  let inspectorIsActive = false;
  let highlightEl = null;
  let tooltipEl = null;
  let panelIframe = null;
  let lastHoveredElement = null;
  const IFRAME_ID = 'ai-css-inspector-panel-iframe';

  function createInspectorElements() {
    // Highlight Box
    if (!document.getElementById('ai-css-inspector-highlight')) {
        highlightEl = document.createElement('div');
        highlightEl.id = 'ai-css-inspector-highlight';
        Object.assign(highlightEl.style, {
            position: 'absolute',
            backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red tint
            border: '1px solid #EF4444', // Red border
            borderRadius: '3px',
            pointerEvents: 'none',
            zIndex: '2147483645',
            display: 'none',
            boxSizing: 'border-box',
            transition: 'all 50ms linear'
        });
        document.body.appendChild(highlightEl);
    } else {
        highlightEl = document.getElementById('ai-css-inspector-highlight');
    }

    // Tooltip for CSS details
    if (!document.getElementById('ai-css-inspector-tooltip')) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'ai-css-inspector-tooltip';
        Object.assign(tooltipEl.style, {
            position: 'absolute',
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            color: '#E5E7EB',
            border: '1px solid #4B5563',
            borderRadius: '6px',
            padding: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: '2147483646',
            display: 'none',
            lineHeight: '1.6',
            maxWidth: '350px',
            wordWrap: 'break-word'
        });
        document.body.appendChild(tooltipEl);
    } else {
        tooltipEl = document.getElementById('ai-css-inspector-tooltip');
    }
  }
  
  // Side panel (iframe) ko banane ke liye function
  function createPanel() {
      if (document.getElementById(IFRAME_ID)) return;

      panelIframe = document.createElement('iframe');
      panelIframe.id = IFRAME_ID;
      panelIframe.src = chrome.runtime.getURL('inspector.html');
      
      Object.assign(panelIframe.style, {
          position: 'fixed',
          top: '0',
          right: '0',
          width: '380px',
          height: '100%',
          border: 'none',
          zIndex: '2147483647',
          boxShadow: '-5px 0px 15px rgba(0,0,0,0.2)'
      });
      document.body.appendChild(panelIframe);
  }

  // Side panel ko hatane ke liye function
  function removePanel() {
      const iframe = document.getElementById(IFRAME_ID);
      if (iframe) {
          iframe.remove();
          panelIframe = null;
      }
  }
  
  const getReadableSelector = (element) => {
    if (!element) return '';
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id.split(' ')[0]}` : '';
    const classes = element.className && typeof element.className === 'string' 
      ? `.${element.className.trim().split(' ').filter(c => c).join('.')}` 
      : '';
    return `${tagName}${id}${classes}`;
  };

  const handleMouseMove = (e) => {
    if (!inspectorIsActive) return;

    highlightEl.style.display = 'none';
    tooltipEl.style.display = 'none';
    const element = document.elementFromPoint(e.clientX, e.clientY);
    highlightEl.style.display = 'block';
    tooltipEl.style.display = 'block';
    
    if (!element || element.id.startsWith('ai-css-inspector-') || ['BODY', 'HTML'].includes(element.tagName) || panelIframe?.contains(element)) {
        highlightEl.style.display = 'none';
        tooltipEl.style.display = 'none';
        lastHoveredElement = null;
        return;
    }
    
    lastHoveredElement = element;

    const rect = element.getBoundingClientRect();
    Object.assign(highlightEl.style, {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        display: 'block'
    });

    const computedStyles = window.getComputedStyle(element);
    const relevantProperties = ['color', 'background-color', 'font-family', 'font-size', 'font-weight', 'line-height', 'margin', 'padding', 'text-align'];
    
    let tooltipHTML = `<div style="color: #93C5FD; font-weight: bold; max-width: 330px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${getReadableSelector(element)}</div>`;
    tooltipHTML += `<div style="color: #A5B4FC;">${Math.round(rect.width)}px × ${Math.round(rect.height)}px</div><hr style="border-color: #4B5563; margin: 4px 0;">`;

    relevantProperties.forEach(prop => {
        const value = computedStyles.getPropertyValue(prop);
        if (value && value !== 'none' && value.trim() !== '' && value.trim() !== '0px') {
            tooltipHTML += `<div><span style="color: #6EE7B7;">${prop}</span>: <span style="color: #F3F4F6;">${value}</span>;</div>`;
        }
    });

    tooltipEl.innerHTML = tooltipHTML;
    
    const tooltipRect = tooltipEl.getBoundingClientRect();
    let tooltipTop = rect.bottom + window.scrollY + 10;
    if (tooltipTop + tooltipRect.height > window.innerHeight + window.scrollY) {
        tooltipTop = rect.top + window.scrollY - tooltipRect.height - 10;
    }
    Object.assign(tooltipEl.style, {
        top: `${tooltipTop}px`,
        left: `${rect.left + window.scrollX}px`,
        display: 'block'
    });
  };
  
  const handleClick = (e) => {
      if (!inspectorIsActive || !lastHoveredElement) return;
      e.preventDefault();
      e.stopPropagation();

      const element = lastHoveredElement;
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
  };

  const activateInspector = () => {
    if (inspectorIsActive) return;
    inspectorIsActive = true;
    createInspectorElements();
    createPanel();
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
  };

  const deactivateInspector = () => {
    inspectorIsActive = false;
    if (highlightEl) highlightEl.style.display = 'none';
    if (tooltipEl) tooltipEl.style.display = 'none';
    removePanel();
    document.removeEventListener('mousemove', handleMouseMove, true);
    document.removeEventListener('click', handleClick, true);
  };
  
  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'SET_INSPECTOR_ACTIVE') {
      request.isActive ? activateInspector() : deactivateInspector();
    }
  });
}