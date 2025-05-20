"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";

interface StatsData {
  appointmentsCount: number;
  successfulOrdersCount: number;
  failedAppointmentsCount: number;
  paidOrdersCount: number;
  failedOrdersCount: number;
}

interface StatsCardsProps {
  startDate?: Date;
  endDate?: Date;
  singleDate?: Date;
  dateMode: "single" | "range";
}

export function StatsCards({
  startDate,
  endDate,
  singleDate,
  dateMode,
}: StatsCardsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (dateMode === "range" && startDate && endDate) {
          params.append("startDate", startDate.toISOString());
          params.append("endDate", endDate.toISOString());
        } else if (dateMode === "single" && singleDate) {
          params.append("singleDate", singleDate.toISOString());
        }

        const response = await fetch(`/api/stats?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [startDate, endDate, singleDate, dateMode]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatsCard
        title="Appointments"
        value={stats?.appointmentsCount}
        icon={<CalendarIcon className="h-4 w-4 text-blue-600" />}
        loading={loading}
      />
      <StatsCard
        title="Successful Orders"
        value={stats?.successfulOrdersCount}
        icon={<CheckCircle className="h-4 w-4 text-green-600" />}
        loading={loading}
      />
      <StatsCard
        title="Failed Appointments"
        value={stats?.failedAppointmentsCount}
        icon={<XCircle className="h-4 w-4 text-red-600" />}
        loading={loading}
      />
      <StatsCard
        title="Paid Orders"
        value={stats?.paidOrdersCount}
        icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
        loading={loading}
      />
      <StatsCard
        title="Failed Orders"
        value={stats?.failedOrdersCount}
        icon={<AlertCircle className="h-4 w-4 text-amber-600" />}
        loading={loading}
      />
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value?: number;
  icon: React.ReactNode;
  loading: boolean;
}

function StatsCard({ title, value, icon, loading }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">
            {value?.toLocaleString() || 0}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
