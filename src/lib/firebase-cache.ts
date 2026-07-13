// import type { HomepageData, MonthlyChartData, GameChartData } from "./types";

// // ─── Firebase: Single Source of Truth ───
// // Cron writes here every minute, all API routes read from here
// // Shared across multiple websites via same Firebase project

// const COLLECTION = "scraped_cache";

// function isFirebaseConfigured(): boolean {
//   const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
//   return !!projectId && projectId !== "your_project_id" && !projectId.startsWith("your_");
// }

// async function getFirestoreDb() {
//   const { getDb } = await import("./firebase");
//   return getDb();
// }

// // ─── Homepage Data (LIVE/NEXT/REST) ───

// export async function saveHomepageToFirestore(data: HomepageData): Promise<void> {
//   if (!isFirebaseConfigured()) return;
//   try {
//     const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
//     const db = await getFirestoreDb();
//     const docRef = doc(db, COLLECTION, "homepage");
//     await setDoc(docRef, {
//       live: data.live,
//       next: data.next,
//       rest: data.rest,
//       scrapedAt: data.scrapedAt,
//       updatedAt: serverTimestamp(),
//     });
//   } catch (err) {
//     console.error("[firebase-cache] Failed to save homepage:", (err as Error).message);
//   }
// }

// export async function getHomepageFromFirestore(): Promise<HomepageData | null> {
//   if (!isFirebaseConfigured()) return null;
//   try {
//     const { doc, getDoc } = await import("firebase/firestore");
//     const db = await getFirestoreDb();
//     const docRef = doc(db, COLLECTION, "homepage");
//     const snap = await getDoc(docRef);
//     if (!snap.exists()) return null;
//     const d = snap.data();
//     return {
//       live: d.live || [],
//       next: d.next || [],
//       rest: d.rest || [],
//       scrapedAt: d.scrapedAt || 0,
//     };
//   } catch (err) {
//     console.error("[firebase-cache] Failed to read homepage:", (err as Error).message);
//     return null;
//   }
// }

// // ─── Monthly Chart Data ───

// export async function saveMonthlyChartToFirestore(
//   month: string,
//   year: string,
//   data: MonthlyChartData
// ): Promise<void> {
//   if (!isFirebaseConfigured()) return;
//   try {
//     const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
//     const db = await getFirestoreDb();
//     const docId = `chart_${month.toLowerCase()}_${year}`;
//     const docRef = doc(db, COLLECTION, docId);
//     await setDoc(docRef, {
//       ...data,
//       updatedAt: serverTimestamp(),
//     });
//   } catch (err) {
//     console.error("[firebase-cache] Failed to save chart:", (err as Error).message);
//   }
// }

// export async function getMonthlyChartFromFirestore(
//   month: string,
//   year: string
// ): Promise<MonthlyChartData | null> {
//   if (!isFirebaseConfigured()) return null;
//   try {
//     const { doc, getDoc } = await import("firebase/firestore");
//     const db = await getFirestoreDb();
//     const docId = `chart_${month.toLowerCase()}_${year}`;
//     const docRef = doc(db, COLLECTION, docId);
//     const snap = await getDoc(docRef);
//     if (!snap.exists()) return null;
//     const d = snap.data();
//     return {
//       month: d.month,
//       year: d.year,
//       results: d.results || [],
//       scrapedAt: d.scrapedAt || 0,
//     };
//   } catch (err) {
//     console.error("[firebase-cache] Failed to read chart:", (err as Error).message);
//     return null;
//   }
// }

// // ─── Game Chart Data (individual game monthly charts) ───

// export async function saveGameChartToFirestore(
//   slug: string,
//   month: string | undefined,
//   year: string | undefined,
//   data: GameChartData
// ): Promise<void> {
//   if (!isFirebaseConfigured()) return;
//   try {
//     const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
//     const db = await getFirestoreDb();
//     const docId = `game_${slug}_${(month || "current").toLowerCase()}_${year || "current"}`;
//     const docRef = doc(db, COLLECTION, docId);
//     await setDoc(docRef, {
//       ...data,
//       updatedAt: serverTimestamp(),
//     });
//   } catch (err) {
//     console.error("[firebase-cache] Failed to save game chart:", (err as Error).message);
//   }
// }

