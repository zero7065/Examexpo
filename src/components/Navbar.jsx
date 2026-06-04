// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { isAdmin } from "../lib/activityLog";

function checkAdmin(user) {
  try { return typeof isAdmin === 'function' && isAdmin(user); } catch { return false; }
}
import { 
  LayoutDashboard, 
  BookOpen, 
  BarChart3, 
  User, 
  LogOut, 
  Crown, 
  History, 
  Moon, 
  Sun,
  Zap,
  StickyNote,
  Clock,
  HelpCircle,
  Bot,
  MessageSquare,
  Shield
} from "lucide-react";

const Navbar = () => {
  try {
  const { user, logout, isPro } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const proStatus = isPro();

  const navItems = user ? [
    { name: "Home", path: "/dashboard", icon: LayoutDashboard },
    { name: "Practice", path: "/select", icon: Zap },
    { name: "AI Tutor", path: "/ai-tutor", icon: Bot },
    { name: "History", path: "/history", icon: Clock },
    { name: "Stats", path: "/stats", icon: BarChart3 },
    { name: "Notepad", path: "/notepad", icon: StickyNote, requiresPro: true },
    { name: "Help", path: "/help", icon: HelpCircle },
    { name: "Contact", path: "/contact", icon: MessageSquare },
    { name: "Profile", path: "/profile", icon: User },
    ...(checkAdmin(user) ? [{ name: "Admin", path: "/admin", icon: Shield }] : []),
  ] : [];

  // Hide entirely on Landing Page if user prefers a cleaner look, 
  // but we need it for theme toggle and branding.
  // Actually, we'll keep it but modify styles for landing page.
  const isLanding = location.pathname === "/";

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className={`hidden md:flex flex-col w-64 h-screen bg-bg-2 border-r border-border fixed left-0 top-0 p-6 z-50 ${isLanding && !user ? 'bg-transparent border-none' : ''}`}>
        <div className="flex items-center justify-between mb-10 px-2">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-black">E</div>
            <h1 className="text-xl font-black tracking-tight text-text">ExamPadi <span className="text-primary">AI</span></h1>
          </Link>
           <button 
             onClick={toggle}
             aria-label="Toggle theme"
             className="p-2 hover:bg-subtle rounded-lg transition-colors text-text-muted hover:text-primary"
           >
             {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
           </button>
        </div>

        <div className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isLocked = item.requiresPro && !proStatus;
            
            return (
              <Link
                key={item.path}
                to={isLocked ? "/payment" : item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold ${
                  isActive 
                  ? "bg-primary text-black shadow-lg shadow-primary/20" 
                  : isLocked
                  ? "text-text-muted/50 cursor-not-allowed"
                  : "text-text-muted hover:bg-subtle hover:text-text"
                }`}
              >
                <Icon size={20} className={isLocked ? "opacity-50" : ""} />
                <span className={isLocked ? "opacity-50" : ""}>{item.name}</span>
                {isLocked && <span className="ml-auto text-xs">🔒</span>}
              </Link>
            );
          })}
          
          {!user && (
            <Link to="/auth" className="btn-primary w-full mt-10">Sign In</Link>
          )}
        </div>

        {user && (
          <div className="mt-auto pt-6 border-t border-border space-y-4">
            {!proStatus && (
              <Link 
                to="/payment"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-orange-500 text-black py-3 rounded-xl font-black shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all"
              >
                <Crown size={18} />
                Go Pro
              </Link>
            )}
            
            <button
              onClick={async () => { await logout(); navigate("/auth"); }}
              className="flex items-center gap-3 px-4 py-3 w-full text-text-muted hover:text-danger transition-colors font-bold"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Bar - Only show if logged in */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-2/80 border-t border-border flex items-center justify-around p-3 z-50 backdrop-blur-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  isActive ? "text-primary scale-110" : "text-text-muted"
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-bold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Mobile Top Bar for Guests */}
      {!user && (
        <nav className="md:hidden fixed top-0 left-0 right-0 p-6 flex items-center justify-between z-50">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-black">E</div>
            <span className="font-black text-text">ExamPadi</span>
          </Link>
          <button onClick={toggle} className="p-2 text-text-muted">
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>
      )}
    </>
  );
  } catch (e) {
    console.error("Navbar crash:", e);
    return <nav style={{ height: 64, background: "#0d0d12", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #1e1e2a" }}>
      <span style={{ color: "#888", fontSize: 13 }}>ExamPadi AI</span>
    </nav>;
  }
};

export default Navbar;
