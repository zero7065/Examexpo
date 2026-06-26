import { useCallback, useEffect } from "react";

const STORAGE_KEY = "ep-notif-preference";

export function useNotifications() {
  const permission = typeof Notification !== "undefined" ? Notification.permission : "denied";

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "denied";
    const result = await Notification.requestPermission();
    localStorage.setItem(STORAGE_KEY, result);
    return result;
  }, []);

  const sendNotification = useCallback(({ title, body, icon, url, tag }) => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const n = new Notification(title, {
      body,
      icon: icon || "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: tag || "general",
      vibrate: [200, 100, 200],
    });
    if (url) {
      n.onclick = () => {
        window.focus();
        window.location.href = url;
      };
    }
  }, []);

  const scheduleReminder = useCallback(({ title, body, url, delayMs }) => {
    setTimeout(() => {
      sendNotification({ title, body, url, tag: "study-reminder" });
    }, delayMs);
  }, [sendNotification]);

  return { permission, requestPermission, sendNotification, scheduleReminder };
}
