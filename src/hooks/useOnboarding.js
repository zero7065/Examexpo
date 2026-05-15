import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../lib/userProfile";

export function useOnboarding() {
  const { user, loading: authLoading } = useAuth();
  const [onboarded, setOnboarded] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkOnboarding() {
      if (!user) {
        setOnboarded(false);
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
        if (userProfile && userProfile.onboarded) {
          setOnboarded(true);
        } else {
          setOnboarded(false);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setOnboarded(false);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      checkOnboarding();
    }
  }, [user, authLoading]);

  return { onboarded, profile, loading: loading || authLoading };
}