// export async function getGameChartFromFirestore(
//   slug: string,
//   month: string | undefined,
//   year: string | undefined
// ): Promise<GameChartData | null> {
//   if (!isFirebaseConfigured()) return null;
//   try {
//     const { doc, getDoc } = await import("firebase/firestore");
//     const db = await getFirestoreDb();
//     const docId = `game_${slug}_${(month || "current").toLowerCase()}_${year || "current"}`;
//     const docRef = doc(db, COLLECTION, docId);
//     const snap = await getDoc(docRef);
//     if (!snap.exists()) return null;
//     const d = snap.data();
//     return {
//       gameName: d.gameName,
//       chartTitle: d.chartTitle,
//       month: d.month,
//       year: d.year,
//       columns: d.columns || [],
//       results: d.results || [],
//       scrapedAt: d.scrapedAt || 0,
//     };
//   } catch (err) {
//     console.error("[firebase-cache] Failed to read game chart:", (err as Error).message);
//     return null;
//   }
// }
import type {
  HomepageData,
  MonthlyChartData,
  GameChartData,
  SK24GamesData,
  SK24ChartsData,
  ResultSattaData,
} from "./types";

import { adminDb } from "./firebase-admin";

const COLLECTION = "scraped_cache";

// ─── First-section live-board data (scraped from satta29.com) ───
// Stored in its OWN document so it never clobbers the other site's `homepage`
// doc that shares this Firebase project.
const RESULTSATTA_DOC = "satta29_homepage";

