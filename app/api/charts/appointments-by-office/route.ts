import { type NextRequest, NextResponse } from "next/server";
import { getAppointmentsByOffice } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const singleDateParam = searchParams.get("singleDate");

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

    const data = await getAppointmentsByOffice(startDate, endDate);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching appointments by office:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments by office" },
      { status: 500 }
    );
  }
}
