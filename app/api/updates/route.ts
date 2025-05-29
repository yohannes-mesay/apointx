import { type NextRequest, NextResponse } from "next/server";
import { db, appointments, orders } from "@/lib/db/schema";
import { count, sql } from "drizzle-orm";

// keep track of last counts to detect changes
let lastAppointmentsCount = 0;
let lastOrdersCount = 0;

export async function GET(request: NextRequest) {
  try {
    // 1) detect updates to appointments/orders counts
    const [appointmentsResult, ordersResult] = await Promise.all([
      db.select({ count: count() }).from(appointments),
      db.select({ count: count() }).from(orders),
    ]);
    const currentAppointmentsCount = appointmentsResult[0].count;
    const currentOrdersCount = ordersResult[0].count;

    const hasUpdates =
      currentAppointmentsCount !== lastAppointmentsCount ||
      currentOrdersCount !== lastOrdersCount;

    lastAppointmentsCount = currentAppointmentsCount;
    lastOrdersCount = currentOrdersCount;

    // 2) if there are updates, grab the latest rows
    let latestAppointment = null;
    let latestOrder = null;
    if (hasUpdates) {
      const [apptRow] = await db
        .select()
        .from(appointments)
        .orderBy(sql`${appointments.id} DESC`)
        .limit(1);
      const [orderRow] = await db
        .select()
        .from(orders)
        .orderBy(sql`${orders.id} DESC`)
        .limit(1);

      latestAppointment = apptRow ?? null;
      latestOrder = orderRow ?? null;
    }

    // 3) expire any stale pending orders
    await expireStaleOrders();

    return NextResponse.json({
      hasUpdates,
      appointmentsCount: currentAppointmentsCount,
      ordersCount: currentOrdersCount,
      latestAppointment,
      latestOrder,
    });
  } catch (error) {
    console.error("Error checking for updates or expiring orders:", error);
    return NextResponse.json(
      { error: "Failed to check for updates" },
      { status: 500 }
    );
  }
}

/**
 * Finds all orders still marked "Pending" from >3 hours ago,
 * calls the external API to re-check their status with the correct Origin header,
 * and if still unpaid updates them to "EXPIRED".
 */
async function expireStaleOrders() {
  const threshold = sql`NOW() - INTERVAL '30 minutes'`;

  const staleOrders = await db
    .select({
      id: orders.id,
      traceNumber: orders.traceNumber,
      date: orders.date,
    })
    .from(orders)
    .where(
      sql`
      ${orders.paymentStatus} = 'Pending'
      AND (${orders.date} AT TIME ZONE 'Africa/Addis_Ababa') < ${threshold}
    `
    );

  console.log("checking every 1 hour", staleOrders);
  const [{ cutoff }] = await db
    .select({ cutoff: threshold })
    .from(sql`(SELECT 1) AS dummy`);
  // console.log("Cutoff timestamp:", cutoff);
  // console.log("treshold", threshold);
  if (staleOrders.length === 0) return;

  await Promise.all(
    staleOrders.map(async ({ id, traceNumber }) => {
      try {
        const url = `https://ethiopianpassportapi.ethiopianairlines.com/Request/api/V1.0/Request/GetRequestsByApplicationNumber?applicationNumber=${encodeURIComponent(
          traceNumber
        )}`;

        const res = await fetch(url, {
          headers: {
            Origin: "https://www.ethiopianpassportservices.gov.et",
          },
        });
        const data = await res.json();
        if (data?.message?.startsWith("Data not Found")) {
          console.warn(`API call failed for ${traceNumber}:`, res.status);
          await db
            .update(orders)
            .set({ paymentStatus: "Error" })
            .where(sql`${orders.id} = ${id}`);
          return;
        }

        if (data?.serviceRequest?.requestStatus == "Payment Completed") {
          await db
            .update(orders)
            .set({ paymentStatus: "Paid" })
            .where(sql`${orders.id} = ${id}`);
        }
      } catch (err) {
        console.error(`Error checking status for ${traceNumber}:`, err);
      }
    })
  );
}
