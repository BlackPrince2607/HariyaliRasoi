/** Format API time ("08:00:00" / "08:00") for display, e.g. "8:00 AM". */
export function formatStoreTime(value?: string | null): string {
  if (!value) return "";
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return value;
  let hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

export function formatStoreHours(
  opening?: string | null,
  closing?: string | null
): string {
  const open = formatStoreTime(opening);
  const close = formatStoreTime(closing);
  if (open && close) return `${open} – ${close}`;
  return open || close || "";
}

/** Normalize for `<input type="time">` (HH:MM). */
export function toTimeInputValue(value?: string | null): string {
  if (!value) return "";
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return "";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}
