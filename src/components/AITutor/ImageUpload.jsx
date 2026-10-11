// ImageUpload — camera/file button + thumbnail previews (up to 3 for doc analysis).
// Preprocessing (resize/compress) happens in the parent via vision.js.
import { useRef } from "react";
import { Camera, X } from "lucide-react";

const MAX_IMAGES = 3;

export default function ImageUpload({ preview, previews, onSelect, onClear, onClearOne, disabled }) {
  const fileRef = useRef(null);
  const list = Array.isArray(previews) ? previews : preview ? [preview] : [];
  const hasAny = list.length > 0;

  return (
    <>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={disabled || list.length >= MAX_IMAGES}
        title={list.length >= MAX_IMAGES ? "Maximum 3 photos" : "Snap or upload photos (up to 3 for documents)"}
        style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: hasAny ? "var(--primary)" : "var(--bg-3)",
          border: "1px solid var(--border)",
          color: hasAny ? "#fff" : "var(--text-muted)",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
          position: "relative",
        }}
      >
        <Camera size={16} />
        {list.length > 1 && (
          <span style={{
            position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%",
            background: "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{list.length}</span>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        // capture omitted: file picker lets the user choose camera or gallery
        style={{ display: "none" }}
        onChange={(e) => { onSelect(e.target.files?.[0]); e.target.value = ""; }}
      />
      {hasAny && (
        <div style={{
          position: "absolute", bottom: "100%", left: 0, marginBottom: 8,
          background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 12,
          padding: 8, display: "flex", alignItems: "center", gap: 8, maxWidth: 340,
          boxShadow: "var(--card-shadow)", zIndex: 5,
        }}>
          {list.map((src, i) => (
            <div key={i} style={{ position: "relative", flexShrink: 0 }}>
              <img src={src} alt={`Attached ${i + 1}`} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, display: "block" }} />
              <button
                onClick={() => (onClearOne ? onClearOne(i) : onClear())}
                title="Remove"
                style={{
                  position: "absolute", top: -7, right: -7, width: 20, height: 20, borderRadius: "50%",
                  background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text-muted)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <div style={{ fontSize: 12, color: "var(--text-muted)", flex: 1, minWidth: 120 }}>
            {list.length} photo{list.length > 1 ? "s" : ""} attached — describe what to solve, or just send.
          </div>
          <button
            onClick={onClear}
            title="Remove all"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 4, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}
          >
            Clear
          </button>
        </div>
      )}
    </>
  );
}

export { MAX_IMAGES };
