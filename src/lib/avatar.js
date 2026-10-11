// src/lib/avatar.js — avatar resolution + upload helpers.
export const PRESET_AVATARS = Array.from(
  { length: 24 },
  (_, i) => `/avatars/avatar-${String(i + 1).padStart(2, "0")}.svg`
);

export const DEFAULT_AVATAR = PRESET_AVATARS[0];

// Returns the best avatar URL for a user: uploaded photoURL → chosen preset
// → default. Returns null when only an initial-tile can render (no name/photo).
export function getAvatarUrl(user, profile) {
  const uploaded = user?.photoURL || profile?.photoURL;
  if (uploaded) return uploaded;
  const preset = profile?.avatarPreset;
  if (preset && PRESET_AVATARS.includes(preset)) return preset;
  return null;
}

export function getInitials(name, email) {
  const src = (name || "").trim() || (email || "").trim();
  if (!src) return "?";
  const parts = src.includes("@") ? [src[0]] : src.split(/\s+/);
  return parts
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
