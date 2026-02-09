import { useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

const BREAK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

const breakMessages = [
  { title: "⏰ Time for a break!", body: "You've been monitoring for 30 minutes. Stand up, stretch, and look away from the screen." },
  { title: "🧘 Stretch break!", body: "Roll your shoulders, stretch your neck, and take a few deep breaths." },
  { title: "👀 Rest your eyes!", body: "Follow the 20-20-20 rule: look at something 20 feet away for 20 seconds." },
  { title: "🚶 Move around!", body: "A short walk can boost circulation and reset your posture." },
  { title: "💧 Hydration check!", body: "Grab some water and do a quick standing stretch." },
];

export function useBreakReminder() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(0);

  const showReminder = useCallback(() => {
    const msg = breakMessages[countRef.current % breakMessages.length];
    countRef.current += 1;

    toast(msg.title, {
      description: msg.body,
      duration: 10000,
      action: {
        label: "Dismiss",
        onClick: () => {},
      },
    });
  }, []);

  const startReminders = useCallback(() => {
    stopReminders();
    countRef.current = 0;
    timerRef.current = setInterval(showReminder, BREAK_INTERVAL_MS);
  }, [showReminder]);

  const stopReminders = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopReminders();
  }, [stopReminders]);

  return { startReminders, stopReminders };
}
