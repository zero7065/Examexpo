// src/components/Toast.jsx
import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ message, type = "info", duration = 3500 }) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  const icons = { success: "✅", error: "❌", info: "💡", warning: "⚠️" };
  const colors = {
    success: "#00E5A0",
    error: "#FF4D6A",
    info: "#4D9EFF",
    warning: "#FFB800"
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 10,
        maxWidth: 320, width: "calc(100vw - 48px)"
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: "var(--bg-2)",
            border: `1px solid ${colors[t.type]}44`,
            borderLeft: `4px solid ${colors[t.type]}`,
            borderRadius: 10,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "var(--card-shadow)",
            animation: "slideIn 0.25s ease",
            color: "var(--text)",
            fontSize: 14,
          }}>
            <span>{icons[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
