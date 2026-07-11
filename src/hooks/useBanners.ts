"use client";

import { useEffect, useState } from "react";
import { getActiveBanners } from "@/lib/firestore";
import type { Banner } from "@/types";

export function useBanners(position?: string) {
  const [banners, setBanners] = useState<(Banner & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveBanners(position)
      .then(setBanners)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [position]);

  return { banners, loading };
}
