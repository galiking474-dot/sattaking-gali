"use client";

import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppLink } from "@/lib/utils";

export function WhatsAppModal() {
  const [show, setShow] = useState(false);
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "911234567890";

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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
      <a
        href={getWhatsAppLink(phone, "VP BHAI")}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#1fb855] text-white font-extrabold text-lg px-6 py-3.5 rounded-full shadow-lg shadow-green-500/25 transition-all hover:scale-[1.03] hover:shadow-green-400/40 animate-scaleIn"
      >
        <FaWhatsapp className="w-7 h-7" />
        Game खेलने के लिए संपर्क करें
      </a>
    </div>
  );
}
