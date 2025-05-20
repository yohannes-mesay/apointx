import { type NextRequest, NextResponse } from "next/server";
import { getOrders, getOrdersCount } from "@/lib/db/queries";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const singleDateParam = searchParams.get("singleDate");
    const searchTerm = searchParams.get("search") || undefined;
    const page = Number.parseInt(searchParams.get("page") || "1");
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10");

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

    const [orders, totalCount] = await Promise.all([
      getOrders(startDate, endDate, searchTerm, page, pageSize),
      getOrdersCount(startDate, endDate, searchTerm),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
