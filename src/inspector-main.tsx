// src/inspector-main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import Inspector from './Inspector';
import { AuthProvider } from './contexts/AuthContext'; // AuthProvider ko import karein
import { MemoryRouter } from 'react-router-dom'; // Router ke lie
import './index.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      {/* Inspector component ko AuthProvider aur MemoryRouter se wrap karein */}
      <MemoryRouter>
        <AuthProvider>
          <Inspector />
        </AuthProvider>
      </MemoryRouter>
    </React.StrictMode>,
  );
}