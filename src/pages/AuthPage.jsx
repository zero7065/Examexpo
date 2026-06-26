import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, login, register, resetPassword } = useAuth();
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
        await register(form.email, form.password, form.name);
        toast({ message: `Account created! Welcome, ${form.name}`, type: "success" });
      } else {
        await login(form.email, form.password);
        toast({ message: "Welcome back! Let's practice", type: "success" });
      }
    } catch (err) {
      const code = err.code;
      const msg = code === 'auth/invalid-credential' ? 'Incorrect email or password.'
        : code === 'auth/email-already-in-use' ? 'An account with this email already exists. Sign in instead.'
        : code === 'auth/too-many-requests' ? 'Too many attempts. Try again later.'
        : code === 'auth/user-not-found' ? 'No account found with this email.'
        : code === 'auth/wrong-password' ? 'Incorrect password.'
        : err.message.includes('auth is not enabled') ? 'Email/Password login is not enabled. Ask the admin to enable it in Firebase Console → Authentication.'
        : err.message;
      toast({ message: msg, type: "error" });
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!form.email.trim()) {
      setErrors({ email: "Enter your email address" });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(form.email);
      toast({ message: "Password reset email sent! Check your inbox.", type: "success" });
      setMode("signin");
      setForm(f => ({ ...f, password: "" }));
    } catch (err) {
      toast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (field) => ({
    width: "100%",
    padding: "14px 16px",
    borderRadius: 10,
    border: `1.5px solid ${errors[field] ? "var(--danger)" : "var(--border)"}`,
    background: "var(--bg-3)",
    color: "var(--text)",
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: errors[field] ? 4 : 16,
    transition: "border 0.2s",
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: "40px 32px",
        boxShadow: "var(--card-shadow)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "var(--primary)", display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 28, color: "#fff",
            marginBottom: 12
          }}>E</div>
          <h1 style={{ color: "var(--text)", fontSize: 24, fontWeight: 800, margin: 0 }}>
            ExamPadi AI
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
            {mode === "signup" ? "Create your account — it's free" : mode === "forgot" ? "Reset your password" : "Welcome back, let's practice"}
          </p>
        </div>

        <div style={{
          display: "flex",
          background: "var(--bg-3)",
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
        }}>
          {[["signin", "Sign In"], ["signup", "Sign Up"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setErrors({}); }}
              style={{
                flex: 1, padding: "10px 0", border: "none", borderRadius: 10,
                background: mode === m ? "var(--primary)" : "transparent",
                color: mode === m ? "#fff" : "var(--text-muted)",
                fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                fontSize: 14, transition: "all 0.2s",
              }}>
              {label}
            </button>
          ))}
        </div>

        {mode === "forgot" && (
          <p style={{ textAlign: "center", marginBottom: 16 }}>
            <button onClick={() => { setMode("signin"); setErrors({}); }}
              style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
              ← Back to Sign In
            </button>
          </p>
        )}

        {errors.general && (
          <div style={{
            padding: "12px 16px", borderRadius: 10, background: "var(--danger-dim)",
            border: "1px solid var(--danger)", color: "var(--danger)",
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
            {errors.name && <p style={{ color: "var(--danger)", fontSize: 12, margin: "0 0 12px" }}>{errors.name}</p>}
          </>
        )}

        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          style={inputStyle("email")}
        />
        {errors.email && <p style={{ color: "var(--danger)", fontSize: 12, margin: "0 0 12px" }}>{errors.email}</p>}

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
              color: "var(--text-muted)",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p style={{ color: "var(--danger)", fontSize: 12, margin: "0 0 12px" }}>{errors.password}</p>}

        {mode === "forgot" && (
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
            Enter your email above and we'll send a password reset link.
          </p>
        )}

        {mode === "signin" && (
          <p style={{ textAlign: "right", marginBottom: 16 }}>
            <button
              onClick={() => { setMode("forgot"); setErrors({}); }}
              style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
            >
              Forgot password?
            </button>
          </p>
        )}

        <button
          onClick={mode === "forgot" ? handleForgotPassword : handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: loading ? "var(--bg-3)" : "var(--primary)",
            color: loading ? "var(--text-muted)" : "#fff",
            fontWeight: 800, fontSize: 16, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit", marginBottom: 16, transition: "all 0.2s",
          }}>
          {loading ? "Please wait..." : mode === "signup" ? "Create Account" : mode === "forgot" ? "Reset Password" : "Sign In"}
        </button>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, marginTop: 20 }}>
          {mode === "signin"
            ? <>Don't have an account? <button onClick={() => setMode("signup")} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Sign Up free</button></>
            : <>Already have an account? <button onClick={() => setMode("signin")} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Sign In</button></>
          }
        </p>
      </div>
    </div>
  );
}