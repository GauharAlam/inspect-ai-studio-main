// src/components/inspector/CodeBlock.tsx
import React from 'react';

interface CodeBlockProps {
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  // Simple parser to colorize the CSS
  const colorizedCode = () => {
    if (!code) return [];

    const lines = code.split('\n');
    return lines.map((line, index) => {
      line = line.trim();
      if (line.endsWith('{')) {
        // Selector line - colored red
        return <div key={index}><span className="text-red-400">{line.replace('{', '')}</span>{"{"}</div>;
      }
      if (line.endsWith('}')) {
        // Closing brace
        return <div key={index}>{"}"}</div>;
      }
      if (line.includes(':')) {
        // Property-value line
        const parts = line.split(':');
        const property = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        return (
          <div key={index} className="pl-4">
            {/* Property - colored cyan */}
            <span className="text-cyan-400">{property}</span>: 
            {/* Value - colored amber */}
            <span className="text-amber-300">{value}</span>
          </div>
        );
      }
      return <div key={index}>{line}</div>;
    });
  };

  return (
    <pre className="font-mono text-xs flex-grow w-full h-full bg-background rounded-md border p-3 overflow-auto">
      <code>
        {colorizedCode()}
      </code>
    </pre>
  );
};

export default CodeBlock;