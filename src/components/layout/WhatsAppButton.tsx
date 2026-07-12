"use client";

import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppLink } from "@/lib/utils";

export function WhatsAppButton() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "911234567890";

  return (
    <div className="fixed bottom-4 right-3 md:bottom-5 md:right-5 z-50 flex flex-col items-center gap-2">
      <a
        href={getWhatsAppLink(phone, "GALI KING")}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-2 md:p-2.5 rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-green-300/50 hover:shadow-xl"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="w-4 h-4 md:w-5 md:h-5" />
      </a>
    </div>
  );
}
