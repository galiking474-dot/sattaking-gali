import { Timestamp } from "firebase/firestore";
import type {
  DailyResult,
  GameResult,
  ChartHistory,
  ChartRecord,
  Banner,
  Advertisement,
  SiteConfig,
  ContactMessage,
  NotificationRecord,
} from "@/types";

const now = () => Timestamp.fromDate(new Date());

function randomResult(): string {
  return String(Math.floor(Math.random() * 100)).padStart(2, "0");
}

function getDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function getDayName(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" });
}

// ─── Daily Results (last 15 days) ───

const GAMES: { gameName: string; gameCode: string; resultTime: string }[] = [
  { gameName: "DESAWAR", gameCode: "desawar", resultTime: "05:00 AM" },
  { gameName: "GALI", gameCode: "gali", resultTime: "11:30 PM" },
  { gameName: "GHAZIABAD", gameCode: "ghaziabad", resultTime: "08:30 PM" },
  { gameName: "FARIDABAD", gameCode: "faridabad", resultTime: "09:30 PM" },
];

function buildDayResults(daysAgo: number): DailyResult & { id: string } {
  const date = getDateStr(daysAgo);
  const isToday = daysAgo === 0;

  const results: GameResult[] = GAMES.map((g, idx) => {
    // Today: first 2 games declared, rest pending
    const declared = isToday ? idx < 2 : true;
    return {
      gameName: g.gameName,
      gameCode: g.gameCode,
      result: declared ? randomResult() : "",
      resultTime: g.resultTime,
      status: declared ? "declared" : "pending",
      declaredAt: declared ? now() : null,
    };
  });

  return {
    id: date,
    date,
    results,
    createdAt: now(),
    updatedAt: now(),
    createdBy: "mock-admin",
  };
}

export const MOCK_DAILY_RESULTS: (DailyResult & { id: string })[] = Array.from(
  { length: 15 },
  (_, i) => buildDayResults(i)
);

export const MOCK_TODAY = MOCK_DAILY_RESULTS[0];

// ─── Chart History ───

