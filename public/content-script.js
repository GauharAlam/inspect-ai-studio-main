if (typeof window.aiCssInspectorInjected === 'undefined') {
  window.aiCssInspectorInjected = true;

  // --- State Variables ---
  let inspectorActive = false;
  let activeTool = null;
  let highlightEl = null;
  let tooltipEl = null;
  let panelIframe = null;
  let dragHandle = null; 
  let lastHoveredElement = null;
  let isEditingText = false;
  // FIX: Updated panel width from 340 to 380 to match the content width
  let panelState = { x: 0, y: 0, width: 380, height: '600px', isMinimized: false };

  const IFRAME_ID = 'ai-css-inspector-panel-iframe';
  const DRAG_HANDLE_ID = 'ai-css-inspector-drag-handle';
  const HEADER_HEIGHT = '57px';ADER_HEIGHT = '57px';

  // --- Element Creation ---
  function createInspectorElements() {
    if (!document.getElementById('ai-css-inspector-highlight')) {
        highlightEl = document.createElement('div');
        highlightEl.id = 'ai-css-inspector-highlight';
        Object.assign(highlightEl.style, {
            position: 'absolute', backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid #EF4444', outline: '1px solid rgba(255, 255, 255, 0.5)',
            pointerEvents: 'none', zIndex: '2147483645', display: 'none',
            boxSizing: 'border-box', transition: 'all 50ms linear'
        });
        document.body.appendChild(highlightEl);
    }
    if (!document.getElementById('ai-css-inspector-tooltip')) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'ai-css-inspector-tooltip';
        Object.assign(tooltipEl.style, {
            position: 'absolute', backgroundColor: 'rgba(17, 24, 39, 0.95)',
            color: '#E5E7EB', border: '1px solid #4B5563', borderRadius: '6px',
            padding: '10px', fontFamily: `ui-sans-serif, system-ui, sans-serif`,
            fontSize: '13px', pointerEvents: 'none', zIndex: '2147483646',
            display: 'none', lineHeight: '1.6', maxWidth: '350px',
            wordWrap: 'break-word', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        });
        document.body.appendChild(tooltipEl);
    }
  }
  
  function createPanel() {
      if (document.getElementById(IFRAME_ID)) return;
      
      panelIframe = document.createElement('iframe');
      panelIframe.id = IFRAME_ID;
      panelIframe.src = chrome.runtime.getURL('inspector.html');
      Object.assign(panelIframe.style, {
          position: 'fixed', top: '10px', right: '10px', 
          width: `${panelState.width}px`, 
          height: panelState.isMinimized ? HEADER_HEIGHT : panelState.height,
          maxHeight: '90vh',
          // ⭐️ Changes for Transparency ⭐️
          backgroundColor: 'transparent', 
          border: 'none', // Remove border for a cleaner look
          zIndex: '2147483647', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          overflow: 'hidden', 
          transition: 'height 0.2s ease-in-out'
      });
      document.body.appendChild(panelIframe);

      dragHandle = document.createElement('div');
      dragHandle.id = DRAG_HANDLE_ID;
      Object.assign(dragHandle.style, {
          position: 'fixed', top: panelIframe.style.top, right: panelIframe.style.right,
          width: `${panelState.width}px`, height: HEADER_HEIGHT,
          zIndex: '2147483648', cursor: 'move', userSelect: 'none'
      });
      document.body.appendChild(dragHandle);
      
      makeDraggable(dragHandle, panelIframe);
  }

  function removePanel() {
      [IFRAME_ID, DRAG_HANDLE_ID, 'ai-css-inspector-tooltip', 'ai-css-inspector-highlight'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.remove();
      });
      panelIframe = null; dragHandle = null; tooltipEl = null; highlightEl = null;
  }
  
  function makeDraggable(handle, target) {
    let offsetX = 0, offsetY = 0, isDragging = false;
    handle.onmousedown = (e) => {
        isDragging = true;
        const rect = target.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp, { once: true });
    };
    function onMouseMove(e) {
        if (!isDragging) return;
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;
        target.style.left = `${newX}px`;
        target.style.top = `${newY}px`;
        handle.style.left = `${newX}px`;
        handle.style.top = `${newY}px`;
        target.style.right = 'auto';
        target.style.bottom = 'auto';
        handle.style.right = 'auto';
        handle.style.bottom = 'auto';
    }
    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
    }
  }

  function minimizePanel() {
      panelState.isMinimized = true;
      if (panelIframe) panelIframe.style.height = HEADER_HEIGHT;
  }
  
  function restorePanel() {
      panelState.isMinimized = false;
      if (panelIframe) panelIframe.style.height = panelState.height;
  }

  
  const getReadableSelector = (element) => {
    if (!element) return '';
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id.split(' ')[0]}` : '';
    const classes = element.className && typeof element.className === 'string' 
      ? `.${element.className.trim().split(' ').filter(c => c && typeof c === 'string').join('.')}` 
      : '';
    return `${tagName}${id}${classes}`;
  };

  const isColor = (strColor) => {
    if (!strColor) return false;
    const s = new Option().style;
    s.color = strColor;
    return s.color !== '';
  };

  // --- ⭐️ UPDATED: Smart CSS Property Collector ⭐️ ---
  function getRelevantStyles(element) {
    const computedStyles = window.getComputedStyle(element);
    const stylesObject = {};

    // A curated list of properties that are most useful to developers.
    const WHITELISTED_PROPS = [
      'display', 'position', 'top', 'right', 'bottom', 'left', 'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
      'margin', 'padding', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'font', 'font-family', 'font-size', 'font-weight', 'line-height', 'text-align', 'color', 
      'background', 'background-color', 'background-image', 'background-position', 'background-repeat', 'background-size', 'background-clip',
      'border', 'border-radius', 'border-color', 'border-style', 'border-width',
      'flex', 'flex-basis', 'flex-direction', 'flex-flow', 'flex-grow', 'flex-shrink', 'flex-wrap',
      'align-content', 'align-items', 'align-self', 'justify-content', 'order',
      'grid', 'grid-template', 'grid-template-columns', 'grid-template-rows', 'grid-gap', 'gap',
      'box-shadow', 'text-shadow', 'opacity', 'visibility', 'overflow', 'z-index',
      'list-style', 'text-decoration', 'transition', 'transform', 'cursor', 'white-space'
    ];

    // A map of default values for certain properties to filter them out.
    const DEFAULT_VALUES = {
      'outline-style': 'none',
      'border-style': 'none',
      'background-repeat': 'repeat',
      'background-image': 'none',
      'text-decoration-line': 'none',
      'position': 'static',
    };

    WHITELISTED_PROPS.forEach(prop => {
        const value = computedStyles.getPropertyValue(prop);
        if (value && value !== DEFAULT_VALUES[prop]) {
             // Ignore values that are clearly defaults or unset
            if (value !== 'normal' && value !== 'auto' && value.trim() !== '0px' && value.trim() !== '0s' && value !== 'rgba(0, 0, 0, 0)') {
                 stylesObject[prop] = value;
            }
        }
    });

    return stylesObject;
  }

  // --- Event Handlers (Updated to use the new style collector) ---
  const handleMouseMove = (e) => {
    if (inspectorActive && activeTool === 'selector') {
        if (tooltipEl) tooltipEl.style.display = 'none';
        if (highlightEl) highlightEl.style.display = 'none';
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (tooltipEl) tooltipEl.style.display = 'block';
        if (highlightEl) highlightEl.style.display = 'block';

        if (!element || element.id.startsWith('ai-css-inspector-') || ['BODY', 'HTML'].includes(element.tagName) || panelIframe?.contains(element)) {
            if (highlightEl) highlightEl.style.display = 'none';
            if (tooltipEl) tooltipEl.style.display = 'none';
            lastHoveredElement = null;
            return;
        }

        lastHoveredElement = element;
        const rect = element.getBoundingClientRect();
        Object.assign(highlightEl.style, {
            width: `${rect.width}px`, height: `${rect.height}px`,
            top: `${rect.top + window.scrollY}px`, left: `${rect.left + window.scrollX}px`,
            display: 'block'
        });

        const relevantStyles = getRelevantStyles(element);
        const computedStyles = window.getComputedStyle(element);

        let stylesHTML = '';
        Object.entries(relevantStyles).forEach(([prop, value]) => {
            const colorSwatch = isColor(value) ? `<div style="width:12px; height:12px; border-radius:3px; background-color:${value}; display:inline-block; margin-right: 8px; border: 1px solid #4B5563;"></div>` : '';
            stylesHTML += `<div><span style="color: #6EE7B7;">${prop}</span>: ${colorSwatch}<span style="color: #F3F4F6;">${value}</span>;</div>`;
        });

        const selector = getReadableSelector(element);
        const font = computedStyles.getPropertyValue('font-family').split(',')[0] || 'N/A';
        const fontSize = computedStyles.getPropertyValue('font-size');
        const fontWeight = computedStyles.getPropertyValue('font-weight');

        tooltipEl.innerHTML = `
            <div style="color: #93C5FD; font-weight: bold; max-width: 330px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${selector}</div>
            <div style="color: #A5B4FC; font-size: 11px;">${Math.round(rect.width)}px × ${Math.round(rect.height)}px</div>
            <div style="color: #A5B4FC; font-size: 11px;">${font} ${fontSize} ${fontWeight}</div>
            <hr style="border-color: #374151; margin: 6px 0;">
            <div style="font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto;">${stylesHTML}</div>
        `;
        
        const tooltipRect = tooltipEl.getBoundingClientRect();
        let tooltipTop = rect.bottom + window.scrollY + 10;
        if (tooltipTop + tooltipRect.height > window.innerHeight + window.scrollY) {
            tooltipTop = rect.top + window.scrollY - tooltipRect.height - 10;
        }
        Object.assign(tooltipEl.style, {
            top: `${tooltipTop < window.scrollY ? window.scrollY + 10 : tooltipTop}px`,
            left: `${rect.left + window.scrollX}px`,
            display: 'block'
        });
    } else if (inspectorActive && (activeTool === 'delete-element' || activeTool === 'live-text-editor')) {
       if (highlightEl) highlightEl.style.display = 'none';
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (highlightEl) highlightEl.style.display = 'block';

        if (!element || element.id.startsWith('ai-css-inspector-') || ['BODY', 'HTML'].includes(element.tagName) || panelIframe?.contains(element)) {
            if (highlightEl) highlightEl.style.display = 'none';
            lastHoveredElement = null;
            return;
        }
        lastHoveredElement = element;
        const rect = element.getBoundingClientRect();
        Object.assign(highlightEl.style, {
            width: `${rect.width}px`, height: `${rect.height}px`,
            top: `${rect.top + window.scrollY}px`, left: `${rect.left + window.scrollX}px`,
            display: 'block'
        });
    } else {
        if (highlightEl) highlightEl.style.display = 'none';
        if (tooltipEl) tooltipEl.style.display = 'none';
    }
  };

  const handleClick = (e) => {
      if (!inspectorActive || !lastHoveredElement || isEditingText) return;
      e.preventDefault();
      e.stopPropagation();
      if (activeTool === 'selector') {
          handleElementSelection(lastHoveredElement);
      } else if (activeTool === 'delete-element') {
          lastHoveredElement.remove();
      } else if (activeTool === 'live-text-editor') {
          makeTextEditable(lastHoveredElement);
      }
  };

  function handleElementSelection(element) {
      const stylesObject = getRelevantStyles(element);
      const data = {
        tag: element.tagName.toLowerCase(), 
        id: element.id || null,
        classes: element.className && typeof element.className === 'string' ? element.className : null, 
        html: element.outerHTML,
        styles: stylesObject
      };
      chrome.runtime.sendMessage({ type: 'ELEMENT_SELECTED', data: data });
  }

  // --- The rest of the script is unchanged ---
  function makeTextEditable(element) { 
      if (isEditingText) return;
      isEditingText = true;
      element.setAttribute('contenteditable', 'true');
      element.focus();
      highlightEl.style.border = '2px dashed #10B981';

      const onBlur = () => {
          element.removeAttribute('contenteditable');
          element.removeEventListener('blur', onBlur);
          isEditingText = false;
          highlightEl.style.border = '2px solid #3B82F6';
      };
      element.addEventListener('blur', onBlur);
  }
  function getPageColors() {
    const colors = new Set();
    const props = ['color', 'backgroundColor', 'borderColor'];
    document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        props.forEach(prop => {
            const color = style.getPropertyValue(prop);
            if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
                colors.add(color);
            }
        });
    });
    return Array.from(colors);
  }
  function getPageFonts() {
    const fonts = new Set();
    document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        const font = style.getPropertyValue('font-family');
        if (font) {
            font.split(',').forEach(f => fonts.add(f.trim().replace(/['"]/g, '')));
        }
    });
    return Array.from(fonts);
  }
  
  const activateInspector = (tool) => {
    inspectorActive = true;
    activeTool = tool;
    createInspectorElements();
    createPanel();
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
  };

  const deactivateInspector = () => {
    inspectorActive = false;
    activeTool = null;
    removePanel();
    document.removeEventListener('mousemove', handleMouseMove, true);
    document.removeEventListener('click', handleClick, true);
  };
  
  // --- Updated Message Listener ---
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'SET_INSPECTOR_STATE':
            if (request.isActive) {
                activateInspector(request.tool);
            } else {
                deactivateInspector();
            }
            break;
        case 'MINIMIZE_PANEL':
            minimizePanel();
            break;
        case 'RESTORE_PANEL':
            restorePanel();
            break;
        // ... other cases remain the same
        case 'GET_COLOR_PALETTE':
            sendResponse({ type: 'COLOR_PALETTE', data: getPageColors() });
            break;
        case 'GET_FONT_LIST':
            sendResponse({ type: 'FONT_LIST', data: getPageFonts() });
            break;
    }
    return true;
  });
}