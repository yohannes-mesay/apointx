import { type NextRequest, NextResponse } from "next/server";
import { db, orders } from "@/lib/db/schema";
import { count, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get all unique usernames with their order counts
    const usernameQuery = db
      .select({
        username: orders.username,
        count: count(),
      })
      .from(orders)
      .where(sql`${orders.username} IS NOT NULL`)
      .groupBy(orders.username)
      .orderBy(sql`count DESC`);

    const usernames = await usernameQuery;

    return NextResponse.json(usernames);
  } catch (error) {
    console.error("Error fetching usernames:", error);
    return NextResponse.json(
      { error: "Failed to fetch usernames" },
      { status: 500 }
    );
  }
}
