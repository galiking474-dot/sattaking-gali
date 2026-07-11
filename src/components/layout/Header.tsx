"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX, FiHome, FiMessageCircle, FiInfo, FiBarChart2 } from "react-icons/fi";
import { FaCrown } from "react-icons/fa";
import { GiLion } from "react-icons/gi";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/charts", label: "Charts", icon: FiBarChart2 },
  { href: "/contact", label: "Contact", icon: FiMessageCircle },
  { href: "/about", label: "About", icon: FiInfo },
];

// Crowned-lion emblem — the "king" brand mark.
function LogoMark() {
  return (
    <span className="relative inline-flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-b from-[#FFE071] to-[#F5A623] ring-2 ring-[#7a4a00]/40 shadow-md shrink-0">
      <FaCrown className="absolute -top-2 w-4 h-4 md:w-5 md:h-5 text-[#b8860b] drop-shadow" />
      <GiLion className="w-6 h-6 md:w-7 md:h-7 text-[#5a3a08]" />
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
    <header className="bg-gradient-to-r from-[#FFD93B] via-[#FBC02D] to-[#F5A623] text-[#3a1d00] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <LogoMark />
            <span className="text-base md:text-2xl font-extrabold tracking-tight truncate">
              SATTA<span className="text-[#a5370c]">KING</span>
              <span className="text-[#7a4a00]">GALI</span>
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
                      : "text-[#5a3a08] hover:bg-white/40 hover:text-[#3a1d00]"
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
            className="md:hidden p-2 rounded-lg hover:bg-white/40 transition-colors text-[#5a3a08]"
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
                      : "text-[#5a3a08] hover:bg-white/40 hover:text-[#3a1d00]"
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
      <div className="bg-[#a5370c] text-[#FFE071] py-1 overflow-hidden w-full">
        <div className="animate-marquee whitespace-nowrap text-[10px] md:text-xs font-bold">
          Welcome to SattaKing-Gali.com &mdash; Superfast Live Satta King Results &bull; Gali, Desawar, Ghaziabad, Faridabad, Shri Ganesh, Delhi Bazar &bull; 100+ Games &bull; Free Monthly Chart Records &bull; Updated Every Minute
        </div>
      </div>
    </header>
  );
}
