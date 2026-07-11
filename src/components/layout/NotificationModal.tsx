"use client";

import { useState, useEffect } from "react";
import { FiInfo, FiX } from "react-icons/fi";
import { getWhatsAppLink } from "@/lib/utils";

export function NotificationModal() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "911234567890";
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show on initial load after a short delay
    const initialTimer = setTimeout(() => setShow(true), 800);

    // Then repeat every 1 minute
    const interval = setInterval(() => {
      setShow(true);
    }, 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  function handleAllow() {
    setShow(false);
    // Open WhatsApp with a pre-filled message
    const link = getWhatsAppLink(
      whatsappNumber,
      "हाँ, मुझे सभी रिज़ल्ट अपडेट भेजें!"
    );
    window.open(link, "_blank", "noopener,noreferrer");
  }

  function handleDismiss() {
    setShow(false);
  }

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden animate-[scaleIn_0.3s_ease-out]">
          {/* Close button */}
          <div className="flex justify-end p-2">
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Icon */}
          <div className="flex justify-center pb-4">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
              <FiInfo size={40} className="text-blue-500" />
            </div>
          </div>

          {/* Text */}
          <div className="px-6 pb-6 text-center">
            <p className="text-gray-700 text-base leading-relaxed">
              क्या आप सभी अपडेट और रिज़ल्ट सीधे अपने मोबाइल / डिवाइस पर पाना
              चाहते है?
            </p>
          </div>

          {/* Buttons */}
          <div className="flex border-t border-gray-100">
            <button
              onClick={handleAllow}
              className="flex-1 py-4 text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              हाँ, मुझे सूचित करें
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 py-4 text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              नहीं, फिर कभी
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
