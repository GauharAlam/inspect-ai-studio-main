// src/components/inspector/GenerativeAIView.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Wand2, AlertTriangle } from 'lucide-react';
import type { ElementData } from '@/Inspector';
import { useAuth } from '@/contexts/AuthContext';

interface GenerativeAIViewProps {
  elementData: ElementData | null;
}

type SuggestionCategory = 'Accessibility' | 'Performance' | 'UI/UX' | 'Modern Practices';

interface Suggestion {
  title: string;
  reason: string;
  category: SuggestionCategory;
}

// Helper function to convert CSSStyleDeclaration to a simple object
const getSerializableStyles = (styles: CSSStyleDeclaration): Record<string, string> => {
  const styleObject: Record<string, string> = {};
  const relevantProperties = [
    'color', 'background-color', 'font-family', 'font-size', 'font-weight',
    'line-height', 'text-align', 'width', 'height', 'padding', 'margin', 'border',
    'border-radius', 'display', 'flex-direction', 'justify-content', 'align-items', 'gap'
  ];
  
  relevantProperties.forEach(prop => {
      const value = styles.getPropertyValue(prop);
      if(value) {
          styleObject[prop] = value;
      }
  });
  return styleObject;
};


const GenerativeAIView: React.FC<GenerativeAIViewProps> = ({ elementData }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getCategoryVariant = (category: SuggestionCategory) => {
    switch (category) {
      case 'Accessibility':
        return 'default';
      case 'Performance':
        return 'secondary';
      case 'UI/UX':
        return 'outline';
      case 'Modern Practices':
        return 'destructive';
      default:
        return 'default';
    }
  };
  
  const handleGetSuggestions = async () => {
    if (!elementData) {
      setError("Please select an element first using the 'Selector' tool.");
      return;
    }

    if (!user) {
      setError("You must be logged in to use this feature.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      // **FIX**: Convert the large style object into a simple one before sending
      const serializableStyles = getSerializableStyles(elementData.styles as any);

      const response = await fetch('http://localhost:3001/api/suggestions/generate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elementHtml: elementData.html,
          elementCss: serializableStyles, // Send the cleaned object
          websiteUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch suggestions from the server.');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);

    } catch (err: any) {
      console.error('Error fetching AI suggestions:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-primary" />
        <h2 className="text-lg font-semibold">Generative AI Suggestions</h2>
      </div>

      {elementData ? (
        <div className="text-xs text-muted-foreground mb-4 p-2 bg-card/50 rounded border border-border">
          <p className="font-bold truncate">Selected: <span className="font-mono text-primary">{elementData.tag}{elementData.id && `#${elementData.id}`}{elementData.classes && `.${elementData.classes.split(' ')[0]}`}</span></p>
        </div>
      ) : (
         <div className="text-xs text-muted-foreground mb-4 p-2 bg-card/50 rounded border border-border">
          <p>No element selected. Use the <span className="font-bold text-primary">'Selector'</span> tool to pick an element.</p>
        </div>
      )}

      <Button onClick={handleGetSuggestions} disabled={isLoading || !elementData}>
        <Wand2 className="w-4 h-4 mr-2" />
        {isLoading ? 'Analyzing...' : 'Get AI Suggestions'}
      </Button>
      
      <div className="flex-grow overflow-y-auto mt-4 space-y-3">
        {error && (
            <Card className="border-destructive bg-destructive/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Error
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-destructive">
                    {error}
                </CardContent>
            </Card>
        )}

        {suggestions.length > 0 && (
            suggestions.map((suggestion, index) => (
                <Card key={index} className="bg-card/50">
                    <CardHeader className="p-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm">{suggestion.title}</CardTitle>
                             <Badge variant={getCategoryVariant(suggestion.category)}>{suggestion.category}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
                        {suggestion.reason}
                    </CardContent>
                </Card>
            ))
        )}
        
        {!isLoading && !error && suggestions.length === 0 && (
             <div className="text-center text-sm text-muted-foreground pt-10">
                AI suggestions for the selected element will appear here.
            </div>
        )}
      </div>
    </div>
  );
};

export default GenerativeAIView;