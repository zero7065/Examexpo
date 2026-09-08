import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isAdmin as checkAdmin } from "../lib/activityLog";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: "3px solid #333",
          borderTopColor: "#6C3CE9",
          borderRadius: "50%",
          animation: "spinner 0.8s linear infinite",
        }} />
        <style>{`@keyframes spinner { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!checkAdmin(user)) return <Navigate to="/dashboard" replace />;

  return children;
}
