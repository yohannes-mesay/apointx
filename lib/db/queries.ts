import { db, appointments, orders } from "./schema";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";

export async function getAppointmentsCount(startDate?: Date, endDate?: Date, username?: string) {
  let conditions = [];
  
  if (startDate && endDate) {
    conditions.push(gte(appointments.date, startDate));
    conditions.push(lte(appointments.date, endDate));
  }
  
  if (username) {
    conditions.push(eq(appointments.username, username));
  }
  
  const query = conditions.length > 0
    ? db
        .select({ count: count() })
        .from(appointments)
        .where(and(...conditions))
    : db.select({ count: count() }).from(appointments);

  const result = await query;
  return result[0].count;
}

export async function getSuccessfulOrdersCount(
  startDate?: Date,
  endDate?: Date,
  username?: string
) {
  let conditions = [];
  
  if (startDate && endDate) {
    conditions.push(gte(orders.date, startDate));
    conditions.push(lte(orders.date, endDate));
  }
  
  if (username) {
    conditions.push(eq(orders.username, username));
  }
  
  const query = conditions.length > 0
    ? db
        .select({ count: count() })
        .from(orders)
        .where(and(...conditions))
    : db.select({ count: count() }).from(orders);

  const result = await query;
  return result[0].count;
}

export async function getPaidOrdersCount(
  startDate?: Date,
  endDate?: Date,
  username?: string
) {
  let conditions = [eq(orders.paymentStatus, "Paid")];
  
  if (startDate && endDate) {
    conditions.push(gte(orders.date, startDate));
    conditions.push(lte(orders.date, endDate));
  }
  
  if (username) {
    conditions.push(eq(orders.username, username));
  }
  
  const query = db
    .select({ count: count() })
    .from(orders)
    .where(and(...conditions));

  const result = await query;
  return result[0].count;
}

export async function getFailedOrdersCount(
  startDate?: Date,
  endDate?: Date,
  username?: string
) {
  let conditions = [
    sql`${orders.paymentStatus} IN ('Pending', 'Timeout', 'Error')`
  ];
  
  if (startDate && endDate) {
    conditions.push(gte(orders.date, startDate));
    conditions.push(lte(orders.date, endDate));
  }
  
  if (username) {
    conditions.push(eq(orders.username, username));
  }
  
  const query = db
    .select({ count: count() })
    .from(orders)
    .where(and(...conditions));

  const result = await query;
  return result[0].count;
}

export async function getAppointmentsByOffice(
  startDate?: Date,
  endDate?: Date,
  username?: string
) {
  let conditions = [];
  
  if (startDate && endDate) {
    conditions.push(gte(appointments.date, startDate));
    conditions.push(lte(appointments.date, endDate));
  }
  
  if (username) {
    conditions.push(eq(appointments.username, username));
  }
  
  const query = conditions.length > 0
    ? db
        .select({
          officeName: appointments.officeName,
          count: count(),
        })
        .from(appointments)
        .where(and(...conditions))
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

export async function getAppointmentsByTime(
  startDate?: Date, 
  endDate?: Date,
  username?: string
) {
  let conditions = [];
  
  if (startDate && endDate) {
    conditions.push(gte(appointments.date, startDate));
    conditions.push(lte(appointments.date, endDate));
  }
  
  if (username) {
    conditions.push(eq(appointments.username, username));
  }
  
  const query = conditions.length > 0
    ? db
        .select({
          hour: sql`EXTRACT(HOUR FROM ${appointments.date})::integer`,
          count: count(),
        })
        .from(appointments)
        .where(and(...conditions))
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
  pageSize = 10,
  username?: string
) {
  let conditions = [];
  
  // Apply date filter if provided
  if (startDate && endDate) {
    console.log("startDate in getOrders", startDate);
    console.log("endDate in getOrders", endDate);
    conditions.push(gte(orders.date, startDate));
    conditions.push(lte(orders.date, endDate));
  }
  
  // Apply username filter if provided
  if (username) {
    conditions.push(eq(orders.username, username));
  }
  
  // Apply search filter if provided
  if (searchTerm) {
    // Use OR condition for search term
    conditions.push(
      sql`${orders.fullName} ILIKE ${"%" + searchTerm + "%"} OR ${
        orders.traceNumber
      } ILIKE ${"%" + searchTerm + "%"}`
    );
  }
  
  let query = db.select().from(orders);
  
  // Apply all conditions if any exist
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
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
  searchTerm?: string,
  username?: string
) {
  let conditions = [];
  
  // Apply date filter if provided
  if (startDate && endDate) {
    conditions.push(gte(orders.date, startDate));
    conditions.push(lte(orders.date, endDate));
  }
  
  // Apply username filter if provided
  if (username) {
    conditions.push(eq(orders.username, username));
  }
  
  // Apply search filter if provided
  if (searchTerm) {
    // Use OR condition for search term
    conditions.push(
      sql`${orders.fullName} ILIKE ${"%" + searchTerm + "%"} OR ${
        orders.traceNumber
      } ILIKE ${"%" + searchTerm + "%"}`
    );
  }
  
  let query = db.select({ count: count() }).from(orders);
  
  // Apply all conditions if any exist
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const result = await query;
  return result[0].count;
}

export async function getOrderCountsByUsername(
  startDate?: Date,
  endDate?: Date,
  filterUsername?: string
) {
  let conditions = [];
  
  if (startDate && endDate) {
    conditions.push(gte(orders.date, startDate));
    conditions.push(lte(orders.date, endDate));
  }
  
  if (filterUsername) {
    conditions.push(eq(orders.username, filterUsername));
  }
  
  const query = conditions.length > 0
    ? db
        .select({
          username: orders.username,
          count: count(),
        })
        .from(orders)
        .where(and(...conditions))
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
