import { pgTable, serial, text, timestamp, bigint } from "drizzle-orm/pg-core"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

// Define the schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  officeName: text("office_name"),
  appointmentId: bigint("appointment_id", { mode: "number" }),
  date: timestamp("date").defaultNow(),
  username: text("username"),
})

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  officeName: text("office_name"),
  traceNumber: text("trace_number").unique(),
  date: timestamp("date").defaultNow(),
  paymentStatus: text("payment_status").default("Pending"),
  username: text("username"),
})

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Create a Drizzle client
export const db = drizzle(pool)

// Types
export type Appointment = typeof appointments.$inferSelect
export type Order = typeof orders.$inferSelect
