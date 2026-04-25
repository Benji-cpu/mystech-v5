// Every route in the app renders with the Editorial Daylight palette.
// This helper remains for call sites that historically gated on it — all
// routes now return true, so nav chrome always adopts the paper palette.
export function isDaylightRoute(_pathname: string): boolean {
  return true;
}
