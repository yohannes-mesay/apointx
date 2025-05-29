"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/dashboard/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DateFilter } from "@/components/dashboard/date-filter";
import { UserFilter } from "@/components/dashboard/user-filter";
import { Charts } from "@/components/dashboard/charts";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { RealTimeUpdates } from "@/components/dashboard/real-time-updates";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined);
  const [dateMode, setDateMode] = useState<"single" | "range">("single");
  const [selectedUsername, setSelectedUsername] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    setDateRange(undefined);
    setSingleDate(undefined);
    setSelectedUsername(undefined);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from) {
      const from = new Date(range.from);
      from.setHours(0, 0, 0, 0);
      if (range.to) {
        const to = new Date(range.to);
        to.setHours(23, 59, 59, 999);
        setDateRange({ from, to });
      } else {
        setDateRange({ from });
      }
    } else {
      setDateRange(undefined);
    }
  };

  const handleSingleDateChange = (date: Date | undefined) => {
    if (date) {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      setSingleDate(normalizedDate);
      console.log("normalizedDate", normalizedDate);
    } else {
      setSingleDate(undefined);
    }
  };

  return (
    //deployed
    <div className="flex min-h-screen flex-col">
      <Toaster />
      <Header />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <DateFilter
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
              singleDate={singleDate}
              onSingleDateChange={handleSingleDateChange}
              mode={dateMode}
              onModeChange={setDateMode}
              className="w-full sm:w-auto"
            />
            <UserFilter
              selectedUsername={selectedUsername}
              onUsernameChange={setSelectedUsername}
              className="w-full sm:w-auto"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <RealTimeUpdates />
        </div>

        <StatsCards
          key={`stats-${refreshKey}`}
          startDate={dateRange?.from}
          endDate={dateRange?.to}
          singleDate={singleDate}
          dateMode={dateMode}
          username={selectedUsername}
        />

        <Charts
          key={`charts-${refreshKey}`}
          startDate={dateRange?.from}
          endDate={dateRange?.to}
          singleDate={singleDate}
          dateMode={dateMode}
          username={selectedUsername}
        />

        <OrdersTable
          key={`orders-${refreshKey}`}
          startDate={dateRange?.from}
          endDate={dateRange?.to}
          singleDate={singleDate}
          dateMode={dateMode}
          username={selectedUsername}
        />
      </main>
    </div>
  );
}
