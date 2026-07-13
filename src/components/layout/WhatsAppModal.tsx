"use client";

import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppLink } from "@/lib/utils";

export function WhatsAppModal() {
  const [show, setShow] = useState(false);
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+918973500029";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShow(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-4 md:right-6 z-[100]">
      <a
        href={getWhatsAppLink(phone, "GALI KING")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Game खेलने के लिए संपर्क करें"
        className="flex items-center justify-center bg-[#25D366] hover:bg-[#1fb855] text-white p-3.5 rounded-full shadow-lg shadow-green-500/25 transition-all hover:scale-110 hover:shadow-green-400/40 animate-scaleIn"
      >
        <FaWhatsapp className="w-7 h-7" />
      </a>
    </div>
  );
}
