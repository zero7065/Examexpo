import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { ToastProvider } from './components/Toast'
import { AuthProvider } from './context/AuthContext'
import { initMonitoring } from './lib/monitoring'
import { isAdmin } from './lib/activityLog'
import './index.css'
// App.css was removed — all styles are in index.css

// Init Sentry monitoring (reads VITE_SENTRY_DSN)
initMonitoring();

// Force isAdmin into bundle to prevent tree-shaking (used in Navbar + AdminPage)
if (typeof isAdmin === 'function') isAdmin({ uid: 'retain' });

// Unregister stale service workers to prevent "n is not a function" from cached old bundles
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
