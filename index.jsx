import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BudgetProvider } from './src/context/BudgetContext.jsx';
import './index.css';

// Ensure #root exists and show immediate loading message so page isn't blank
let container = document.getElementById('root');
if (!container) {
  container = document.createElement('div');
  container.id = 'root';
  document.body.appendChild(container);
}
container.innerHTML = '<div style="padding:20px;font-family:system-ui;color:#666">Mounting SmartBudget...</div>';

try {
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <BudgetProvider>
        <App />
      </BudgetProvider>
    </React.StrictMode>
  );

  // visible badge to confirm mount
  setTimeout(() => {
    const badge = document.createElement('div');
    badge.style.position = 'fixed';
    badge.style.left = '12px';
    badge.style.bottom = '12px';
    badge.style.padding = '6px 10px';
    badge.style.background = '#ecfeff';
    badge.style.color = '#083344';
    badge.style.border = '1px solid rgba(6,95,70,0.12)';
    badge.style.borderRadius = '8px';
    badge.style.fontFamily = 'system-ui';
    badge.style.fontSize = '12px';
    badge.style.zIndex = '9999';
    badge.textContent = 'React mounted';
    document.body.appendChild(badge);
  }, 800);
} catch (err) {
  console.error('Mount failed:', err);
  container.innerHTML = `<div style="padding:20px;color:#7f1d1d;background:#fff1f2;border-radius:8px;margin:12px">
    <h2 style="margin:0 0 8px">Mount failed</h2>
    <pre style="white-space:pre-wrap">${(err && err.stack) || err}</pre>
  </div>`;
}
