import { db, appointments, orders } from "./schema";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";

export async function getAppointmentsCount(startDate?: Date, endDate?: Date) {
  const query =
    startDate && endDate
      ? db
          .select({ count: count() })
          .from(appointments)
          .where(
            and(
              gte(appointments.date, startDate),
              lte(appointments.date, endDate)
            )
          )
      : db.select({ count: count() }).from(appointments);

  const result = await query;
  return result[0].count;
}

export async function getSuccessfulOrdersCount(
  startDate?: Date,
  endDate?: Date
) {
  const query =
    startDate && endDate
      ? db
          .select({ count: count() })
          .from(orders)
          .where(and(gte(orders.date, startDate), lte(orders.date, endDate)))
      : db.select({ count: count() }).from(orders);

  const result = await query;
  return result[0].count;
}

export async function getPaidOrdersCount(startDate?: Date, endDate?: Date) {
  const query =
    startDate && endDate
      ? db
          .select({ count: count() })
          .from(orders)
          .where(
            and(
              eq(orders.paymentStatus, "Paid"),
              gte(orders.date, startDate),
              lte(orders.date, endDate)
            )
          )
      : db
          .select({ count: count() })
          .from(orders)
          .where(eq(orders.paymentStatus, "Paid"));

  const result = await query;
  return result[0].count;
}

export async function getFailedOrdersCount(startDate?: Date, endDate?: Date) {
  const query =
    startDate && endDate
      ? db
          .select({ count: count() })
          .from(orders)
          .where(
            and(
              sql`${orders.paymentStatus} IN ('Pending', 'Timeout', 'Error')`,
              gte(orders.date, startDate),
              lte(orders.date, endDate)
            )
          )
      : db
          .select({ count: count() })
          .from(orders)
          .where(
            sql`${orders.paymentStatus} IN ('Pending', 'Timeout', 'Error')`
          );

  const result = await query;
  return result[0].count;
}

export async function getAppointmentsByOffice(
  startDate?: Date,
  endDate?: Date
) {
  const query =
    startDate && endDate
      ? db
          .select({
            officeName: appointments.officeName,
            count: count(),
          })
          .from(appointments)
          .where(
            and(
              gte(appointments.date, startDate),
              lte(appointments.date, endDate)
            )
          )
          .groupBy(appointments.officeName)
      : db
          .select({
            officeName: appointments.officeName,
            count: count(),
          })
          .from(appointments)
          .groupBy(appointments.officeName);

  return query;
}

export async function getAppointmentsByTime(startDate?: Date, endDate?: Date) {
  const query =
    startDate && endDate
      ? db
          .select({
            hour: sql`EXTRACT(HOUR FROM ${appointments.date})::integer`,
            count: count(),
          })
          .from(appointments)
          .where(
            and(
              gte(appointments.date, startDate),
              lte(appointments.date, endDate)
            )
          )
          .groupBy(sql`EXTRACT(HOUR FROM ${appointments.date})`)
          .orderBy(sql`EXTRACT(HOUR FROM ${appointments.date})`)
      : db
          .select({
            hour: sql`EXTRACT(HOUR FROM ${appointments.date})::integer`,
            count: count(),
          })
          .from(appointments)
          .groupBy(sql`EXTRACT(HOUR FROM ${appointments.date})`)
          .orderBy(sql`EXTRACT(HOUR FROM ${appointments.date})`);

  return query;
}

export async function getOrders(
  startDate?: Date,
  endDate?: Date,
  searchTerm?: string,
  page = 1,
  pageSize = 10
) {
  let query = db.select().from(orders);

  // Apply date filter if provided
  if (startDate && endDate) {
    console.log("startDate in getOrders", startDate);
    console.log("endDate in getOrders", endDate);
    query = query.where(
      and(gte(orders.date, startDate), lte(orders.date, endDate))
    );
  }

  // Apply search filter if provided
  if (searchTerm) {
    query = query.where(
      sql`${orders.fullName} ILIKE ${"%" + searchTerm + "%"} OR ${
        orders.traceNumber
      } ILIKE ${"%" + searchTerm + "%"}`
    );
  }

  // Apply pagination
  query = query.limit(pageSize).offset((page - 1) * pageSize);

  // Order by date descending
  query = query.orderBy(sql`${orders.date} DESC`);

  return query;
}

export async function getOrdersCount(
  startDate?: Date,
  endDate?: Date,
  searchTerm?: string
) {
  let query = db.select({ count: count() }).from(orders);

  // Apply date filter if provided
  if (startDate && endDate) {
    query = query.where(
      and(gte(orders.date, startDate), lte(orders.date, endDate))
    );
  }

  // Apply search filter if provided
  if (searchTerm) {
    query = query.where(
      sql`${orders.fullName} ILIKE ${"%" + searchTerm + "%"} OR ${
        orders.traceNumber
      } ILIKE ${"%" + searchTerm + "%"}`
    );
  }

  const result = await query;
  return result[0].count;
}

export async function getOrderCountsByUsername(
  startDate?: Date,
  endDate?: Date
) {
  const query =
    startDate && endDate
      ? db
          .select({
            username: orders.username,
            count: count(),
          })
          .from(orders)
          .where(and(gte(orders.date, startDate), lte(orders.date, endDate)))
          .groupBy(orders.username)
          .orderBy(sql`count DESC`)
      : db
          .select({
            username: orders.username,
            count: count(),
          })
          .from(orders)
          .groupBy(orders.username)
          .orderBy(sql`count DESC`);

  return query;
}
