// src/components/inspector/CssInspectorView.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Power, Trash2, Save, Upload, FileCode } from 'lucide-react';
import type { ElementData } from '@/Inspector';
import { useToast } from '@/hooks/use-toast';
import CodeBlock from './CodeBlock'; // Import the new component

interface CssInspectorViewProps {
  elementData: ElementData | null;
  setElementData: (data: ElementData | null) => void;
}

const formatCssForPanel = (styles: Record<string, string>): string => {
  if (!styles) return '';
  const priorityProps = [
    'display', 'position', 'top', 'right', 'bottom', 'left', 'width', 'height', 
    'font-family', 'font-size', 'font-weight', 'line-height', 'color', 
    'background-color', 'padding', 'margin', 'border', 'border-radius',
    'flex', 'flex-direction', 'align-items', 'justify-content', 'gap'
  ];
  
  let formatted = '';
  const styleEntries = Object.entries(styles);

  priorityProps.forEach(key => {
    if (styles[key] && styles[key] !== 'none' && styles[key].trim() !== '0px') {
      formatted += `  ${key}: ${styles[key]};\n`;
    }
  });

  styleEntries.forEach(([key, value]) => {
    if (value && !priorityProps.includes(key) && value !== 'none' && value.trim() !== '0px') {
      formatted += `  ${key}: ${value};\n`;
    }
  });

  return formatted.trim();
};

const CssInspectorView: React.FC<CssInspectorViewProps> = ({ elementData, setElementData }) => {
  const { toast } = useToast();
  const [cssText, setCssText] = useState('');

  useEffect(() => {
    if (elementData?.styles) {
      const selector = `${elementData.tag}${elementData.id ? `#${elementData.id}` : ''}${elementData.classes ? `.${elementData.classes.trim().replace(/\s+/g, '.')}` : ''}`;
      const formattedStyles = formatCssForPanel(elementData.styles as any);
      setCssText(`${selector} {\n${formattedStyles}\n}`);
    } else {
      setCssText('');
    }
  }, [elementData]);

  const handleCopyCss = () => {
    if (cssText) {
      navigator.clipboard.writeText(cssText);
      toast({ title: "CSS Copied!" });
    }
  };

  const handleClear = () => {
    setElementData(null);
    toast({ title: "Selection Cleared" });
  };
  
  const handleExport = () => {
    if (!cssText) return;
    const blob = new Blob([cssText], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'styles.css';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as styles.css" });
  };

  const showComingSoon = (feature: string) => {
    toast({ title: `${feature} is coming soon!` });
  };

  return (
    <div className="p-4 flex flex-col h-full bg-card/30">
        <h2 className="text-md font-semibold mb-4">CSS Inspector</h2>
        <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-border">
             <Button variant="outline" size="sm" onClick={handleClear} disabled={!elementData}><Trash2 className="w-4 h-4 mr-1"/>Clear</Button>
             <Button variant="outline" size="sm" onClick={() => showComingSoon('Save')} disabled={!cssText}><Save className="w-4 h-4 mr-1"/>Save</Button>
             <Button variant="destructive" size="sm" onClick={() => chrome.runtime.sendMessage({ type: 'ACTIVATE_TOOL', tool: null })}>
                <Power className="w-4 h-4 mr-1"/>Disable
             </Button>
             <Button variant="outline" size="sm" onClick={() => showComingSoon('Format')} disabled={!cssText}><FileCode className="w-4 h-4 mr-1"/>Format</Button>
             <Button variant="outline" size="sm" onClick={handleCopyCss} disabled={!cssText}><Copy className="w-4 h-4 mr-1"/>Copy</Button>
             <Button variant="outline" size="sm" onClick={handleExport} disabled={!cssText}><Upload className="w-4 h-4 mr-1"/>Export</Button>
        </div>
      
      <div className="flex-grow flex flex-col">
        {elementData ? (
            <CodeBlock code={cssText} />
        ) : (
            <div className="flex items-center justify-center h-full text-center text-sm text-muted-foreground bg-background rounded-md border">
                <p>Hover and click an element on the page.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CssInspectorView;