// src/inspector-main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import Inspector from './Inspector';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Inspector />
    </React.StrictMode>,
  );
}