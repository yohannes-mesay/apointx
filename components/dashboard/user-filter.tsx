"use client";

import { useState, useEffect } from "react";
import { UserIcon } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface UserFilterProps {
  selectedUsername: string | undefined;
  onUsernameChange: (username: string | undefined) => void;
  className?: string;
}

interface UsernameCount {
  username: string;
  count: number;
}

export function UserFilter({
  selectedUsername,
  onUsernameChange,
  className,
}: UserFilterProps) {
  const [usernames, setUsernames] = useState<UsernameCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsernames = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/usernames`);
        if (!response.ok) throw new Error("Failed to fetch usernames");

        const data = await response.json();
        setUsernames(data);
      } catch (error) {
        console.error("Error fetching usernames:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsernames();
  }, []);

  const handleChange = (value: string) => {
    onUsernameChange(value === "all" ? undefined : value);
  };

  return (
//deploye
    <div className={cn("grid gap-2", className)}>
      <Select
        disabled={loading}
        value={selectedUsername || "all"}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-full min-w-[180px]">
          <div className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select user" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          {usernames.map((item) => (
            <SelectItem key={item.username} value={item.username}>
              {item.username} ({item.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