export async function saveResultSattaToFirestore(
  data: ResultSattaData
): Promise<void> {
  try {
    await adminDb.collection(COLLECTION).doc(RESULTSATTA_DOC).set({
      games: data.games,
      scrapedAt: data.scrapedAt,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error(
      "[firebase-cache] Failed to save resultsatta:",
      (err as Error).message
    );
  }
}

export async function getResultSattaFromFirestore(): Promise<ResultSattaData | null> {
  try {
    const snap = await adminDb
      .collection(COLLECTION)
      .doc(RESULTSATTA_DOC)
      .get();

    if (!snap.exists) return null;

    const d = snap.data();

    return {
      games: d?.games || [],
      scrapedAt: d?.scrapedAt || 0,
    };
  } catch (err) {
    console.error(
      "[firebase-cache] Failed to read resultsatta:",
      (err as Error).message
    );
    return null;
  }
}

// ─── Homepage Data ───

export async function saveHomepageToFirestore(
  data: HomepageData
): Promise<void> {
  try {
    await adminDb.collection(COLLECTION).doc("homepage").set({
      live: data.live,
      next: data.next,
      rest: data.rest,
      scrapedAt: data.scrapedAt,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error(
      "[firebase-cache] Failed to save homepage:",
      (err as Error).message
    );
  }
}

export async function getHomepageFromFirestore(): Promise<HomepageData | null> {
  try {
    const snap = await adminDb
      .collection(COLLECTION)
      .doc("homepage")
      .get();

    if (!snap.exists) return null;

    const d = snap.data();

    return {
      live: d?.live || [],
      next: d?.next || [],
      rest: d?.rest || [],
      scrapedAt: d?.scrapedAt || 0,
    };
  } catch (err) {
    console.error(
      "[firebase-cache] Failed to read homepage:",
      (err as Error).message
    );
    return null;
  }
}

// ─── Monthly Chart Data ───

export async function saveMonthlyChartToFirestore(
  month: string,
  year: string,
  data: MonthlyChartData
): Promise<void> {
  try {
    const docId = `chart_${month.toLowerCase()}_${year}`;

    await adminDb.collection(COLLECTION).doc(docId).set({
      ...data,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error(
      "[firebase-cache] Failed to save chart:",
      (err as Error).message
    );
  }
}

export async function getMonthlyChartFromFirestore(
  month: string,
  year: string
): Promise<MonthlyChartData | null> {
  try {
    const docId = `chart_${month.toLowerCase()}_${year}`;

    const snap = await adminDb
      .collection(COLLECTION)
      .doc(docId)
      .get();

    if (!snap.exists) return null;

    const d = snap.data();

    return {
      month: d?.month,
      year: d?.year,
      results: d?.results || [],
      scrapedAt: d?.scrapedAt || 0,
    };
  } catch (err) {
    console.error(
      "[firebase-cache] Failed to read chart:",
      (err as Error).message
    );
    return null;
  }
}

// ─── Game Chart Data ───

export async function saveGameChartToFirestore(
  slug: string,
  month: string | undefined,
  year: string | undefined,
  data: GameChartData
): Promise<void> {
  try {
    const docId = `game_${slug}_${(month || "current").toLowerCase()}_${year || "current"}`;

    await adminDb.collection(COLLECTION).doc(docId).set({
      ...data,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error(
      "[firebase-cache] Failed to save game chart:",
      (err as Error).message
    );
  }
}

export async function getGameChartFromFirestore(
  slug: string,
  month: string | undefined,
  year: string | undefined
): Promise<GameChartData | null> {
  try {
    const docId = `game_${slug}_${(month || "current").toLowerCase()}_${year || "current"}`;

    const snap = await adminDb
      .collection(COLLECTION)
      .doc(docId)
      .get();

    if (!snap.exists) return null;

    const d = snap.data();

    return {
      gameName: d?.gameName,
      chartTitle: d?.chartTitle,
      month: d?.month,
      year: d?.year,
      columns: d?.columns || [],
      results: d?.results || [],
      scrapedAt: d?.scrapedAt || 0,
    };
  } catch (err) {
    console.error(
      "[firebase-cache] Failed to read game chart:",
      (err as Error).message
    );
    return null;
  }
}

// ─── SK24 Games Data ───

export async function saveSK24GamesToFirestore(
  data: SK24GamesData
): Promise<void> {
  try {
    await adminDb.collection(COLLECTION).doc("sk24_games").set({
      games: data.games,
      spotlight: data.spotlight || null,
      scrapedAt: data.scrapedAt,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error(
      "[firebase-cache] Failed to save SK24 games:",
      (err as Error).message
    );
  }
}

export async function getSK24GamesFromFirestore(): Promise<SK24GamesData | null> {
  try {
    const snap = await adminDb
      .collection(COLLECTION)
      .doc("sk24_games")
      .get();

    if (!snap.exists) return null;

    const d = snap.data();

    return {
      games: d?.games || [],
      spotlight: d?.spotlight || undefined,
      scrapedAt: d?.scrapedAt || 0,
    };
  } catch (err) {
    console.error(
      "[firebase-cache] Failed to read SK24 games:",
      (err as Error).message
    );
    return null;
  }
}

// ─── SK24 Charts Data ───

export async function saveSK24ChartsToFirestore(
  data: SK24ChartsData
): Promise<void> {
  try {
    await adminDb.collection(COLLECTION).doc("sk24_charts").set({
      tables: data.tables,
      scrapedAt: data.scrapedAt,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error(
      "[firebase-cache] Failed to save SK24 charts:",
      (err as Error).message
    );
  }
}

export async function getSK24ChartsFromFirestore(): Promise<SK24ChartsData | null> {
  try {
    const snap = await adminDb
      .collection(COLLECTION)
      .doc("sk24_charts")
      .get();

    if (!snap.exists) return null;

    const d = snap.data();

    return {
      tables: d?.tables || [],
      scrapedAt: d?.scrapedAt || 0,
    };
  } catch (err) {
    console.error(
      "[firebase-cache] Failed to read SK24 charts:",
      (err as Error).message
    );
    return null;
  }
}