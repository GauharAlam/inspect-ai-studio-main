// src/Inspector.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './pages/Dashboard'; // Dashboard component ko import karein
import { AuthProvider } from './contexts/AuthContext'; // AuthProvider ki bhi zaroorat padegi
import './index.css'; // Global CSS (agar zaroori ho)

function InspectorApp() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <Dashboard /> {/* Yahan Dashboard component ko render kar rahe hain */}
      </AuthProvider>
    </React.StrictMode>
  );
}

// `inspector.html` mein jis element mein aap render karna chahte hain, uski ID
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<InspectorApp />);
} else {
  console.error("Root element with ID 'root' not found in inspector.html");
}

export default InspectorApp; // Agar aapko ye App component kahi aur use karna ho