"use client";

import { useState, useEffect, FormEvent } from "react";
import { getNotifications, saveNotification } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_GAMES } from "@/lib/utils";
import toast from "react-hot-toast";
import type { NotificationRecord } from "@/types";

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<
    (NotificationRecord & { id: string })[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<"all" | "specific_game">("all");
  const [targetGame, setTargetGame] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required");
      return;
    }

    setSending(true);
    try {
      await saveNotification({
        title: title.trim(),
        body: body.trim(),
        type: "announcement",
        targetAudience: target,
        targetGame: target === "specific_game" ? targetGame : undefined,
        sentBy: user?.uid || "",
        recipientCount: 0,
        status: "sent",
      });
      toast.success("Notification saved");
      setTitle("");
      setBody("");
      // Refresh list
      const updated = await getNotifications();
      setNotifications(updated);
    } catch {
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Send Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Send Notification
          </h2>
          <form onSubmit={handleSend} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Notification body"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              required
            />
            <select
              value={target}
              onChange={(e) =>
                setTarget(e.target.value as "all" | "specific_game")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Subscribers</option>
              <option value="specific_game">Specific Game</option>
            </select>
            {target === "specific_game" && (
              <select
                value={targetGame}
                onChange={(e) => setTargetGame(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select game...</option>
                {DEFAULT_GAMES.map((g) => (
                  <option key={g.gameCode} value={g.gameCode}>
                    {g.gameName}
                  </option>
                ))}
              </select>
            )}
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-amber-500 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-600 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Notification"}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-3">
            Note: Push delivery requires Firebase Cloud Functions to be deployed.
            This form saves the notification record.
          </p>
        </div>

        {/* History */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Recent Notifications
          </h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications sent yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {n.status}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Target: {n.targetAudience}</span>
                    <span>Recipients: {n.recipientCount}</span>
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
