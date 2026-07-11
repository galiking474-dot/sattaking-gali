import { FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

// Khaiwal contact / game-schedule card. Shared by the homepage and each
// per-game page. Pass the schedule to display (name + time).
export function KhaiwalCard({
  games,
  heading = "Game Schedule & Contact",
}: {
  games: { name: string; time: string }[];
  heading?: string;
}) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "911234567890";
  const digits = phone.replace(/[^0-9]/g, "");

  const fallback = [
    { name: "शिवधाम", time: "01:20 PM" },
    { name: "दिल्ली बाजार", time: "03:00 PM" },
    { name: "श्री गणेश", time: "04:20 PM" },
    { name: "फरीदाबाद", time: "06:00 PM" },
    { name: "गाज़ियाबाद", time: "09:20 PM" },
    { name: "गली", time: "11:20 PM" },
    { name: "दिसावर", time: "03:20 AM" },
  ];
  const schedule = games.length > 0 ? games : fallback;

  return (
    <section>
      <div className="flex items-center gap-2.5 md:gap-3 mb-3">
        <div className="p-2 rounded-lg bg-[#d97706] text-white shrink-0">
          <FiPhone size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl md:text-lg font-extrabold text-[#a5370c]">
            {heading}
          </h2>
          <p className="text-[14px] md:text-xs text-[#8a6d2f]">
            Game play करने के लिये संपर्क करे
          </p>
        </div>
      </div>

      {/* Gold contact card with amber dashed border */}
      <div className="rounded-2xl border-2 border-dashed border-[#e0850b] bg-gradient-to-b from-[#FFD93B] via-[#FCE684] to-[#FEF9E7] px-4 md:px-10 py-6 md:py-9 text-center shadow-lg">
        <p className="text-[#3a1d00] font-extrabold text-base md:text-2xl tracking-tight">
          &#11088; Direct Company No.1 Khaiwal &#11088;
        </p>
        <p className="text-[#a5370c] font-extrabold text-3xl md:text-5xl mt-1.5 md:mt-2 tracking-tight">
          GALI KING
        </p>

        {/* Game Schedule List */}
        <div className="max-w-xl mx-auto mt-5 md:mt-7 bg-[#FFFBEA] rounded-2xl border border-[#EBD98A] shadow-sm px-4 md:px-7 py-3 md:py-4 text-left">
          {schedule.map((game, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 py-2.5 md:py-3 ${
                i !== schedule.length - 1
                  ? "border-b border-dashed border-[#E0CF8A]"
                  : ""
              }`}
            >
              <span className="text-lg md:text-xl">&#9200;</span>
              <span className="text-[#3a1d00] font-bold text-base md:text-xl">
                {game.name}
              </span>
              <span className="flex-1" />
              <span className="text-[#3a1d00] font-extrabold text-base md:text-xl tracking-wide">
                {game.time}
              </span>
            </div>
          ))}
        </div>

        {/* Rate cards */}
        <div className="max-w-md mx-auto mt-6 md:mt-8 grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white rounded-xl border-2 border-[#e0850b] px-4 py-3 shadow-sm">
            <p className="text-[#8a6d2f] font-bold text-[11px] md:text-xs uppercase tracking-widest">
              Jodi Rate
            </p>
            <p className="text-[#a5370c] font-extrabold text-2xl md:text-3xl mt-0.5">
              10-950
            </p>
          </div>
          <div className="bg-white rounded-xl border-2 border-[#e0850b] px-4 py-3 shadow-sm">
            <p className="text-[#8a6d2f] font-bold text-[11px] md:text-xs uppercase tracking-widest">
              Haruf Rate
            </p>
            <p className="text-[#a5370c] font-extrabold text-2xl md:text-3xl mt-0.5">
              100-950
            </p>
          </div>
        </div>

        <p className="text-[#3a1d00] font-extrabold text-sm md:text-lg uppercase tracking-wide mt-6 md:mt-8">
          PAYTM &bull; PHONEPE &bull; GOOGLE PAY &bull; BANK TRANSFER
        </p>

        <a
          href={`tel:+${digits}`}
          className="block text-[#a5370c] font-extrabold text-3xl md:text-5xl tracking-tight underline underline-offset-4 decoration-2 mt-5 md:mt-7 hover:text-[#d97706] transition-colors break-all"
        >
          +{digits}
        </a>

        <a
          href={`https://wa.me/${digits}?text=${encodeURIComponent("GALI KING")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1fb855] text-white font-extrabold text-lg md:text-xl px-8 py-3.5 rounded-full shadow-lg shadow-green-500/20 transition-all hover:scale-105 mt-6 md:mt-8"
        >
          <FaWhatsapp className="w-7 h-7 md:w-8 md:h-8" />
          <div className="text-left">
            <div className="text-lg md:text-xl font-extrabold leading-tight">
              WhatsApp
            </div>
            <div className="text-xs font-semibold opacity-90">Click To Chat</div>
          </div>
        </a>
      </div>
    </section>
  );
}
