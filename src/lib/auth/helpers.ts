import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export function isAdmin(user: { role?: string }) {
  return user.role === "admin";
}

export function isTesterOrAdmin(user: { role?: string }) {
  return user.role === "tester" || user.role === "admin";
}

/** Require admin or tester role — for accessing the admin panel (read-only for testers). */
export async function requireAdminPanel() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!isTesterOrAdmin(user)) {
    redirect("/home");
  }
  return user;
}

/** Require admin role only — for write operations (editing prompts, etc.). */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!isAdmin(user)) {
    redirect("/home");
  }
  return user;
}

/** API route guard: require tester or admin. Returns user or 403 Response. */
export async function requireTesterApi() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }) };
  }
  if (!isTesterOrAdmin(user)) {
    return { user: null, error: new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }) };
  }
  return { user, error: null };
}

/** API route guard: require admin only. Returns user or 403 Response. */
export async function requireAdminApi() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }) };
  }
  if (!isAdmin(user)) {
    return { user: null, error: new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }) };
  }
  return { user, error: null };
}
