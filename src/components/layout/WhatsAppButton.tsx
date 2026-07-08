"use client";

import { FaWhatsapp } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { getWhatsAppLink } from "@/lib/utils";

export function WhatsAppButton() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "911234567890";

  return (
    <div className="fixed bottom-4 right-3 md:bottom-6 md:right-6 z-50 flex flex-col items-center gap-2 md:gap-3">
<a
        href={getWhatsAppLink(phone, "VP BHAI")}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-3 md:p-4 rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-green-300/50 hover:shadow-xl"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="w-5 h-5 md:w-7 md:h-7" />
      </a>
    </div>
  );
}
