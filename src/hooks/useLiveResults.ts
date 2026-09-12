"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getTodayResults } from "@/lib/firestore";
import type { DailyResult } from "@/types";
import { getTodayDateString } from "@/lib/utils";

// Real-time updates REMOVED (Firebase free-tier). This used to open a Firestore
// onSnapshot realtime listener that streamed reads on every change per client.
// It now does a single one-time read on mount — the admin can refresh to re-fetch.
export function useLiveResults(date?: string) {
  const [results, setResults] = useState<DailyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    const targetDate = date || getTodayDateString();

    try {
      const data = await getTodayResults(targetDate);
      if (currentRequest === requestId.current) setResults(data);
    } catch {
      // Keep the last known value visible when a refresh temporarily fails.
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    const targetDate = date || getTodayDateString();

    getTodayResults(targetDate)
      .then((data) => {
        if (currentRequest === requestId.current) setResults(data);
      })
      .catch(() => {
        // Keep the last known value visible when the initial read fails.
      })
      .finally(() => {
        if (currentRequest === requestId.current) setLoading(false);
      });

    return () => {
      requestId.current += 1;
    };
  }, [date]);

  return { results, loading, refresh };
}
