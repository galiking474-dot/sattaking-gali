"use client";

import { useState, useEffect } from "react";
import { getContactMessages, markMessageRead } from "@/lib/firestore";
import toast from "react-hot-toast";
import type { ContactMessage } from "@/types";
import { FiMail, FiCheck } from "react-icons/fi";

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<(ContactMessage & { id: string })[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  function loadMessages() {
    setLoading(true);
    getContactMessages()
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function handleMarkRead(id: string) {
    try {
      await markMessageRead(id);
      toast.success("Marked as read");
      loadMessages();
    } catch {
      toast.error("Failed to update");
    }
  }

  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contact Messages</h1>
        {unread > 0 && (
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
            {unread} unread
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No contact messages yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 ${msg.isRead ? "bg-white" : "bg-blue-50"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {msg.isRead ? (
                        <FiCheck size={16} className="text-gray-400" />
                      ) : (
                        <FiMail size={16} className="text-blue-600" />
                      )}
                      <span className="font-semibold text-sm text-gray-800">
                        {msg.name}
                      </span>
                      {msg.email && (
                        <span className="text-xs text-gray-400">
                          {msg.email}
                        </span>
                      )}
                      {msg.phone && (
                        <span className="text-xs text-gray-400">
                          {msg.phone}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{msg.message}</p>
                  </div>
                  {!msg.isRead && (
                    <button
                      onClick={() => handleMarkRead(msg.id)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 whitespace-nowrap ml-4"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
