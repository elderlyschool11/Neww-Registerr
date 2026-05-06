import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('Main.tsx loaded');
const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.innerHTML = 'Loading application...';
}

// Global error handler for debugging
window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">
      <h2>Runtime Error:</h2>
      <pre>${event.error?.stack || event.message}</pre>
    </div>`;
  }
});

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
