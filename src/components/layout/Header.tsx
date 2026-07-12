"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX, FiHome, FiMessageCircle, FiBarChart2 } from "react-icons/fi";
import { FaCrown } from "react-icons/fa";
import { GiLion } from "react-icons/gi";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/charts", label: "Charts", icon: FiBarChart2 },
  { href: "/contact", label: "Contact", icon: FiMessageCircle },
];

// Crowned-lion emblem — the "king" brand mark.
function LogoMark() {
  return (
    <span className="relative inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-b from-[#FFE071] via-[#F5B301] to-[#D98A0B] ring-2 ring-white shadow-md shadow-black/20 shrink-0">
      <FaCrown className="absolute -top-1 md:-top-1.5 w-5 h-5 md:w-6 md:h-6 text-[#b8860b] drop-shadow" />
      <GiLion className="w-8 h-8 md:w-9 md:h-9 text-[#3a1d00]" />
    </span>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="bg-white text-[#3a1d00] shadow-lg sticky top-0 z-50 border-b border-[#f0e2a6]">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link href="/" className="flex items-center gap-2.5 md:gap-3 min-w-0">
            <LogoMark />
            <span className="text-xl md:text-4xl font-extrabold tracking-tight truncate text-black">
              SATTAKING-GALI.com
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    active
                      ? "bg-[#a5370c] text-[#FFE071] shadow-md"
                      : "text-[#5a3a08] hover:bg-[#FDF3C9] hover:text-[#3a1d00]"
                  }`}
                >
                  <Icon size={15} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#FDF3C9] transition-colors text-[#5a3a08]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-3 pt-2 flex flex-col gap-1 border-t border-[#e0a92b]">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    active
                      ? "bg-[#a5370c] text-[#FFE071]"
                      : "text-[#5a3a08] hover:bg-[#FDF3C9] hover:text-[#3a1d00]"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Marquee */}
      <div className="text-[#a5370c] py-1 overflow-hidden w-full border-t border-[#f0e2a6]">
        <div className="animate-marquee whitespace-nowrap text-[10px] md:text-xs font-bold">
SattaKing-Gali.com par paayein sabse tez Satta King result &bull; Desawar, Faridabad, Ghaziabad, Gali, Shri Ganesh &amp; Delhi Bazar &bull; 100+ market &bull; free monthly chart record &bull; har minute live update
        </div>
      </div>
    </header>
  );
}
