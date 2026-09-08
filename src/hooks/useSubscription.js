import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../lib/userProfile";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { PLANS } from "../config/plans";

export function useSubscription() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        const p = await getUserProfile(user.uid);
        if (mounted) setProfile(p);
      } catch {
        if (mounted) setProfile(null);
      }
      if (mounted) setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  const sub = profile?.subscription;
  const now = new Date();
  const endDate = sub?.endDate?.toDate ? sub.endDate.toDate() : sub?.endDate ? new Date(sub.endDate) : null;
  const isExpired = sub?.status === "active" && endDate && endDate < now;
  const daysLeft = endDate ? Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))) : 0;

  // Auto-downgrade expired users
  useEffect(() => {
    if (isExpired && user && db) {
      updateDoc(doc(db, "users", user.uid), {
        "subscription.status": "expired",
      }).catch(() => {});
    }
  }, [isExpired, user]);

  const freePlan = PLANS.free;
  const isPro = sub?.status === "active" && !isExpired;

  const canAskAI = isPro;
  const canTakeMock = isPro;

  const hasSubject = useCallback((subjectName) => {
    if (isPro) return true;
    const subjects = profile?.subjects || [];
    const idx = subjects.indexOf(subjectName);
    return idx >= 0 && idx < freePlan.limits.subjects;
  }, [isPro, profile, freePlan]);

  return {
    isPro,
    plan: isPro ? sub.plan : "free",
    isExpired,
    daysLeft,
    profile,
    canAskAI,
    canTakeMock,
    hasSubject,
    loading,
  };
}