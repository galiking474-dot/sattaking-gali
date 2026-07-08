import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  startAfter,
  onSnapshot,
  serverTimestamp,
  DocumentSnapshot,
} from "firebase/firestore";
import { getDb } from "./firebase";
import {
  MOCK_DAILY_RESULTS,
  MOCK_TODAY,
  MOCK_CHARTS,
  MOCK_BANNERS,
  MOCK_ADS,
  MOCK_SITE_CONFIG,
  MOCK_CONTACTS,
  MOCK_NOTIFICATIONS,
} from "./mock-data";
import type {
  DailyResult,
  GameResult,
  ChartHistory,
  Banner,
  Advertisement,
  SiteConfig,
  ContactMessage,
  NotificationRecord,
} from "@/types";

// Use mock data when Firebase is not configured
const useMock = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

function db() {
  return getDb();
}

// ─── Daily Results ───

export async function getTodayResults(date: string) {
  if (useMock) {
    const found = MOCK_DAILY_RESULTS.find((r) => r.date === date);
    return found || MOCK_TODAY;
  }
  const docRef = doc(db(), "daily_results", date);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as DailyResult) : null;
}

export async function getRecentResults(pageSize = 7, lastDoc?: DocumentSnapshot) {
  if (useMock) {
    return {
      results: MOCK_DAILY_RESULTS.slice(0, pageSize),
      lastDoc: null,
      hasMore: false,
    };
  }
  let q = query(
    collection(db(), "daily_results"),
    orderBy("date", "desc"),
    limit(pageSize)
  );
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  const snapshot = await getDocs(q);
  return {
    results: snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as DailyResult & { id: string }
    ),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
}

export function subscribeToDailyResults(
  date: string,
  callback: (data: DailyResult | null) => void
) {
  if (useMock) {
    const found = MOCK_DAILY_RESULTS.find((r) => r.date === date);
    // Simulate async delivery
    setTimeout(() => callback(found || MOCK_TODAY), 100);
    return () => {}; // noop unsubscribe
  }
  const docRef = doc(db(), "daily_results", date);
  return onSnapshot(docRef, (snap) => {
    callback(snap.exists() ? (snap.data() as DailyResult) : null);
  });
}

export async function updateDailyResult(
  date: string,
  gameResult: GameResult,
  adminUid: string
) {
  if (useMock) {
    console.log("[MOCK] updateDailyResult", { date, gameResult, adminUid });
    return;
  }
  const docRef = doc(db(), "daily_results", date);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const existing = snap.data() as DailyResult;
    const idx = existing.results.findIndex(
      (r) => r.gameCode === gameResult.gameCode
    );
    const updatedResults = [...existing.results];
    if (idx >= 0) {
      updatedResults[idx] = gameResult;
    } else {
      updatedResults.push(gameResult);
    }
    await updateDoc(docRef, {
      results: updatedResults,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(docRef, {
      date,
      results: [gameResult],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: adminUid,
    });
  }
}

// ─── Chart History ───

export async function getChartData(
  gameCode: string,
  year: number,
  month: number
) {
  if (useMock) {
    const key = `${gameCode}_${year}-${String(month).padStart(2, "0")}`;
    return MOCK_CHARTS[key] || null;
  }
  const docId = `${gameCode}_${year}-${String(month).padStart(2, "0")}`;
  const docRef = doc(db(), "charts_history", docId);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as ChartHistory) : null;
}

export async function getAvailableChartMonths(gameCode: string) {
  if (useMock) {
    return Object.values(MOCK_CHARTS)
      .filter((c) => c.gameCode === gameCode)
      .map((c) => ({ year: c.year, month: c.month, monthYear: c.monthYear }));
  }
  const q = query(
    collection(db(), "charts_history"),
    where("gameCode", "==", gameCode),
    orderBy("year", "desc"),
    orderBy("month", "desc"),
    limit(24)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    year: d.data().year as number,
    month: d.data().month as number,
    monthYear: d.data().monthYear as string,
  }));
}

