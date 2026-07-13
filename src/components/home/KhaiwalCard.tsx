import { FaWhatsapp } from "react-icons/fa";

// English → Hindi names for the game schedule shown in the khaiwal chart.
// Scraped game names arrive in English; display them in Hindi (fall back to
// the original name for anything not in the map).
const HINDI_NAMES: Record<string, string> = {
  "shivdham": "शिवधाम",
  "shiv dham": "शिवधाम",
  "delhi bazar": "दिल्ली बाजार",
  "delhi bazaar": "दिल्ली बाजार",
  "shree ganesh": "श्री गणेश",
  "shri ganesh": "श्री गणेश",
  "faridabad": "फरीदाबाद",
  "faridabad day": "फरीदाबाद डे",
  "ghaziabad": "गाज़ियाबाद",
  "gaziabad": "गाज़ियाबाद",
  "gali": "गली",
  "disawar": "दिसावर",
  "desawar": "दिसावर",
  "old alwar": "ओल्ड अलवर",
  "dehradun city": "देहरादून सिटी",
  "dehradun": "देहरादून",
  "old delhi": "पुरानी दिल्ली",
  "hindustan": "हिंदुस्तान",
};

function toHindiName(name: string): string {
  return HINDI_NAMES[name.trim().toLowerCase().replace(/\s+/g, " ")] ?? name;
}

// Khaiwal contact / game-schedule card. Shared by the homepage and each
// per-game page. Pass the schedule to display (name + time).
export function KhaiwalCard(_props?: {
  // Props accepted for backwards-compat with callers; the khaiwal chart now
  // shows a fixed game schedule (below) rather than the scraped/featured games.
  games?: { name: string; time: string }[];
  heading?: string;
}) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+918973500029";
  const digits = phone.replace(/[^0-9]/g, "");

  // Fixed khaiwal game schedule shown in the chart (name + declared time, IST).
  const schedule = [
    { name: "फरीदाबाद डे", time: "02:00 PM" },
    { name: "दिल्ली बाजार", time: "02:50 PM" },
    { name: "श्री गणेश", time: "04:25 PM" },
    { name: "फरीदाबाद", time: "05:50 PM" },
    { name: "ओल्ड अलवर", time: "07:00 PM" },
    { name: "गाजियाबाद", time: "09:40 PM" },
    { name: "देहरादून सिटी", time: "10:10 PM" },
    { name: "गली", time: "11:40 PM" },
    { name: "दिसावर", time: "02:30 AM" },
  ];

  return (
    <section>
      {/* Khaiwal contact card — yellow, classic khaiwal-poster layout */}
      <div className="rounded-2xl border-2 border-dashed border-[#e0850b] bg-gradient-to-b from-[#FFD93B] via-[#FCE684] to-[#FEF9E7] px-4 md:px-10 py-6 md:py-9 text-center shadow-lg">
        <p className="text-[#3a1d00] font-extrabold text-base md:text-2xl tracking-tight">
          --सीधे सट्टा कंपनी का No 1 खाईवाल--
        </p>
        <p className="text-[#a5370c] font-extrabold text-2xl md:text-4xl mt-2 md:mt-3 tracking-tight">
          &#9819; GALI KING &#9819;
        </p>

        {/* Game Schedule List */}
        <div className="max-w-md mx-auto mt-5 md:mt-7 text-left">
          {schedule.map((game, i) => (
            <div
              key={i}
              className="flex items-center gap-2 py-1.5 md:py-2 text-[#3a1d00] font-bold text-base md:text-xl"
            >
              <span className="text-lg md:text-xl">&#9200;</span>
              <span>{toHindiName(game.name)}</span>
              <span className="flex-1 border-b-2 border-dotted border-[#c9a94e] mx-1" />
              <span className="font-extrabold tracking-wide">{game.time}</span>
            </div>
          ))}
        </div>

        {/* Payment options */}
        <p className="text-[#3a1d00] font-extrabold text-base md:text-xl mt-6 md:mt-8">
          &#128184; Payment Option &#128184;
        </p>
        <p className="text-[#3a1d00] font-bold text-sm md:text-lg mt-1">
          PAYTM // BANK TRANSFER // PHONE PAY // GOOGLE PAY
        </p>

        {/* Rate list */}
        <p className="text-[#3a1d00] font-extrabold text-base md:text-xl mt-6 md:mt-8">
          &#129297; Rate list &#128184;
        </p>
        <p className="text-[#3a1d00] font-bold text-base md:text-xl mt-1">
          जोड़ी रेट 10 &mdash;&mdash; 950
        </p>
        <p className="text-[#3a1d00] font-bold text-base md:text-xl">
          हरूफ रेट 100 &mdash;&mdash; 950
        </p>

        {/* Brand again */}
        <p className="text-[#a5370c] font-extrabold text-2xl md:text-4xl mt-6 md:mt-8 tracking-tight">
          &#9819; SUNNY BHAI KHAIWAL &#9819;
        </p>

        {/* Red call-to-action */}
        <p className="text-[#dc2626] font-extrabold text-base md:text-xl mt-4">
          Game play करने के लिये नीचे लिंक पर क्लिक करे
        </p>

        <a
          href={`https://wa.me/${digits}?text=${encodeURIComponent("GALI KING")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 md:gap-4 bg-[#25D366] hover:bg-[#1fb855] pl-2 pr-6 md:pr-8 py-2 rounded-full shadow-lg shadow-green-500/20 transition-all hover:scale-105 mt-6 md:mt-8"
        >
          <span className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-white shadow-inner shrink-0">
            <FaWhatsapp className="w-9 h-9 md:w-11 md:h-11 text-[#25D366]" />
          </span>
          <div className="text-left leading-tight">
            <div className="text-[#1b3a1c] font-extrabold text-2xl md:text-3xl">
              WhatsApp
            </div>
            <div className="text-white font-extrabold text-xl md:text-2xl">
              Click to chat
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}
