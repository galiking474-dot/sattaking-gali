"use client";

import { useState, useEffect, FormEvent } from "react";
import { getAllBanners, saveBanner, deleteBanner } from "@/lib/firestore";
import { uploadImage } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import type { Banner } from "@/types";
import { Timestamp } from "firebase/firestore";
import { FiTrash2, FiToggleLeft, FiToggleRight } from "react-icons/fi";

export default function AdminBannersPage() {
  const { user } = useAuth();
  const [banners, setBanners] = useState<(Banner & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState<Banner["position"]>("top");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [order, setOrder] = useState(1);

  function loadBanners() {
    setLoading(true);
    getAllBanners()
      .then(setBanners)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadBanners();
  }, []);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file, "banners");
      await saveBanner({
        title,
        imageUrl,
        linkUrl: linkUrl || undefined,
        position,
        displayOrder: order,
        isActive: true,
        createdBy: user?.uid || "",
      });
      toast.success("Banner uploaded");
      setTitle("");
      setLinkUrl("");
      setFile(null);
      setOrder(1);
      loadBanners();
    } catch {
      toast.error("Failed to upload banner");
    } finally {
      setUploading(false);
    }
  }

  async function toggleBanner(banner: Banner & { id: string }) {
    try {
      await saveBanner({ ...banner, isActive: !banner.isActive });
      toast.success(banner.isActive ? "Banner deactivated" : "Banner activated");
      loadBanners();
    } catch {
      toast.error("Failed to update banner");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return;
    try {
      await deleteBanner(id);
      toast.success("Banner deleted");
      loadBanners();
    } catch {
      toast.error("Failed to delete banner");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Banners</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Upload Banner</h2>
          <form onSubmit={handleUpload} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Banner title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            />
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as Banner["position"])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
              <option value="sidebar">Sidebar</option>
            </select>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Link URL (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              placeholder="Display order"
              min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
              required
            />
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-[#1e3a5f] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#2a5080] disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload Banner"}
            </button>
          </form>
        </div>

        {/* Banner List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            All Banners ({banners.length})
          </h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : banners.length === 0 ? (
            <p className="text-sm text-gray-500">No banners yet.</p>
          ) : (
            <div className="space-y-3">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="flex items-center gap-4 border border-gray-200 rounded-lg p-3"
                >
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">
                      {banner.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {banner.position} &middot; Order: {banner.displayOrder}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleBanner(banner)}
                      className={`p-1.5 rounded ${
                        banner.isActive
                          ? "text-emerald-600"
                          : "text-gray-400"
                      }`}
                      title={banner.isActive ? "Deactivate" : "Activate"}
                    >
                      {banner.isActive ? (
                        <FiToggleRight size={22} />
                      ) : (
                        <FiToggleLeft size={22} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      title="Delete"
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
