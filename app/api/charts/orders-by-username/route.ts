import { type NextRequest, NextResponse } from "next/server";
import { getOrderCountsByUsername } from "@/lib/db/queries";
import { startOfDay, endOfDay, parseISO } from "date-fns";

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
      const singleDate = parseISO(singleDateParam);
      startDate = startOfDay(singleDate);
      endDate = endOfDay(singleDate);
    } else if (startDateParam && endDateParam) {
      startDate = startOfDay(parseISO(startDateParam));
      endDate = endOfDay(parseISO(endDateParam));
    }

    const data = await getOrderCountsByUsername(startDate, endDate);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching orders by username:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders by username" },
      { status: 500 }
    );
  }
}
