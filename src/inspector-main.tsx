import React from 'react';
import { createRoot } from 'react-dom/client';
import Inspector from './Inspector';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Inspector />
  </React.StrictMode>,
);