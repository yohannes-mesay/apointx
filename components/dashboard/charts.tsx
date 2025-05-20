"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AppointmentsByOffice {
  officeName: string;
  count: number;
}

interface AppointmentsByTime {
  hour: number;
  count: number;
}

interface OrdersByUsername {
  username: string;
  count: number;
}

interface ChartsProps {
  startDate?: Date;
  endDate?: Date;
  singleDate?: Date;
  dateMode: "single" | "range";
}

export function Charts({
  startDate,
  endDate,
  singleDate,
  dateMode,
}: ChartsProps) {
  const [officeData, setOfficeData] = useState<AppointmentsByOffice[]>([]);
  const [timeData, setTimeData] = useState<AppointmentsByTime[]>([]);
  const [usernameData, setUsernameData] = useState<OrdersByUsername[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (dateMode === "range" && startDate && endDate) {
          params.append("startDate", startDate.toISOString());
          params.append("endDate", endDate.toISOString());
        } else if (dateMode === "single" && singleDate) {
          params.append("singleDate", singleDate.toISOString());
        }

        const [officeResponse, timeResponse, usernameResponse] =
          await Promise.all([
            fetch(`/api/charts/appointments-by-office?${params.toString()}`),
            fetch(`/api/charts/appointments-by-time?${params.toString()}`),
            fetch(`/api/charts/orders-by-username?${params.toString()}`),
          ]);

        if (!officeResponse.ok || !timeResponse.ok || !usernameResponse.ok) {
          throw new Error("Failed to fetch chart data");
        }

        const officeData = await officeResponse.json();
        const timeData = await timeResponse.json();
        const usernameData = await usernameResponse.json();

        setOfficeData(officeData);
        setTimeData(timeData);
        setUsernameData(usernameData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [startDate, endDate, singleDate, dateMode]);

  // Format time data for display
  const formattedTimeData = timeData.map((item) => ({
    ...item,
    hour: `${item.hour}:00`,
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Appointments by Office</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] lg:h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <ChartContainer
              config={{
                count: {
                  label: "Appointments",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={officeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="officeName"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar
                    dataKey="count"
                    name="Appointments"
                    fill="var(--color-count)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Appointments by Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] lg:h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <ChartContainer
              config={{
                count: {
                  label: "Appointments",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={formattedTimeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Appointments"
                    stroke="var(--color-count)"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Orders by Usernames</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] lg:h-80 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Order Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usernameData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    usernameData.map((item) => (
                      <TableRow key={item.username}>
                        <TableCell>{item.username}</TableCell>
                        <TableCell>{item.count}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
