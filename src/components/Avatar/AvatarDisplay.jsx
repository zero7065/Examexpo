// AvatarDisplay — photo URL, preset SVG, or initial tile fallback.
import { useState } from "react";
import { getInitials } from "../../lib/avatar";

export default function AvatarDisplay({ user, profile, size = 40, radius = 12 }) {
  const [failed, setFailed] = useState(false);
  const url = failed ? null : user?.photoURL || profile?.photoURL || profile?.avatarPreset || null;
  const name = user?.displayName || profile?.name || "";
  const email = user?.email || profile?.email || "";

  const box = {
    width: size,
    height: size,
    borderRadius: radius,
    flexShrink: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--primary-dim)",
    border: "1px solid var(--border)",
    fontWeight: 800,
    color: "var(--primary)",
    fontSize: Math.max(12, Math.round(size * 0.38)),
  };

  if (!url) {
    return <div style={box}>{getInitials(name, email)}</div>;
  }

  return (
    <div style={box}>
      <img
        src={url}
        alt={name || "avatar"}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
