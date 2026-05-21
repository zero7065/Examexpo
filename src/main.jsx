import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { ToastProvider } from './components/Toast'
import { AuthProvider } from './context/AuthContext'
import { initMonitoring } from './lib/monitoring'
import './index.css'

// Init Sentry monitoring (reads VITE_SENTRY_DSN)
initMonitoring();

// Register service worker for offline support
if ('serviceWorker' in navigator) {
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
