// Where to go after signing in. `next` comes from our own links; `callbackUrl`
// is what the auth middleware appends when it bounces a signed-out visitor off
// a protected page (e.g. the daily-card email's link), and it is an absolute
// URL. Reading only `next` sent every one of those to /today instead of where
// they were going. Keep only the path, so nothing can redirect off-site.
export function safeCallbackUrl(next: string | undefined, callbackUrl: string | undefined): string {
  for (const candidate of [next, callbackUrl]) {
    if (!candidate) continue;
    if (candidate.startsWith("/") && !candidate.startsWith("//")) return candidate;
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" || url.protocol === "http:") {
        const path = url.pathname + url.search;
        if (path.startsWith("/") && !path.startsWith("//") && path !== "/login") return path;
      }
    } catch {
      // not a URL — ignore
    }
  }
  return "/today";
}
