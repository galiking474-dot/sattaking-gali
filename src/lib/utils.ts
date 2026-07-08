import { format } from "date-fns";

export function getTodayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return format(d, "dd MMM yyyy");
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return format(d, "dd MMM");
}

export function getWhatsAppLink(phoneNumber: string, message?: string): string {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
  const encodedMessage = message
    ? `?text=${encodeURIComponent(message)}`
    : "";
  return `https://wa.me/${cleanNumber}${encodedMessage}`;
}

export function getMonthName(month: number): string {
  return new Date(2000, month - 1).toLocaleString("en", { month: "long" });
}

// Parse a "hh:mm AM/PM" clock string into minutes-since-midnight (0–1439).
// Returns null if the string can't be parsed.
export function parseClockTime(timeStr: string): number | null {
  const m = timeStr?.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let hours = Number(m[1]);
  const minutes = Number(m[2]);
  const meridiem = m[3].toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Current minutes-since-midnight in IST (Asia/Kolkata), regardless of server TZ.
export function getISTMinutesOfDay(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(now);
  const hours = Number(parts.find((p) => p.type === "hour")?.value) % 24;
  const minutes = Number(parts.find((p) => p.type === "minute")?.value);
  return hours * 60 + minutes;
}

// A game's "today" result is only real once its declared time has passed in IST.
// Before that (e.g. just after midnight) the scraped value is yesterday's leftover,
// so it must be treated as not-yet-declared. Fails open (shows) if the time is
// missing/unparseable — we'd rather show a real result than wrongly hide one.
export function isTodayResultDeclared(
  gameTime: string,
  now: Date = new Date()
): boolean {
  const declaredAt = parseClockTime(gameTime);
  if (declaredAt === null) return true;
  return getISTMinutesOfDay(now) >= declaredAt;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const DEFAULT_GAMES = [
  { gameCode: "desawar", gameName: "DESAWAR", resultTime: "05:00 AM", displayOrder: 1, isActive: true },
  { gameCode: "faridabad", gameName: "FARIDABAD", resultTime: "06:00 PM", displayOrder: 2, isActive: true },
  { gameCode: "ghaziabad", gameName: "GHAZIABAD", resultTime: "09:25 PM", displayOrder: 3, isActive: true },
  { gameCode: "gali", gameName: "GALI", resultTime: "11:25 PM", displayOrder: 4, isActive: true },
];
