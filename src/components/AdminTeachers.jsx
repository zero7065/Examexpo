import { useState, useEffect } from "react";
import { GraduationCap, Plus, Copy, Trash2, Loader2 } from "lucide-react";
import { createTeacherInvite, listTeacherInvites, revokeTeacherInvite } from "../lib/teacherInvites";

export default function AdminTeachers() {
  const [invites, setInvites] = useState([]);
  const [schoolName, setSchoolName] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(null);

  async function load() {
    try {
      const data = await listTeacherInvites();
      setInvites(data);
    } catch (e) {
      console.error("Failed to load invites:", e);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    if (!schoolName.trim()) return;
    setCreating(true);
    try {
      const invite = await createTeacherInvite({ schoolName: schoolName.trim(), createdBy: "admin", createdByName: "Admin" });
      setSchoolName("");
      await load();
      setCopied(invite.code);
      setTimeout(() => setCopied(null), 3000);
    } catch (e) {
      console.error("Failed to create invite:", e);
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id) {
    if (!window.confirm("Revoke this invite code?")) return;
    await revokeTeacherInvite(id);
    await load();
  }

  return (
    <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <GraduationCap size={18} color="#6C3CE9" />
        <span style={{ fontSize: 14, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Teacher Invite Codes</span>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          placeholder="School name (e.g., Jos High School)"
          style={{ flex: 1, minWidth: 200, padding: "10px 14px", borderRadius: 8, background: "#1a1a1f", border: "1px solid #333", color: "#fff", fontSize: 13, outline: "none" }}
        />
        <button onClick={handleCreate} disabled={creating || !schoolName.trim()} style={{ padding: "10px 20px", borderRadius: 8, background: "#6C3CE9", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: creating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: creating || !schoolName.trim() ? 0.6 : 1 }}>
          {creating ? <Loader2 size={16} /> : <Plus size={16} />} Generate Code
        </button>
      </div>

      {copied && (
        <div style={{ padding: 12, borderRadius: 8, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <code style={{ color: "#4ADE80", fontWeight: 700, fontSize: 14 }}>{copied}</code>
          <span style={{ color: "#888", fontSize: 12 }}>— share this with the teacher</span>
        </div>
      )}

      {invites.length === 0 ? (
        <div style={{ color: "#666", fontSize: 13, textAlign: "center", padding: 20 }}>No active invite codes</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e1e2a" }}>
                {["Code", "School", "Expires", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invites.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid #1e1e2a" }}>
                  <td style={{ padding: "10px 12px" }}><code style={{ color: "#D4A853", fontWeight: 700 }}>{inv.code}</code></td>
                  <td style={{ padding: "10px 12px", color: "#ccc" }}>{inv.schoolName}</td>
                  <td style={{ padding: "10px 12px", color: "#888" }}>{new Date(inv.expiresAt).toLocaleDateString()}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { navigator.clipboard.writeText(inv.code); setCopied(inv.code); setTimeout(() => setCopied(null), 2000); }} style={{ background: "none", border: "1px solid #333", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#888" }}>
                        <Copy size={14} />
                      </button>
                      <button onClick={() => handleRevoke(inv.id)} style={{ background: "none", border: "1px solid #333", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#FF4D6A" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
