import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Use a placeholder at build time so neon() doesn't throw during static page generation.
// No actual connection is made until a query executes at runtime.
const sql = neon(process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost/placeholder");
export const db = drizzle(sql, { schema });
