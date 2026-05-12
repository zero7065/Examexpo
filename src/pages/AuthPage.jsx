// src/pages/AuthPage.jsx - Fully offline with localStorage
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState("signin");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  function validate() {
    const e = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Enter your full name";
    if (!form.email.trim()) e.email = "Enter your email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address";
    if (!form.password) e.password = "Enter your password";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);

    try {
      if (mode === "signup") {
        register(form.email, form.password, form.name);
        toast({ message: `Account created! Welcome, ${form.name}`, type: "success" });
        navigate("/dashboard");
      } else {
        login(form.email, form.password);
        toast({ message: `Welcome back! Let's practice`, type: "success" });
        navigate("/dashboard");
      }
    } catch (err) {
      toast({ message: err.message, type: "error" });
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (field) => ({
    width: "100%",
    padding: "14px 16px",
    borderRadius: 10,
    border: `1.5px solid ${errors[field] ? "#FF4D6A" : "#333"}`,
    background: "#1a1a1f",
    color: "#fff",
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: errors[field] ? 4 : 16,
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#121218",
        border: "1px solid #222",
        borderRadius: 20,
        padding: "40px 32px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "#6C3CE9", display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 28, color: "#fff",
            marginBottom: 12
          }}>E</div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: 0 }}>
            ExamPadi AI
          </h1>
          <p style={{ color: "#888", fontSize: 14, marginTop: 4 }}>
            {mode === "signup" ? "Create your account — it's free" : "Welcome back, let's practice"}
          </p>
        </div>

        <div style={{
          display: "flex",
          background: "#1a1a1f",
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
        }}>
          {[["signin", "Sign In"], ["signup", "Sign Up"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setErrors({}); }}
              style={{
                flex: 1, padding: "10px 0", border: "none", borderRadius: 10,
                background: mode === m ? "#6C3CE9" : "transparent",
                color: mode === m ? "#fff" : "#888",
                fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                fontSize: 14, transition: "all 0.2s",
              }}>
              {label}
            </button>
          ))}
        </div>

        {errors.general && (
          <div style={{
            padding: "12px 16px", borderRadius: 10, background: "#FF4D6A15",
            border: "1px solid #FF4D6A44", color: "#FF4D6A",
            fontSize: 14, marginBottom: 16,
          }}>
            {errors.general}
          </div>
        )}

        {mode === "signup" && (
          <>
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={inputStyle("name")}
            />
            {errors.name && <p style={{ color: "#FF4D6A", fontSize: 12, margin: "0 0 12px" }}>{errors.name}</p>}
          </>
        )}

        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          style={inputStyle("email")}
        />
        {errors.email && <p style={{ color: "#FF4D6A", fontSize: 12, margin: "0 0 12px" }}>{errors.email}</p>}

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder={mode === "signup" ? "Create password (min 6 chars)" : "Password"}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            style={{ ...inputStyle("password"), paddingRight: 44 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#888",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p style={{ color: "#FF4D6A", fontSize: 12, margin: "0 0 12px" }}>{errors.password}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: loading ? "#333" : "#6C3CE9",
            color: loading ? "#666" : "#fff",
            fontWeight: 800, fontSize: 16, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit", marginBottom: 16, transition: "all 0.2s",
          }}>
          {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
        </button>

        <p style={{ textAlign: "center", color: "#888", fontSize: 13, marginTop: 20 }}>
          {mode === "signin"
            ? <>Don't have an account? <button onClick={() => setMode("signup")} style={{ background: "none", border: "none", color: "#6C3CE9", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Sign Up free</button></>
            : <>Already have an account? <button onClick={() => setMode("signin")} style={{ background: "none", border: "none", color: "#6C3CE9", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Sign In</button></>
          }
        </p>
      </div>
    </div>
  );
}