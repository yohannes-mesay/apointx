"use client";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

// Get user's timezone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

interface DateFilterProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  singleDate: Date | undefined;
  onSingleDateChange: (date: Date | undefined) => void;
  mode: "single" | "range";
  onModeChange: (mode: "single" | "range") => void;
  className?: string;
}

export function DateFilter({
  dateRange,
  onDateRangeChange,
  singleDate,
  onSingleDateChange,
  mode,
  onModeChange,
  className,
}: DateFilterProps) {
  const formatDate = (date: Date) => {
    return formatInTimeZone(date, userTimeZone, "LLL dd, y");
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && !singleDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {mode === "range" ? (
              dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                  </>
                ) : (
                  formatDate(dateRange.from)
                )
              ) : (
                <span>Pick a date range</span>
              )
            ) : singleDate ? (
              formatDate(singleDate)
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <Tabs
              defaultValue={mode}
              onValueChange={(value) =>
                onModeChange(value as "single" | "range")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Date</TabsTrigger>
                <TabsTrigger value="range">Date Range</TabsTrigger>
              </TabsList>
              <TabsContent value="single" className="pt-2">
                <Label className="text-xs text-muted-foreground">
                  Select a specific date
                </Label>
              </TabsContent>
              <TabsContent value="range" className="pt-2">
                <Label className="text-xs text-muted-foreground">
                  Select a date range
                </Label>
              </TabsContent>
            </Tabs>
          </div>
          {mode === "range" ? (
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
              className="rounded-md border"
            />
          ) : (
            <Calendar
              initialFocus
              mode="single"
              defaultMonth={singleDate}
              selected={singleDate}
              onSelect={onSingleDateChange}
              className="rounded-md border"
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
