import { type NextRequest, NextResponse } from "next/server";
import {
  getAppointmentsCount,
  getSuccessfulOrdersCount,
  getPaidOrdersCount,
  getFailedOrdersCount,
} from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const singleDateParam = searchParams.get("singleDate");
    const username = searchParams.get("username") || undefined;

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (singleDateParam) {
      // For single date, set start date to beginning of day and end date to end of day
      const singleDate = new Date(singleDateParam);
      singleDate.setDate(singleDate.getDate() + 1);
      startDate = new Date(singleDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(singleDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
    }

    const [
      appointmentsCount,
      successfulOrdersCount,
      paidOrdersCount,
      failedOrdersCount,
    ] = await Promise.all([
      getAppointmentsCount(startDate, endDate, username),
      getSuccessfulOrdersCount(startDate, endDate, username),
      getPaidOrdersCount(startDate, endDate, username),
      getFailedOrdersCount(startDate, endDate, username),
    ]);

    const failedAppointmentsCount = appointmentsCount - successfulOrdersCount;

    return NextResponse.json({
      appointmentsCount,
      successfulOrdersCount,
      failedAppointmentsCount,
      paidOrdersCount,
      failedOrdersCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
