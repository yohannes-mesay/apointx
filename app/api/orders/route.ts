import { type NextRequest, NextResponse } from "next/server";
import { getOrders, getOrdersCount } from "@/lib/db/queries";

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
      const singleDate = new Date(singleDateParam);
      console.log("singleDate", singleDate);
      startDate = new Date(singleDate);
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(0, 0, 0, 0);
      console.log("startDate", startDate);
      endDate = new Date(singleDate);
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(23, 59, 59, 999);
      console.log("endDate", endDate);
    } else if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      console.log("startDate param", startDate);
      endDate = new Date(endDateParam);
      console.log("endDate param", endDate);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
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
