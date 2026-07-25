import { FaWhatsapp } from "react-icons/fa";
import { FiBell, FiZap, FiCheckCircle } from "react-icons/fi";

// WhatsApp Channel — jahan har game ka result sabse pehle post hota hai.
const CHANNEL_URL = "https://whatsapp.com/channel/0029VbBFXatKrWQybTvIOe1w";

export function WhatsAppChannelBanner() {
  return (
    <section aria-labelledby="whatsapp-channel-heading">
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#25D366]/50 bg-gradient-to-br from-[#128C7E] via-[#1faa5c] to-[#25D366] shadow-lg shadow-green-500/20">
        {/* Soft glow accents */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 w-44 h-44 rounded-full bg-black/10 blur-2xl" />

        <div className="relative flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-6">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-md">
              <FaWhatsapp className="w-10 h-10 md:w-12 md:h-12 text-[#25D366]" />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 text-center md:text-left text-white">
            <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 mb-2 text-[11px] md:text-xs font-bold uppercase tracking-wide">
              <FiZap className="w-3.5 h-3.5" /> Official WhatsApp Channel
            </div>
            <h2
              id="whatsapp-channel-heading"
              className="text-xl md:text-2xl font-extrabold leading-tight mb-1.5"
            >
              सबसे तेज़ Satta King रिजल्ट — WhatsApp पर मुफ़्त!
            </h2>
            <p className="text-sm md:text-base text-white/90 leading-relaxed mb-3">
              Gali, Desawar, Faridabad, Ghaziabad और सभी गेम के रिजल्ट सबसे पहले
              हमारे WhatsApp चैनल पर पाएं। अभी{" "}
              <span className="font-bold underline">फ्री में जुड़ें</span> और कोई
              भी रिजल्ट मिस न करें।
            </p>

            {/* Feature chips */}
            <ul className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1.5 text-[12px] md:text-sm font-medium text-white/95">
              <li className="inline-flex items-center gap-1.5">
                <FiZap className="w-4 h-4" /> सबसे तेज़ अपडेट
              </li>
              <li className="inline-flex items-center gap-1.5">
                <FiBell className="w-4 h-4" /> रोज़ाना रिजल्ट नोटिफिकेशन
              </li>
              <li className="inline-flex items-center gap-1.5">
                <FiCheckCircle className="w-4 h-4" /> 100% फ्री
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0 w-full md:w-auto">
            <a
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp चैनल से जुड़ें"
              className="flex items-center justify-center gap-2 w-full md:w-auto bg-white hover:bg-green-50 text-[#128C7E] font-extrabold text-base md:text-lg px-6 py-3.5 rounded-xl shadow-md transition-all hover:scale-[1.03] active:scale-95"
            >
              <FaWhatsapp className="w-6 h-6 text-[#25D366]" />
              चैनल जॉइन करें
            </a>
            <p className="mt-2 text-center text-[11px] md:text-xs text-white/80 font-medium">
              हज़ारों लोग जुड़ चुके हैं 🔥
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
