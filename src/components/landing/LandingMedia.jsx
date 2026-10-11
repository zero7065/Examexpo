// LandingMedia — renders a landing image slot with graceful fallback:
// admin-managed URL → bundled screenshot → code-drawn mockup.
import { useEffect, useState } from "react";
import { getSlotSources } from "../../lib/landingMedia";

export default function LandingMedia({ slot, alt = "", mockup = null, imgStyle = {}, className = "lp-shot" }) {
  const [sources, setSources] = useState(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let live = true;
    getSlotSources(slot).then((s) => {
      if (live) setSources(s);
    });
    return () => { live = false; };
  }, [slot]);

  if (sources === null) {
    // Loading — show mockup skeleton (or nothing) until resolved
    return mockup;
  }

  if (idx < sources.length) {
    return (
      <img
        src={sources[idx]}
        alt={alt}
        className={className}
        style={imgStyle}
        loading="lazy"
        onError={() => setIdx((i) => i + 1)}
      />
    );
  }

  return mockup;
}
