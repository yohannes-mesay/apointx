"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Bell, BellOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface UpdatesData {
  hasUpdates: boolean;
  appointmentsCount: number;
  ordersCount: number;
  latestAppointment: any;
  latestOrder: any;
}

export function RealTimeUpdates() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAppointmentsCountRef = useRef(0);
  const lastOrdersCountRef = useRef(0);

  useEffect(() => {
    // Create audio element for notifications
    audioRef.current = new Audio("/notification.mp3");

    // Check for updates every 10 min
    const intervalId = setInterval(checkForUpdates, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const checkForUpdates = async () => {
    if (!notificationsEnabled) return;

    try {
      const response = await fetch("/api/updates");
      if (!response.ok) throw new Error("Failed to check for updates");

      const data: UpdatesData = await response.json();

      if (data.hasUpdates) {
        // Check what was updated
        if (
          data.appointmentsCount > lastAppointmentsCountRef.current &&
          lastAppointmentsCountRef.current > 0
        ) {
          showNotification("New appointment captured!");
        }

        if (
          data.ordersCount > lastOrdersCountRef.current &&
          lastOrdersCountRef.current > 0
        ) {
          showNotification("New order received!");
        }

        // Update the refs
        lastAppointmentsCountRef.current = data.appointmentsCount;
        lastOrdersCountRef.current = data.ordersCount;
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  };

  const showNotification = (message: string) => {
    toast.success(message, {
      position: "top-right",
      duration: 5000,
    });

    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.error("Failed to play notification sound:", err);
      });
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="notifications"
          checked={notificationsEnabled}
          onCheckedChange={setNotificationsEnabled}
        />
        <Label htmlFor="notifications" className="flex items-center gap-1">
          {notificationsEnabled ? (
            <Bell className="h-4 w-4" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
          <span>Notifications</span>
        </Label>
      </div>
      {notificationsEnabled && (
        <div className="flex items-center space-x-2">
          <Switch
            id="sound"
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
          />
          <Label htmlFor="sound">Sound</Label>
        </div>
      )}
    </div>
  );
}
