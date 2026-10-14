import { useState, useEffect } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    function onOnline() {
      setIsOnline(true);
      setShowBanner(false);
    }
    function onOffline() {
      setIsOnline(false);
      setShowBanner(true);
    }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return { isOnline, showBanner, dismissBanner: () => setShowBanner(false) };
}

export function useFeatureOnlineGuard() {
  const [blocked, setBlocked] = useState(null);

  function requireOnline(featureName) {
    if (!navigator.onLine) {
      setBlocked(featureName);
      return false;
    }
    return true;
  }

  function dismiss() {
    setBlocked(null);
  }

  return { blocked, requireOnline, dismiss };
}
