// src/pages/ProfilePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { 
  User, 
  Mail, 
  Crown, 
  Settings, 
  LogOut, 
  Shield, 
  Moon, 
  Sun,
  ChevronRight,
  Zap,
  Award,
  AlertTriangle,
  Trash2
} from "lucide-react";

const ProfilePage = () => {
  const { user, userData, logout, deleteAccount } = useAuth();
  const { theme, toggle } = useTheme();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState(null);

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone and all your study data will be lost.")) {
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    const res = await deleteAccount();
    if (res?.success === false) {
      setDeleteError(res.error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-12 animate-fade">
      <header>
        <h1 className="text-4xl font-black mb-2 text-text">Account Settings</h1>
        <p className="text-text-muted font-medium">Manage your subscription, preferences, and security.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-10 text-center space-y-6 relative overflow-hidden">
            {userData?.plan === 'pro' && (
              <div className="absolute top-4 right-4 text-accent">
                <Crown size={24} />
              </div>
            )}
            
            <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto text-primary font-black text-4xl shadow-xl shadow-primary/10">
              {userData?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-text">{userData?.displayName || "Student"}</h2>
              <p className="text-text-muted text-sm font-medium">{user?.email}</p>
            </div>

            <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest inline-block ${
              userData?.plan === 'pro' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-white/5 text-text-muted border border-border'
            }`}>
              {userData?.plan === 'pro' ? 'Pro Member' : 'Free Member'}
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={toggle}
              className="w-full flex items-center justify-between p-5 glass-card hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-text-muted">
                  {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <span className="font-bold">Appearance</span>
              </div>
              <span className="text-text-muted text-xs font-black uppercase tracking-widest">{theme} Mode</span>
            </button>

            <button 
              onClick={logout}
              className="w-full flex items-center justify-between p-5 glass-card border-danger/10 hover:border-danger/30 text-danger transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-danger/10 rounded-xl flex items-center justify-center transition-colors">
                  <LogOut size={20} />
                </div>
                <span className="font-bold">Sign Out</span>
              </div>
              <ChevronRight size={18} className="text-danger opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* Subscription & Detailed Settings */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Shield size={20} className="text-primary" />
              Subscription Status
            </h3>
            
            <div className="glass-card p-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h4 className="text-2xl font-black mb-2">Current Plan: <span className={userData?.plan === 'pro' ? 'text-accent' : 'text-text-muted'}>{userData?.plan === 'pro' ? 'ExamPadi Pro' : 'Basic (Free)'}</span></h4>
                  <p className="text-text-muted text-sm font-medium max-w-sm">
                    {userData?.plan === 'pro' 
                      ? "Your premium features are active until 2025. You have unlimited daily questions."
                      : "You are currently on the free tier limited to 30 questions daily. Upgrade to remove limits."}
                  </p>
                </div>
                {userData?.plan !== 'pro' && (
                  <Link to="/payment" className="btn-primary px-8 h-14 whitespace-nowrap shadow-xl shadow-primary/20">Upgrade Now</Link>
                )}
              </div>

              <div className="h-px bg-border"></div>

              <div className="grid sm:grid-cols-2 gap-6">
                <PlanBenefit icon={<Zap size={16} />} text="Unlimited Questions" active={userData?.plan === 'pro'} />
                <PlanBenefit icon={<Award size={16} />} text="CBT Sim Mode" active={userData?.plan === 'pro'} />
                <PlanBenefit icon={<User size={16} />} text="Weak Topic AI" active={userData?.plan === 'pro'} />
                <PlanBenefit icon={<Settings size={16} />} text="Custom Dashboard" active={true} />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Settings size={20} className="text-primary" />
              Preferences
            </h3>
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">Email Notifications</div>
                  <div className="text-xs text-text-muted font-medium">Weekly study reports & exam tips</div>
                </div>
                <div className="w-12 h-6 bg-primary/20 rounded-full relative cursor-pointer border border-primary/30">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-primary rounded-full"></div>
                </div>
              </div>
              <div className="h-px bg-border"></div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">Haptic Feedback</div>
                  <div className="text-xs text-text-muted font-medium">Vibrate on mobile for correct answers</div>
                </div>
                <div className="w-12 h-6 bg-white/5 rounded-full relative cursor-pointer border border-border">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-slate-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6 pt-6">
            <h3 className="text-xl font-black flex items-center gap-3 text-danger">
              <AlertTriangle size={20} className="text-danger" />
              Danger Zone
            </h3>
            <div className="glass-card p-8 border-danger/20 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="font-bold text-text">Delete Account</div>
                  <div className="text-sm text-text-muted mt-1 max-w-sm">
                    Permanently delete your account and all associated study data. This action cannot be undone.
                  </div>
                  {deleteError && (
                    <div className="text-sm text-danger mt-2 font-medium bg-danger/10 p-2 rounded-lg inline-block">
                      {deleteError}
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-danger/10 text-danger hover:bg-danger/20 font-bold rounded-xl transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                >
                  {isDeleting ? "Deleting..." : <><Trash2 size={18} /> Delete Account</>}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const PlanBenefit = ({ icon, text, active }) => (
  <div className={`flex items-center gap-3 ${active ? 'text-text' : 'text-text-muted opacity-40'}`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-primary/10 text-primary' : 'bg-white/5'}`}>
      {icon}
    </div>
    <span className="text-sm font-bold">{text}</span>
  </div>
);

export default ProfilePage;
