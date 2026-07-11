"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  FiHome,
  FiList,
  FiBarChart2,
  FiImage,
  FiBell,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiMail,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: FiHome },
  { href: "/admin/results", label: "Results", icon: FiList },
  { href: "/admin/charts", label: "Charts", icon: FiBarChart2 },
  { href: "/admin/banners", label: "Banners", icon: FiImage },
  { href: "/admin/notifications", label: "Notifications", icon: FiBell },
  { href: "/admin/ads", label: "Advertisements", icon: FiDollarSign },
  { href: "/admin/contacts", label: "Messages", icon: FiMail },
  { href: "/admin/site-config", label: "Site Config", icon: FiSettings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { admin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 bg-[#1e3a5f] text-white p-2 rounded-lg shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-[#1e3a5f] text-white z-40 flex flex-col transition-transform",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-5 border-b border-white/20">
          <h2 className="text-lg font-bold">
            SATTA<span className="text-amber-400">RESULT</span>
          </h2>
          <p className="text-xs text-gray-300 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/15 text-white border-r-4 border-amber-400"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/20">
          <div className="text-xs text-gray-300 mb-2">
            Signed in as <span className="font-medium text-white">{admin?.displayName || admin?.email}</span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <FiLogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
