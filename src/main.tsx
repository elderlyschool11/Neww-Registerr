import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    console.error('Render error:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif; border: 2px solid red; margin: 20px; border-radius: 8px;">
        <h2 style="margin-top: 0;">พบข้อผิดพลาดในการโหลด (App Crash)</h2>
        <p>กรุณาตรวจสอบ Console หรือลอง Refresh หน้าจอ</p>
        <pre style="background: #fee; padding: 10px; overflow: auto; font-size: 12px;">${error instanceof Error ? error.stack : String(error)}</pre>
      </div>
    `;
  }
}

// Global errors outside React
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  if (rootElement && !rootElement.innerHTML.includes('พบข้อผิดพลาด')) {
    rootElement.innerHTML += `
      <div style="padding: 20px; color: #856404; background-color: #fff3cd; border: 1px solid #ffeeba; margin: 20px; border-radius: 8px;">
        <strong>Runtime Error:</strong> ${event.message}
      </div>
    `;
  }
});
