"use client";

export default function ScrollTopButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }}
      className="text-center bg-gradient-to-b from-[#f5b301] to-[#d4a017] text-[#2e1065] font-extrabold text-xs sm:text-sm md:text-lg py-3.5 md:py-4 rounded-xl border-2 border-[#7c3aed] shadow-sm hover:from-[#ffc93c] hover:to-[#e0b43a] hover:shadow-md transition-all"
    >
      {children}
    </button>
  );
}