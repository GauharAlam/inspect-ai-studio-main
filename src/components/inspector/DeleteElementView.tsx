// src/components/inspector/DeleteElementView.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';

const DeleteElementView = () => {
  return (
    <div className="p-4 h-full flex flex-col items-center justify-center text-center">
      <Trash2 className="w-12 h-12 text-destructive mb-4" />
      <h2 className="text-lg font-semibold">Delete Element</h2>
      <p className="text-muted-foreground text-sm">Click on any element on the page to permanently remove it from the view.</p>
      <p className="text-xs text-amber-500 mt-2">(Reload the page to restore deleted elements)</p>
    </div>
  );
};

export default DeleteElementView;