export async function saveChartData(
  chartData: Omit<ChartHistory, "createdAt" | "updatedAt">
) {
  if (useMock) {
    console.log("[MOCK] saveChartData", chartData);
    return;
  }
  const docId = `${chartData.gameCode}_${chartData.monthYear}`;
  const docRef = doc(db(), "charts_history", docId);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    await updateDoc(docRef, {
      records: chartData.records,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(docRef, {
      ...chartData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

// ─── Banners ───

export async function getActiveBanners(position?: string) {
  if (useMock) {
    return position
      ? MOCK_BANNERS.filter((b) => b.position === position)
      : MOCK_BANNERS;
  }
  let q = query(
    collection(db(), "banners"),
    where("isActive", "==", true),
    orderBy("displayOrder", "asc")
  );
  if (position) {
    q = query(
      collection(db(), "banners"),
      where("isActive", "==", true),
      where("position", "==", position),
      orderBy("displayOrder", "asc")
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Banner & { id: string }
  );
}

export async function getAllBanners() {
  if (useMock) return MOCK_BANNERS;
  const q = query(collection(db(), "banners"), orderBy("displayOrder", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Banner & { id: string }
  );
}

export async function saveBanner(banner: Omit<Banner, "createdAt">) {
  if (useMock) {
    console.log("[MOCK] saveBanner", banner);
    return banner.id || "mock-id";
  }
  if (banner.id) {
    const docRef = doc(db(), "banners", banner.id);
    const { id, ...data } = banner;
    await updateDoc(docRef, data);
    return id;
  } else {
    const { id, ...data } = banner;
    const docRef = await addDoc(collection(db(), "banners"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }
}

export async function deleteBanner(bannerId: string) {
  if (useMock) {
    console.log("[MOCK] deleteBanner", bannerId);
    return;
  }
  await deleteDoc(doc(db(), "banners", bannerId));
}

// ─── Advertisements ───

export async function getActiveAds(placement?: string) {
  if (useMock) {
    return placement
      ? MOCK_ADS.filter((a) => a.placement === placement)
      : MOCK_ADS;
  }
  let q = query(
    collection(db(), "advertisements"),
    where("isActive", "==", true)
  );
  if (placement) {
    q = query(q, where("placement", "==", placement));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Advertisement & { id: string }
  );
}

export async function getAllAds() {
  if (useMock) return MOCK_ADS;
  const snapshot = await getDocs(collection(db(), "advertisements"));
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Advertisement & { id: string }
  );
}

export async function saveAd(ad: Omit<Advertisement, "createdAt">) {
  if (useMock) {
    console.log("[MOCK] saveAd", ad);
    return ad.id || "mock-id";
  }
  if (ad.id) {
    const docRef = doc(db(), "advertisements", ad.id);
    const { id, ...data } = ad;
    await updateDoc(docRef, data);
    return id;
  } else {
    const { id, ...data } = ad;
    const docRef = await addDoc(collection(db(), "advertisements"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }
}

export async function deleteAd(adId: string) {
  if (useMock) {
    console.log("[MOCK] deleteAd", adId);
    return;
  }
  await deleteDoc(doc(db(), "advertisements", adId));
}

// ─── Site Config ───

export async function getSiteConfig() {
  if (useMock) return MOCK_SITE_CONFIG;
  const docRef = doc(db(), "site_config", "main");
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as SiteConfig) : null;
}

export async function updateSiteConfig(config: Partial<SiteConfig>) {
  if (useMock) {
    console.log("[MOCK] updateSiteConfig", config);
    return;
  }
  const docRef = doc(db(), "site_config", "main");
  await setDoc(
    docRef,
    { ...config, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// ─── Contact Messages ───

export async function submitContactMessage(
  msg: Omit<ContactMessage, "isRead" | "createdAt" | "id">
) {
  if (useMock) {
    console.log("[MOCK] submitContactMessage", msg);
    return;
  }
  await addDoc(collection(db(), "contact_messages"), {
    ...msg,
    isRead: false,
    createdAt: serverTimestamp(),
  });
}

export async function getContactMessages() {
  if (useMock) return MOCK_CONTACTS;
  const q = query(
    collection(db(), "contact_messages"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as ContactMessage & { id: string }
  );
}

export async function markMessageRead(msgId: string) {
  if (useMock) {
    console.log("[MOCK] markMessageRead", msgId);
    return;
  }
  await updateDoc(doc(db(), "contact_messages", msgId), { isRead: true });
}

// ─── Notifications ───

export async function getNotifications() {
  if (useMock) return MOCK_NOTIFICATIONS;
  const q = query(
    collection(db(), "notifications"),
    orderBy("sentAt", "desc"),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) =>
      ({ id: d.id, ...d.data() }) as NotificationRecord & { id: string }
  );
}

export async function saveNotification(
  notif: Omit<NotificationRecord, "sentAt">
) {
  if (useMock) {
    console.log("[MOCK] saveNotification", notif);
    return;
  }
  await addDoc(collection(db(), "notifications"), {
    ...notif,
    sentAt: serverTimestamp(),
  });
}
