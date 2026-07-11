"use client";

import { useEffect, useState } from "react";
import { getTodayResults } from "@/lib/firestore";
import type { DailyResult } from "@/types";
import { getTodayDateString } from "@/lib/utils";

// Real-time updates REMOVED (Firebase free-tier). This used to open a Firestore
// onSnapshot realtime listener that streamed reads on every change per client.
// It now does a single one-time read on mount — the admin can refresh to re-fetch.
export function useLiveResults(date?: string) {
  const [results, setResults] = useState<DailyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const targetDate = date || getTodayDateString();
    let active = true;
    getTodayResults(targetDate)
      .then((data) => {
        if (active) {
          setResults(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [date]);

  return { results, loading };
}
