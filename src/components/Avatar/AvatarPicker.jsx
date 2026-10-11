// AvatarPicker — 24-preset grid + photo upload + save/cancel.
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, getAppStorage, auth } from "../../firebaseConfig";
import { updateProfile } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { PRESET_AVATARS } from "../../lib/avatar";
import { useToast } from "../Toast";
import AvatarUpload from "./AvatarUpload";
import { Check, Loader2 } from "lucide-react";

export default function AvatarPicker({ uid, profile, onClose, onSaved }) {
  const { toast } = useToast();
  const { refreshProfile } = useAuth();
  const current = profile?.photoURL || profile?.avatarPreset || PRESET_AVATARS[0];
  const [selected, setSelected] = useState(current);
  const [uploadedUrl, setUploadedUrl] = useState(profile?.photoURL || null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!uid || !db) {
      toast({ message: "Sign in to change your avatar", type: "warning" });
      return;
    }
    setSaving(true);
    try {
      if (selected === uploadedUrl && uploadedUrl) {
        // Photo upload already saved its URL — just confirm
        await updateDoc(doc(db, "users", uid), { photoURL: uploadedUrl, avatarPreset: null });
      } else {
        // Switching to a preset — clear any uploaded photo (best-effort file delete)
        const updates = { avatarPreset: selected, photoURL: null };
        await updateDoc(doc(db, "users", uid), updates);
        try {
          if (auth?.currentUser) await updateProfile(auth.currentUser, { photoURL: selected });
        } catch { /* auth mirror best-effort */ }
        if (profile?.photoURL && profile.photoURL.includes("firebasestorage")) {
          try {
            await deleteObject(ref(getAppStorage(), `avatars/${uid}/profile.jpg`));
          } catch { /* file may already be gone */ }
        }
      }
      toast({ message: "Avatar updated ✓", type: "success" });
      try { await refreshProfile(); } catch { /* context refresh best-effort */ }
      onSaved?.(selected);
      onClose?.();
    } catch (e) {
      toast({ message: `Could not save avatar: ${e.message}`, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10,
        maxHeight: 300, overflowY: "auto", marginBottom: 16,
      }}>
        {PRESET_AVATARS.map((src) => {
          const sel = selected === src;
          return (
            <button
              key={src}
              onClick={() => setSelected(src)}
              title="Choose avatar"
              style={{
                aspectRatio: "1", borderRadius: 12, overflow: "hidden", cursor: "pointer",
                padding: 4, background: sel ? "var(--primary-dim)" : "var(--bg-3)",
                border: sel ? "2px solid var(--primary)" : "1px solid var(--border)",
                position: "relative",
              }}
            >
              <img src={src} alt="avatar option" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} loading="lazy" />
              {sel && (
                <span style={{
                  position: "absolute", right: 4, bottom: 4, width: 20, height: 20,
                  borderRadius: "50%", background: "var(--primary)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={12} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <AvatarUpload
          uid={uid}
          onDone={(url) => { setUploadedUrl(url); setSelected(url); }}
        />
        {uploadedUrl && (
          <img src={uploadedUrl} alt="uploaded" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", border: selected === uploadedUrl ? "2px solid var(--primary)" : "1px solid var(--border)" }} />
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1, padding: "12px", borderRadius: 10, border: "none", cursor: saving ? "not-allowed" : "pointer",
            background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: saving ? 0.7 : 1,
          }}
        >
          {saving && <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} />}
          {saving ? "Saving…" : "Save avatar"}
        </button>
        <button
          onClick={onClose}
          style={{
            padding: "12px 20px", borderRadius: 10, cursor: "pointer",
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--text-muted)", fontWeight: 600, fontSize: 14, fontFamily: "inherit",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
