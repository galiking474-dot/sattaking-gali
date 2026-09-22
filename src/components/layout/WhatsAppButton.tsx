import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppLink } from "@/lib/utils";

export function WhatsAppButton() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+918973500029";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <a
        href={getWhatsAppLink(phone, "GALI KING")}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto inline-flex min-h-12 w-full max-w-[400px] touch-manipulation items-center justify-center gap-3 rounded-full bg-[#20cf68] px-5 py-3 text-white shadow-[0_10px_24px_rgba(32,207,104,0.32)] transition-colors duration-200 hover:bg-[#19b95b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#20cf68]/35 sm:w-auto sm:px-7"
        aria-label="Game खेलने के लिए WhatsApp पर संपर्क करें"
      >
        <FaWhatsapp aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
        <span className="text-center text-base font-extrabold leading-tight sm:text-xl">
          Game खेलने के लिए संपर्क करें
        </span>
      </a>
    </div>
  );
}
