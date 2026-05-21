import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, BookOpen, GraduationCap, Brain, BarChart3 } from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
  { icon: BookOpen, label: "Practice", path: "/practice-select" },
  { icon: GraduationCap, label: "Mock", path: "/mock-exam" },
  { icon: Brain, label: "AI Tutor", path: "/ai-tutor" },
  { icon: BarChart3, label: "Progress", path: "/progress" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPro } = useAuth();

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "#0d0d12", borderTop: "1px solid #1e1e2a",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "8px 12px",
      paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
    }}>
      {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
        const isActive = location.pathname === path;
        const isAiTutor = path === "/ai-tutor";
        return (
          <button key={path} onClick={() => navigate(path)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: "none", border: "none", cursor: "pointer", padding: "4px 12px",
            color: isActive ? "#6C3CE9" : "#555",
            position: "relative",
          }}>
            <Icon size={22} />
            {isAiTutor && !isPro && (
              <span style={{ fontSize: 10, position: "absolute", top: -2, right: -4 }}>🔒</span>
            )}
            {isActive && <span style={{ fontSize: 9, fontWeight: 700 }}>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}