function buildChart(gameCode: string, gameName: string, year: number, month: number): ChartHistory {
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const records: ChartRecord[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    if (d > today) break;
    const dateStr = d.toISOString().split("T")[0];
    records.push({
      date: dateStr,
      day: getDayName(dateStr),
      result: randomResult(),
      resultTime: GAMES.find((g) => g.gameCode === gameCode)?.resultTime || "11:30 PM",
    });
  }

  return {
    gameCode,
    gameName,
    month,
    year,
    monthYear: `${year}-${String(month).padStart(2, "0")}`,
    records,
    createdAt: now(),
    updatedAt: now(),
  };
}

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export const MOCK_CHARTS: Record<string, ChartHistory> = {};
for (const game of GAMES) {
  // Current month
  const key1 = `${game.gameCode}_${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  MOCK_CHARTS[key1] = buildChart(game.gameCode, game.gameName, currentYear, currentMonth);

  // Previous month
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const key2 = `${game.gameCode}_${prevYear}-${String(prevMonth).padStart(2, "0")}`;
  MOCK_CHARTS[key2] = buildChart(game.gameCode, game.gameName, prevYear, prevMonth);
}

// ─── Banners ───

export const MOCK_BANNERS: (Banner & { id: string })[] = [
  {
    id: "banner-1",
    title: "Welcome Banner",
    imageUrl: "https://placehold.co/1200x200/1e3a5f/ffffff?text=SATTA+RESULT+-+Your+Trusted+Source",
    linkUrl: "/",
    position: "top",
    displayOrder: 1,
    isActive: true,
    createdAt: now(),
    createdBy: "mock-admin",
  },
  {
    id: "banner-2",
    title: "Chart Records Banner",
    imageUrl: "https://placehold.co/1200x200/f59e0b/000000?text=View+Chart+Records+Now!",
    linkUrl: "/charts",
    position: "middle",
    displayOrder: 1,
    isActive: true,
    createdAt: now(),
    createdBy: "mock-admin",
  },
];

// ─── Advertisements ───

export const MOCK_ADS: (Advertisement & { id: string })[] = [
  {
    id: "ad-1",
    title: "Top Ad",
    adType: "banner",
    content: {
      imageUrl: "https://placehold.co/728x90/4f46e5/ffffff?text=Advertisement+Space",
    },
    placement: "homepage_top",
    linkUrl: "#",
    impressions: 12450,
    clicks: 342,
    isActive: true,
    startDate: now(),
    endDate: Timestamp.fromDate(new Date(Date.now() + 30 * 86400000)),
    createdAt: now(),
    createdBy: "mock-admin",
  },
  {
    id: "ad-2",
    title: "Middle Ad",
    adType: "inline",
    content: {
      imageUrl: "https://placehold.co/728x90/059669/ffffff?text=Your+Ad+Here",
    },
    placement: "homepage_middle",
    linkUrl: "#",
    impressions: 8320,
    clicks: 215,
    isActive: true,
    startDate: now(),
    endDate: Timestamp.fromDate(new Date(Date.now() + 30 * 86400000)),
    createdAt: now(),
    createdBy: "mock-admin",
  },
  {
    id: "ad-3",
    title: "Bottom Ad",
    adType: "banner",
    content: {
      text: "Advertise with us! Contact via WhatsApp for ad placement.",
    },
    placement: "homepage_bottom",
    linkUrl: "#",
    impressions: 5610,
    clicks: 98,
    isActive: true,
    startDate: now(),
    endDate: Timestamp.fromDate(new Date(Date.now() + 30 * 86400000)),
    createdAt: now(),
    createdBy: "mock-admin",
  },
];

// ─── Site Config ───

export const MOCK_SITE_CONFIG: SiteConfig = {
  siteName: "Satta Result",
  siteTitle: "Satta Result - Live Daily Results & Chart Records",
  metaDescription: "View live daily results for Gali, Desawar, Ghaziabad, Faridabad.",
  whatsappNumber: "911234567890",
  contactEmail: "support@sattaresult.com",
  telegramLink: "https://t.me/sattaresult",
  marqueeText:
    "Welcome to Satta Result! Your trusted source for live daily results. Check Gali, Desawar, Ghaziabad, Faridabad results here!",
  maintenanceMode: false,
  gamesList: GAMES.map((g, i) => ({ ...g, displayOrder: i + 1, isActive: true })),
  socialLinks: {
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
  },
  seoKeywords: ["satta result", "gali result", "desawar result", "chart records"],
  footerText: "This website is for informational purposes only.",
  updatedAt: now(),
};

// ─── Contact Messages ───

export const MOCK_CONTACTS: (ContactMessage & { id: string })[] = [
  {
    id: "msg-1",
    name: "Rahul Kumar",
    phone: "9876543210",
    email: "rahul@example.com",
    message: "When will today's Gali result be declared?",
    isRead: false,
    createdAt: now(),
  },
  {
    id: "msg-2",
    name: "Priya Sharma",
    email: "priya@example.com",
    message: "I am not receiving push notifications. Please help.",
    isRead: false,
    createdAt: now(),
  },
  {
    id: "msg-3",
    name: "Amit Singh",
    phone: "9123456789",
    message: "Great website! Very fast results. Thank you.",
    isRead: true,
    createdAt: now(),
  },
];

// ─── Notifications ───

export const MOCK_NOTIFICATIONS: (NotificationRecord & { id: string })[] = [
  {
    id: "notif-1",
    title: "DESAWAR Result Declared!",
    body: "DESAWAR result for today: 45",
    type: "result_update",
    targetAudience: "specific_game",
    targetGame: "desawar",
    sentAt: now(),
    sentBy: "system",
    recipientCount: 1250,
    status: "sent",
  },
  {
    id: "notif-2",
    title: "Welcome to Satta Result!",
    body: "Subscribe to get instant result notifications.",
    type: "announcement",
    targetAudience: "all",
    sentAt: now(),
    sentBy: "mock-admin",
    recipientCount: 3400,
    status: "sent",
  },
  {
    id: "notif-3",
    title: "GALI Result Declared!",
    body: "GALI result for yesterday: 78",
    type: "result_update",
    targetAudience: "specific_game",
    targetGame: "gali",
    sentAt: now(),
    sentBy: "system",
    recipientCount: 980,
    status: "sent",
  },
];
