// src/components/ActivityToast.jsx - Works without Firebase
import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";

const MOCK_ACTIVITIES = [
  "Sarah from Lagos just scored 92% in Biology! 🎉",
  "Mike in Abuja completed 50 questions today! 💪",
  "Chidinma started a study streak! 🔥",
  "Temple from Jos just upgraded to Pro! ⭐",
  "Ahmed in Kano scored 280 in JAMB mock! 📈",
  "Grace from Port Harcourt completed her daily goals! 🎯",
];

export default function ActivityToast() {
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timeoutRef = useRef(null);

  // Check if Firebase is configured
  const isConfigured = db !== null && db !== undefined;

  useEffect(() => {
    // Skip if no Firebase or already dismissed
    if (!isConfigured || dismissed) return;

    // Try to fetch from Firestore, fall back to mock if fails
    try {
      const { collection, query, orderBy, limit, onSnapshot } = require("firebase/firestore");
      const q = query(
        collection(db, "publicActivity"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const unsub = onSnapshot(q, (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (docs.length > 0) {
          setCurrent(docs[0]);
          setVisible(true);
        }
      });
      return () => unsub();
    } catch (e) {
      // Fall back to mock data
      showRandomActivity();
    }
  }, [isConfigured, dismissed]);

  // Show random mock activity for demo
  useEffect(() => {
    if (!isConfigured && !dismissed) {
      showRandomActivity();
    }
  }, [isConfigured]);

  function showRandomActivity() {
    if (dismissed) return;
    
    const randomActivity = MOCK_ACTIVITIES[Math.floor(Math.random() * MOCK_ACTIVITIES.length)];
    setCurrent({ message: randomActivity });
    setVisible(true);

    // Auto-hide after 8 seconds
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, 8000);
  }

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  if (dismissed || !current) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 80,
      left: 16,
      zIndex: 8000,
      maxWidth: 300,
      transform: visible ? "translateY(0)" : "translateY(120%)",
      opacity: visible ? 1 : 0,
      transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      pointerEvents: "auto",
    }}>
      <div style={{
        background: "#121218",
        border: "1px solid #333",
        borderLeft: "3px solid #6C3CE9",
        borderRadius: 12,
        padding: "12px 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        position: "relative",
      }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#00E5A0",
          marginTop: 5,
          flexShrink: 0,
          display: "inline-block",
        }} />
        <div>
          <p style={{ color: "#fff", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
            {current.message}
          </p>
          <p style={{
            color: "#888",
            fontSize: 11,
            margin: "4px 0 0",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            Just now · ExamPadi AI
          </p>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            padding: 2,
            fontSize: 14,
            lineHeight: 1,
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}