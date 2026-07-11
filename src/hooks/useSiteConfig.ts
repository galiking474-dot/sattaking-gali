"use client";

import { useEffect, useState } from "react";
import { getSiteConfig } from "@/lib/firestore";
import type { SiteConfig } from "@/types";

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteConfig()
      .then(setConfig)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}
