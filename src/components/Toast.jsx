import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

const typeColors = {
  success: "#00E5A0",
  error: "#FF4D6A",
  warning: "#FF9F43",
  info: "#6C3CE9",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ message, type = "info" }) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        zIndex: 9999, display: "flex", flexDirection: "column", gap: 8,
        maxWidth: 400, width: "calc(100vw - 48px)",
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: "#1a1a1f",
            border: "1px solid #333",
            borderRadius: 10,
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            animation: "toastSlideUp 0.25s ease",
            color: "#fff",
            fontSize: 14,
            fontFamily: "system-ui, sans-serif",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: typeColors[t.type], flexShrink: 0,
            }} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
