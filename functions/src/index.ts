import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// ─── Types ───

interface GameResult {
  gameName: string;
  gameCode: string;
  result: string;
  resultTime: string;
  status: "pending" | "declared";
  declaredAt: admin.firestore.Timestamp | null;
}

interface ChartRecord {
  date: string;
  day: string;
  result: string;
  resultTime: string;
}

// ─── Result Update Trigger ───
// Fires when a daily_results document is created/updated.
// Syncs declared results to charts_history and sends push notifications.

export const onResultUpdate = functions.firestore
  .document("daily_results/{date}")
  .onWrite(async (change, context) => {
    const date = context.params.date;
    const newData = change.after.data();
    if (!newData) return;

    const oldData = change.before.data();

    // Find newly declared results
    const newlyDeclared = (newData.results as GameResult[]).filter((r) => {
      if (r.status !== "declared") return false;
      if (!oldData) return true;
      const oldResult = (oldData.results as GameResult[]).find(
        (o) => o.gameCode === r.gameCode
      );
      return !oldResult || oldResult.status !== "declared";
    });

    for (const result of newlyDeclared) {
      await syncToChart(date, result);
      await sendResultNotification(result, date);
    }
  });

// ─── Chart Sync ───

async function syncToChart(date: string, result: GameResult) {
  const [yearStr, monthStr] = date.split("-");
  const chartDocId = `${result.gameCode}_${yearStr}-${monthStr}`;
  const chartRef = db.doc(`charts_history/${chartDocId}`);

  const dayOfWeek = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
  });

  const newRecord: ChartRecord = {
    date,
    day: dayOfWeek,
    result: result.result,
    resultTime: result.resultTime,
  };

  const chartSnap = await chartRef.get();

  if (chartSnap.exists) {
    const chartData = chartSnap.data()!;
    const records = chartData.records as ChartRecord[];
    const idx = records.findIndex((r) => r.date === date);

    if (idx >= 0) {
      records[idx] = newRecord;
    } else {
      records.push(newRecord);
    }

    records.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    await chartRef.update({
      records,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    await chartRef.set({
      gameCode: result.gameCode,
      gameName: result.gameName,
      month: parseInt(monthStr),
      year: parseInt(yearStr),
      monthYear: `${yearStr}-${monthStr}`,
      records: [newRecord],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

// ─── Push Notification ───

async function sendResultNotification(result: GameResult, date: string) {
  const usersSnap = await db
    .collection("users")
    .where("isSubscribed", "==", true)
    .where("subscribedGames", "array-contains", result.gameCode)
    .get();

  if (usersSnap.empty) return;

  const tokens = usersSnap.docs.map((d) => d.data().fcmToken as string);
  const batchSize = 500;
  let totalSent = 0;

  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);

    const message: admin.messaging.MulticastMessage = {
      tokens: batch,
      notification: {
        title: `${result.gameName} Result Declared!`,
        body: `${result.gameName} result for ${date}: ${result.result}`,
      },
      webpush: {
        fcmOptions: { link: "/" },
      },
    };

    const response = await messaging.sendEachForMulticast(message);
    totalSent += response.successCount;

    // Remove invalid tokens
    response.responses.forEach((resp, idx) => {
      if (
        resp.error?.code === "messaging/invalid-registration-token" ||
        resp.error?.code === "messaging/registration-token-not-registered"
      ) {
        db.collection("users")
          .where("fcmToken", "==", batch[idx])
          .get()
          .then((snap) => snap.docs.forEach((doc) => doc.ref.delete()));
      }
    });
  }

  // Log notification
  await db.collection("notifications").add({
    title: `${result.gameName} Result Declared!`,
    body: `${result.gameName} result for ${date}: ${result.result}`,
    type: "result_update",
    targetAudience: "specific_game",
    targetGame: result.gameCode,
    sentAt: admin.firestore.FieldValue.serverTimestamp(),
    sentBy: "system",
    recipientCount: totalSent,
    status: "sent",
  });
}

// ─── Manual Notification (Callable) ───

export const sendManualNotification = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Not authenticated"
      );
    }

    const adminDoc = await db.doc(`admins/${context.auth.uid}`).get();
    if (!adminDoc.exists || !adminDoc.data()?.isActive) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Not an admin"
      );
    }

    const { title, body, targetAudience, targetGame, imageUrl } = data;

    let query: admin.firestore.Query = db
      .collection("users")
      .where("isSubscribed", "==", true);

    if (targetAudience === "specific_game" && targetGame) {
      query = query.where("subscribedGames", "array-contains", targetGame);
    }

    const usersSnap = await query.get();
    const tokens = usersSnap.docs.map((d) => d.data().fcmToken as string);

    if (tokens.length === 0) {
      return { success: true, recipientCount: 0 };
    }

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: { title, body, ...(imageUrl && { imageUrl }) },
      webpush: { fcmOptions: { link: "/" } },
    };

    const response = await messaging.sendEachForMulticast(message);

    await db.collection("notifications").add({
      title,
      body,
      type: "announcement",
      targetAudience,
      targetGame: targetGame || null,
      imageUrl: imageUrl || null,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentBy: context.auth.uid,
      recipientCount: response.successCount,
      status: "sent",
    });

    return { success: true, recipientCount: response.successCount };
  }
);

// ─── Ad Tracking (Callable) ───

export const trackAdEvent = functions.https.onCall(async (data) => {
  const { adId, eventType } = data;
  if (!["impression", "click"].includes(eventType)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid event type"
    );
  }

  const field = eventType === "impression" ? "impressions" : "clicks";
  await db.doc(`advertisements/${adId}`).update({
    [field]: admin.firestore.FieldValue.increment(1),
  });

  return { success: true };
});

// ─── Daily Cleanup (Scheduled) ───
// Deactivates expired banners and ads every day at midnight IST.

export const dailyCleanup = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const batch = db.batch();

    // Expired banners
    const expiredBanners = await db
      .collection("banners")
      .where("endDate", "<", now)
      .where("isActive", "==", true)
      .get();

    expiredBanners.docs.forEach((doc) => {
      batch.update(doc.ref, { isActive: false });
    });

    // Expired ads
    const expiredAds = await db
      .collection("advertisements")
      .where("endDate", "<", now)
      .where("isActive", "==", true)
      .get();

    expiredAds.docs.forEach((doc) => {
      batch.update(doc.ref, { isActive: false });
    });

    await batch.commit();
    console.log(
      `Cleanup: deactivated ${expiredBanners.size} banners, ${expiredAds.size} ads`
    );
  });
