import { useState } from "react";
import { Image as ImageIcon, Loader2, Sparkles, Download } from "lucide-react";
import { askGroq } from "../lib/ai";

// Free, keyless AI image endpoint (verified reachable). Generates a real image
// from a text prompt; we preload it to detect failure before showing it.
function buildImageUrl(prompt, seed) {
  const p = encodeURIComponent(prompt.slice(0, 400));
  return `https://image.pollinations.ai/prompt/${p}?width=800&height=600&nologo=true&seed=${seed}`;
}

function preloadImage(url, timeoutMs = 40000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => reject(new Error("Image generation timed out")), timeoutMs);
    img.onload = () => { clearTimeout(timer); resolve(url); };
    img.onerror = () => { clearTimeout(timer); reject(new Error("Image generation failed")); };
    img.src = url;
  });
}

export default function ImageGenerator({ onClose }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      // 1) Enrich the user's prompt into a detailed illustration brief.
      let brief = prompt.trim();
      try {
        const result = await askGroq(
          "Rewrite the user's request as one vivid, detailed prompt for an educational illustration or diagram for a Nigerian secondary school student. Describe subject, labels, style, colours and layout in under 60 words. Reply with ONLY the prompt text.",
          prompt,
          { maxTokens: 200 }
        );
        if (result) brief = result.replace(/^["'`\n]+|["'`\n]+$/g, "");
      } catch {
        // AI enrichment is optional — fall back to the raw prompt.
      }

      // 2) Generate a real image; retry once with a different seed on failure.
      let url = buildImageUrl(brief, Math.floor(Math.random() * 100000));
      try {
        await preloadImage(url);
      } catch {
        url = buildImageUrl(brief, Math.floor(Math.random() * 100000));
        await preloadImage(url);
      }
      setImageUrl(url);
    } catch {
      setError("Could not generate an image right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function download() {
    if (!imageUrl) return;
    const name = "exampadi-diagram";
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const ext = blob.type.includes("png") ? "png" : "jpg";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch {
      window.open(imageUrl, "_blank", "noopener");
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div className="glass-card" style={{ position: "relative", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ color: "var(--text)", fontSize: 18, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <ImageIcon size={20} style={{ color: "var(--primary)" }} /> AI Image Generator
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") generate(); }}
            placeholder="Describe the image you need (e.g., labelled diagram of a plant cell)…"
            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, outline: "none" }}
          />
          <button onClick={generate} disabled={loading || !prompt.trim()} style={{ padding: "10px 20px", borderRadius: 8, background: "var(--primary)", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: loading || !prompt.trim() ? 0.6 : 1 }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Generate
          </button>
        </div>

        {loading && (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 10px", color: "var(--primary)" }} />
            Drawing your image… this takes 10–30 seconds.
          </div>
        )}

        {error && <div style={{ padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        {imageUrl && (
          <div style={{ textAlign: "center" }}>
            <img src={imageUrl} alt="Generated illustration" style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid var(--border)", marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={download} style={{ padding: "10px 20px", borderRadius: 8, background: "var(--success, #4ADE80)", border: "none", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Download size={14} /> Download
              </button>
              <button onClick={generate} style={{ padding: "10px 20px", borderRadius: 8, background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Generate another
              </button>
            </div>
          </div>
        )}

        {!imageUrl && !loading && (
          <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", margin: 0 }}>
            Describe any educational diagram, illustration or scene and AI will generate a real image for you.
          </p>
        )}
      </div>
    </div>
  );
}
