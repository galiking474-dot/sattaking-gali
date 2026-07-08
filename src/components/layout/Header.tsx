"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX, FiHome, FiMessageCircle, FiInfo, FiBarChart2 } from "react-icons/fi";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/charts", label: "Charts", icon: FiBarChart2 },
  { href: "/contact", label: "Contact", icon: FiMessageCircle },
  { href: "/about", label: "About", icon: FiInfo },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="bg-[#2e1065] text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between h-12 md:h-14">
          <Link href="/" className="flex items-center gap-1.5 min-w-0">
            <span className="text-base md:text-xl font-extrabold tracking-tight truncate">
              SATTA<span className="text-[#f5b301]">KING</span><span className="text-[#c4b5fd]">GALI</span>
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
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    active
                      ? "bg-[#f5b301] text-[#2e1065] shadow-md"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
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
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-3 pt-2 flex flex-col gap-1 border-t border-white/10">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    active
                      ? "bg-[#f5b301] text-[#2e1065]"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
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
      <div className="bg-gradient-to-r from-[#7c3aed] to-[#4c1d95] text-white py-1 overflow-hidden w-full">
        <div className="animate-marquee whitespace-nowrap text-[10px] md:text-xs font-bold">
          Welcome to SattaKing-Gali.com &mdash; Superfast Live Satta King Results &bull; Gali, Desawar, Ghaziabad, Faridabad, Shri Ganesh, Delhi Bazar &bull; 100+ Games &bull; Free Monthly Chart Records &bull; Updated Every Minute
        </div>
      </div>
    </header>
  );
}
