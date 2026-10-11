// ImageUpload — camera/file button + thumbnail preview with prompt hint.
// Preprocessing (resize/compress) happens in the parent via vision.js.
import { useRef } from "react";
import { Camera, X } from "lucide-react";

export default function ImageUpload({ preview, onSelect, onClear, disabled }) {
  const fileRef = useRef(null);

  return (
    <>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={disabled}
        title="Snap or upload a question photo"
        style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: preview ? "var(--primary)" : "var(--bg-3)",
          border: "1px solid var(--border)",
          color: preview ? "#fff" : "var(--text-muted)",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Camera size={16} />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        // capture omitted: file picker lets the user choose camera or gallery
        style={{ display: "none" }}
        onChange={(e) => { onSelect(e.target.files?.[0]); e.target.value = ""; }}
      />
      {preview && (
        <div style={{
          position: "absolute", bottom: "100%", left: 0, marginBottom: 8,
          background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 12,
          padding: 8, display: "flex", alignItems: "center", gap: 8, maxWidth: 320,
          boxShadow: "var(--card-shadow)",
        }}>
          <img src={preview} alt="Question preview" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }} />
          <div style={{ fontSize: 12, color: "var(--text-muted)", flex: 1 }}>
            Photo attached — describe what to solve, or just send.
          </div>
          <button
            onClick={onClear}
            title="Remove photo"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 4 }}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
