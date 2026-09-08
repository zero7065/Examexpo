import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "ep_reminders";

function getStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setStorage(reminders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

function generateId() {
  return `rem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function requestPermission() {
  if (typeof Notification === "undefined") return Promise.resolve("denied");
  if (Notification.permission === "granted") return Promise.resolve("granted");
  if (Notification.permission === "denied") return Promise.resolve("denied");
  return Notification.requestPermission();
}

export function useNotifications() {
  const [reminders, setReminders] = useState(() => getStorage());

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const current = getStorage();
      const due = current.filter((r) => !r.fired && r.time <= now);
      if (due.length === 0) return;

      due.forEach((r) => {
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(r.title, {
            body: r.body,
            icon: "/pwa-192x192.png",
            badge: "/pwa-192x192.png",
            tag: r.id,
            vibrate: [200, 100, 200],
          });
        }
        r.fired = true;
      });

      setStorage(current);
      setReminders([...current]);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const sendNotification = useCallback((title, body) => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") {
      requestPermission();
      return;
    }
    new Notification(title, {
      body,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: "general",
      vibrate: [200, 100, 200],
    });
  }, []);

  const scheduleReminder = useCallback((time, title, body) => {
    const id = generateId();
    const reminder = {
      id,
      title,
      body,
      time,
      fired: false,
      createdAt: Date.now(),
    };
    const current = getStorage();
    current.push(reminder);
    setStorage(current);
    setReminders([...current]);
    return id;
  }, []);

  const getReminders = useCallback(() => {
    return getStorage();
  }, []);

  const clearReminder = useCallback((id) => {
    const current = getStorage().filter((r) => r.id !== id);
    setStorage(current);
    setReminders([...current]);
  }, []);

  return { sendNotification, scheduleReminder, getReminders, clearReminder, reminders };
}
