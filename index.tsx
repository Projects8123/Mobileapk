import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // Initialize i18next

// Global styles are primarily handled by Tailwind CDN in index.html
// and theme variables injected by App.tsx.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}> {/* Or a more styled loader */}
      <App />
    </Suspense>
  </React.StrictMode>
);