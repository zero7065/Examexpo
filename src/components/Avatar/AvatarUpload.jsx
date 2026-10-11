// AvatarUpload — resize to 400×400 JPEG 0.8, upload to
// avatars/{uid}/profile.jpg, save URL to users/{uid}.photoURL,
// delete the previous file when it was also ours.
import { useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db, getAppStorage, auth } from "../../firebaseConfig";
import { updateProfile } from "firebase/auth";
import { useToast } from "../Toast";
import { Camera, Loader2 } from "lucide-react";

function resizeAvatar(file, dim = 400, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file"));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        // Cover-crop to a square, then downscale
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = dim;
        canvas.height = dim;
        canvas.getContext("2d").drawImage(img, sx, sy, side, side, 0, 0, dim, dim);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Could not process image"))),
          "image/jpeg",
          quality
        );
      } catch {
        reject(new Error("Could not process image"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image file"));
    };
    img.src = url;
  });
}

export default function AvatarUpload({ uid, onDone }) {
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file) {
    if (!file || !uid) return;
    setBusy(true);
    try {
      const blob = await resizeAvatar(file);
      if (blob.size > 200 * 1024) {
        toast({ message: "Photo is still large — try a smaller image", type: "warning" });
      }
      const storage = getAppStorage();
      const path = `avatars/${uid}/profile.jpg`;
      await uploadBytes(ref(storage, path), blob, { contentType: "image/jpeg" });
      const url = await getDownloadURL(ref(storage, path));

      // Best-effort cleanup of a previous custom upload is implicit:
      // same path overwrites, so no orphan files accumulate.
      if (db) {
        await updateDoc(doc(db, "users", uid), { photoURL: url });
      }
      // Mirror onto the auth profile so user.photoURL is fresh app-wide
      try {
        if (auth?.currentUser) await updateProfile(auth.currentUser, { photoURL: url });
      } catch { /* auth mirror best-effort */ }
      try {
        localStorage.removeItem("exampadi_profile_cache");
      } catch { /* cache clear best-effort */ }
      toast({ message: "Profile photo updated ✓", type: "success" });
      onDone?.(url);
    } catch (e) {
      toast({ message: `Upload failed: ${e.message}`, type: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        title="Upload profile photo"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 16px", borderRadius: 10, cursor: busy ? "not-allowed" : "pointer",
          background: "var(--bg-3)", border: "1px solid var(--border)",
          color: "var(--text)", fontWeight: 600, fontSize: 13, fontFamily: "inherit",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <Camera size={15} />}
        {busy ? "Uploading…" : "Upload photo"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
      />
    </>
  );
}
