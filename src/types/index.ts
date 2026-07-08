import { Timestamp } from "firebase/firestore";

export interface GameResult {
  gameName: string;
  gameCode: string;
  result: string;
  resultTime: string;
  status: "pending" | "declared";
  declaredAt: Timestamp | null;
}

export interface DailyResult {
  date: string;
  results: GameResult[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface ChartRecord {
  date: string;
  day: string;
  result: string;
  resultTime: string;
}

export interface ChartHistory {
  gameCode: string;
  gameName: string;
  month: number;
  year: number;
  monthYear: string;
  records: ChartRecord[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Admin {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "super_admin";
  permissions: string[];
  isActive: boolean;
  lastLogin: Timestamp;
  createdAt: Timestamp;
}

export interface UserSubscriber {
  fcmToken: string;
  deviceType: string;
  subscribedGames: string[];
  isSubscribed: boolean;
  subscribedAt: Timestamp;
  lastActive: Timestamp;
  userAgent: string;
}

export interface NotificationRecord {
  title: string;
  body: string;
  type: "result_update" | "announcement" | "promotion";
  targetAudience: "all" | "subscribed" | "specific_game";
  targetGame?: string;
  imageUrl?: string;
  clickAction?: string;
  sentAt: Timestamp;
  sentBy: string;
  recipientCount: number;
  status: "sent" | "failed" | "scheduled";
  scheduledFor?: Timestamp;
}

export interface Banner {
  id?: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: "top" | "middle" | "bottom" | "sidebar";
  displayOrder: number;
  isActive: boolean;
  startDate?: Timestamp;
  endDate?: Timestamp;
  createdAt: Timestamp;
  createdBy: string;
}

export interface Advertisement {
  id?: string;
  title: string;
  adType: "banner" | "popup" | "inline" | "sticky_footer";
  content: {
    imageUrl?: string;
    htmlCode?: string;
    text?: string;
  };
  placement: string;
  linkUrl?: string;
  impressions: number;
  clicks: number;
  isActive: boolean;
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
  createdBy: string;
}

export interface GameConfig {
  gameCode: string;
  gameName: string;
  resultTime: string;
  displayOrder: number;
  isActive: boolean;
}

export interface SiteConfig {
  siteName: string;
  siteTitle: string;
  metaDescription: string;
  whatsappNumber: string;
  contactEmail: string;
  telegramLink?: string;
  marqueeText: string;
  maintenanceMode: boolean;
  gamesList: GameConfig[];
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  seoKeywords: string[];
  footerText: string;
  updatedAt: Timestamp;
}

export interface ContactMessage {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  message: string;
  isRead: boolean;
  repliedAt?: Timestamp;
  createdAt: Timestamp;
}
