// src/components/inspector/SelectorView.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Power, Trash2, Save, Upload, Sparkles } from 'lucide-react';
import type { ElementData } from '@/Inspector';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface SelectorViewProps {
  elementData: ElementData | null;
  inspectorActive: boolean;
  onToggleInspector: () => void;
  // Yeh line zaroori hai taaki component naye prop ko accept kare
  setElementData: (data: ElementData | null) => void;
}

const formatCss = (styles: Record<string, string>): string => {
  const relevantProperties = [
    'color', 'background-color', 'font-family', 'font-size', 'font-weight',
    'line-height', 'text-align', 'width', 'height', 'padding', 'margin', 'border',
    'border-radius', 'display', 'flex-direction', 'justify-content', 'align-items', 'gap'
  ];
  return relevantProperties
    .map(key => {
        const value = styles[key];
        return value ? `  ${key}: ${value};` : null;
    })
    .filter(Boolean)
    .join('\n');
};

const SelectorView: React.FC<SelectorViewProps> = ({ elementData, inspectorActive, onToggleInspector, setElementData }) => {
  const { toast } = useToast();
  const [cssText, setCssText] = useState('');

  useEffect(() => {
    if (elementData?.styles) {
      const selector = `${elementData.tag}${elementData.id ? `#${elementData.id}` : ''}${elementData.classes ? `.${elementData.classes.trim().replace(/\s+/g, '.')}` : ''}`;
      const formattedStyles = formatCss(elementData.styles as any);
      setCssText(`${selector} {\n${formattedStyles}\n}`);
    } else {
      setCssText('');
    }
  }, [elementData]);

  const handleCopyCss = () => {
    if (cssText) {
      navigator.clipboard.writeText(cssText);
      toast({
        title: "Copied to Clipboard",
        description: "The CSS styles have been copied.",
      });
    }
  };

  const handleClear = () => {
    setElementData(null);
    toast({ title: "Cleared", description: "Selection has been cleared." });
  };
  
  const handleApplyStyles = () => {
    toast({
        title: "Coming Soon!",
        description: "Applying styles directly to the page is in development."
    });
  };

  return (
    <div className="p-4 flex flex-col h-full bg-card/30">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-md font-semibold">CSS Inspector</h2>
        <Button onClick={onToggleInspector} size="sm" variant={inspectorActive ? 'destructive' : 'default'}>
          <Power className="w-4 h-4 mr-2" />
          {inspectorActive ? 'Stop Selecting' : 'Select'}
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border flex-shrink-0">
        <Button variant="outline" size="sm" onClick={handleClear} disabled={!elementData}><Trash2 className="w-4 h-4 mr-2" />Clear</Button>
        <Button variant="outline" size="sm" onClick={handleCopyCss} disabled={!cssText}><Copy className="w-4 h-4 mr-2" />Copy</Button>
        <Button variant="default" size="sm" onClick={handleApplyStyles} disabled={!cssText}>
            <Sparkles className="w-4 h-4 mr-2" />
            Apply
        </Button>
      </div>
      
      <div className="flex-grow flex flex-col">
        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Editable CSS</h3>
        {elementData ? (
            <Textarea
              value={cssText}
              onChange={(e) => setCssText(e.target.value)}
              className="font-mono text-xs flex-grow w-full h-full bg-background resize-none"
              placeholder="Select an element to see its CSS..."
            />
        ) : (
            <div className="flex items-center justify-center h-full text-center text-sm text-muted-foreground bg-background rounded-md border">
                <p>{inspectorActive ? "Hover and click an element." : "Click 'Select' to begin."}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SelectorView;