import { useCallback, useRef } from "react";

export function useNotifications() {
  const permissionRef = useRef<NotificationPermission>("default");

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    const perm = await Notification.requestPermission();
    permissionRef.current = perm;
    return perm === "granted";
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });
  }, []);

  const notifyPostureIssue = useCallback((issue: string) => {
    sendNotification("⚠️ Posture Alert", issue);
  }, [sendNotification]);

  const notifyBadgeEarned = useCallback((badgeName: string, icon: string) => {
    sendNotification(`${icon} Badge Earned!`, `You earned the "${badgeName}" badge!`);
  }, [sendNotification]);

  return { requestPermission, sendNotification, notifyPostureIssue, notifyBadgeEarned };
}
