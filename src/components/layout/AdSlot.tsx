"use client";

import { useEffect, useState } from "react";
import { getActiveAds } from "@/lib/firestore";
import type { Advertisement } from "@/types";

export function AdSlot({ placement }: { placement: string }) {
  const [ad, setAd] = useState<(Advertisement & { id: string }) | null>(null);

  useEffect(() => {
    getActiveAds(placement).then((ads) => {
      if (ads.length > 0) setAd(ads[0]);
    });
  }, [placement]);

  if (!ad) return null;

  return (
    <div className="w-full my-4">
      {ad.content.imageUrl ? (
        <a
          href={ad.linkUrl || "#"}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block"
        >
          <img
            src={ad.content.imageUrl}
            alt={ad.title}
            className="w-full max-h-32 object-cover rounded-lg"
            loading="lazy"
          />
        </a>
      ) : ad.content.text ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center text-sm text-gray-600">
          {ad.content.text}
        </div>
      ) : null}
    </div>
  );
}
