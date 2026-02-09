import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationToggleProps {
  onEnable: () => Promise<boolean>;
}

const NotificationToggle = ({ onEnable }: NotificationToggleProps) => {
  const [enabled, setEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ("Notification" in window) {
      setEnabled(Notification.permission === "granted");
    }
  }, []);

  const handleToggle = async () => {
    if (enabled) {
      setEnabled(false);
      toast({ title: "Notifications disabled", description: "You won't receive browser notifications." });
      return;
    }
    const granted = await onEnable();
    setEnabled(granted);
    if (granted) {
      toast({ title: "Notifications enabled", description: "You'll receive posture alerts as browser notifications." });
    } else {
      toast({ title: "Permission denied", description: "Please enable notifications in your browser settings.", variant: "destructive" });
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleToggle} title={enabled ? "Disable notifications" : "Enable notifications"}>
      {enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
    </Button>
  );
};

export default NotificationToggle;
