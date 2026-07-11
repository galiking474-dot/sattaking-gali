"use client";

import { useState, useEffect, FormEvent } from "react";
import { getAllAds, saveAd, deleteAd } from "@/lib/firestore";
import { uploadImage } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import type { Advertisement } from "@/types";
import { FiTrash2, FiToggleLeft, FiToggleRight } from "react-icons/fi";

export default function AdminAdsPage() {
  const { user } = useAuth();
  const [ads, setAds] = useState<(Advertisement & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [adType, setAdType] = useState<Advertisement["adType"]>("banner");
  const [placement, setPlacement] = useState("homepage_top");
  const [linkUrl, setLinkUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  function loadAds() {
    setLoading(true);
    getAllAds()
      .then(setAds)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAds();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setSaving(true);
    try {
      let imageUrl: string | undefined;
      if (file) {
        imageUrl = await uploadImage(file, "ads");
      }

      await saveAd({
        title,
        adType,
        content: {
          imageUrl,
          text: textContent || undefined,
        },
        placement,
        linkUrl: linkUrl || undefined,
        impressions: 0,
        clicks: 0,
        isActive: true,
        startDate: Timestamp.now(),
        endDate: Timestamp.fromDate(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ),
        createdBy: user?.uid || "",
      });
      toast.success("Advertisement saved");
      setTitle("");
      setLinkUrl("");
      setTextContent("");
      setFile(null);
      loadAds();
    } catch {
      toast.error("Failed to save ad");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAd(ad: Advertisement & { id: string }) {
    try {
      await saveAd({ ...ad, isActive: !ad.isActive });
      toast.success(ad.isActive ? "Ad deactivated" : "Ad activated");
      loadAds();
    } catch {
      toast.error("Failed to update ad");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this advertisement?")) return;
    try {
      await deleteAd(id);
      toast.success("Ad deleted");
      loadAds();
    } catch {
      toast.error("Failed to delete ad");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Ads</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Create Advertisement
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ad title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            />
            <select
              value={adType}
              onChange={(e) =>
                setAdType(e.target.value as Advertisement["adType"])
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="banner">Banner</option>
              <option value="inline">Inline</option>
              <option value="popup">Popup</option>
              <option value="sticky_footer">Sticky Footer</option>
            </select>
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="homepage_top">Homepage Top</option>
              <option value="homepage_middle">Homepage Middle</option>
              <option value="homepage_bottom">Homepage Bottom</option>
              <option value="chart_sidebar">Chart Sidebar</option>
            </select>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Click-through URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Text content (optional)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#1e3a5f] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#2a5080] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create Ad"}
            </button>
          </form>
        </div>

        {/* Ad List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            All Advertisements ({ads.length})
          </h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : ads.length === 0 ? (
            <p className="text-sm text-gray-500">No ads yet.</p>
          ) : (
            <div className="space-y-3">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className="flex items-center gap-4 border border-gray-200 rounded-lg p-3"
                >
                  {ad.content.imageUrl && (
                    <img
                      src={ad.content.imageUrl}
                      alt={ad.title}
                      className="w-20 h-14 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">
                      {ad.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {ad.placement} &middot; {ad.adType} &middot;
                      Impressions: {ad.impressions} &middot; Clicks: {ad.clicks}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAd(ad)}
                      className={`p-1.5 rounded ${
                        ad.isActive ? "text-emerald-600" : "text-gray-400"
                      }`}
                    >
                      {ad.isActive ? (
                        <FiToggleRight size={22} />
                      ) : (
                        <FiToggleLeft size={22} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
