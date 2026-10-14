// Public profile: visible to any signed-in user only if isPublic (or self/admin).
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPublicProfile } from "../lib/discussions";
import { addPartner } from "../lib/studyPartners";
import { useToast } from "../components/Toast";
import AvatarDisplay from "../components/Avatar/AvatarDisplay";
import { isAdmin } from "../lib/activityLog";
import { ArrowLeft, UserPlus, MessageCircle, Lock, Flame, Star, Trophy, Share2 } from "lucide-react";
import { ACHIEVEMENTS } from "../config/achievements";
import { getActiveBadge } from "../lib/achievements";
import { shareToWhatsApp, copyShareLink } from "../lib/share";

export default function PublicProfile() {
  const { uid } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!uid) return;
    getPublicProfile(uid).then(setProfile).catch(() => setProfile(null)).finally(() => setLoading(false));
  }, [uid]);

  async function handleAdd() {
    if (!user) return;
    setAdding(true);
    try {
      const pairId = await addPartner(user.uid, uid);
      toast({ message: "Study partner added ✓ — say hi in chat!", type: "success" });
      navigate(`/friends/chat/${pairId}`);
    } catch (e) {
      toast({ message: e.message || "Could not add partner", type: "error" });
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return <div className="page-content"><p className="text-text-muted">Loading profile…</p></div>;
  }
  if (!profile) {
    return (
      <div className="page-content max-w-xl mx-auto text-center space-y-4">
        <h1 className="h-1">Profile not found</h1>
        <Link to="/feed" className="btn-secondary inline-flex px-5">Back to feed</Link>
      </div>
    );
  }

  const isSelf = user?.uid === uid;
  const visible = profile.isPublic || isSelf || isAdmin(user);
  const unlocked = Array.isArray(profile.achievements) ? profile.achievements : [];

  if (!visible) {
    return (
      <div className="page-content max-w-xl mx-auto text-center space-y-4">
        <div className="glass-card p-10">
          <Lock size={36} className="mx-auto mb-3 text-text-muted" />
          <h1 className="h-2">This profile is private</h1>
          <p className="text-sm text-text-muted mt-2">@{profile.name || "Student"} hasn't turned on a public profile yet.</p>
          <Link to="/feed" className="btn-secondary inline-flex px-5 mt-4">Back to feed</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content max-w-3xl mx-auto space-y-6">
      <Link to="/feed" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 14, fontWeight: 600 }}>
        <ArrowLeft size={16} /> Feed
      </Link>

      <div className="glass-card p-6 md:p-8 flex flex-col sm:flex-row items-center gap-5">
        <AvatarDisplay profile={profile} user={{ displayName: profile.name, photoURL: profile.photoURL }} size={88} radius={24} />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-black text-text">{profile.name || "Student"}
            {(() => { const b = getActiveBadge(profile); return b ? <span style={{ fontSize: 13, fontWeight: 800, color: b.color, marginLeft: 8 }}>{b.label}</span> : null; })()}
          </h1>
          <p className="text-sm text-text-muted">
            {(profile.exam || "JAMB")} candidate
            {profile.school ? ` · ${profile.school}` : ""}
          </p>
          <div className="flex gap-4 justify-center sm:justify-start mt-3">
            <span className="text-sm"><Flame size={13} className="inline text-orange-400" /> <strong>{profile.streak || 0}</strong> <span className="text-text-muted">day streak</span></span>
            <span className="text-sm"><Star size={13} className="inline text-accent" /> <strong>{(profile.xp || 0).toLocaleString()}</strong> <span className="text-text-muted">XP</span></span>
            <span className="text-sm"><Trophy size={13} className="inline text-primary" /> <strong>{unlocked.length}</strong> <span className="text-text-muted">badges</span></span>
          </div>
        </div>
        {!isSelf && (
          <button onClick={handleAdd} disabled={adding} className="btn-primary disabled:opacity-60 whitespace-nowrap">
            <UserPlus size={15} /> {adding ? "Adding…" : "Add as partner"}
          </button>
        )}
      </div>

      {(profile.subjects || []).length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-black text-text mb-3">Studying</h2>
          <div className="flex flex-wrap gap-2">
            {profile.subjects.map((s) => (
              <span key={s} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold border border-primary/20">{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-5">
        <h2 className="font-black text-text mb-3">Achievements</h2>
        {unlocked.length === 0 ? (
          <p className="text-sm text-text-muted">No badges unlocked yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ACHIEVEMENTS.filter((a) => unlocked.includes(a.id)).map((a) => (
              <div key={a.id} className="rounded-xl border border-accent/30 p-4 text-center" style={{ background: "rgb(var(--accent-rgb) / 0.07)" }}>
                <div style={{ fontSize: 26 }}>{a.icon}</div>
                <div className="text-xs font-bold text-text mt-1">{a.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isSelf && (
        <div className="glass-card p-5 flex items-center gap-3">
          <MessageCircle size={18} className="text-primary shrink-0" />
          <p className="text-sm text-text-muted flex-1">Add {profile.name || "them"} as a partner to discuss problems and share solutions 1:1.</p>
        </div>
      )}

      <div className="glass-card p-5 flex items-center gap-3">
        <Share2 size={18} className="text-primary shrink-0" />
        <p className="text-sm text-text-muted flex-1">Share this profile</p>
        <button onClick={() => { copyShareLink(`/u/${uid}`); toast({ message: "Link copied!", type: "success" }); }} className="btn-secondary px-3 py-2 text-xs">Copy Link</button>
        <button onClick={() => shareToWhatsApp(`Check out ${profile.name || "this student"} on ExamPadi!`, `${window.location.origin}/u/${uid}`)} className="btn-secondary px-3 py-2 text-xs">WhatsApp</button>
      </div>
    </div>
  );
}
