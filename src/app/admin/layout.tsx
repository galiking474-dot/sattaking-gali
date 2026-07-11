"use client";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Loading } from "@/components/ui/Loading";
import { AdminSidebar } from "@/components/admin/Sidebar";

function AdminGuard({ children }: { children: ReactNode }) {
  const { user, admin, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [loading, user, isLoginPage, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Authenticating..." />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user || !admin) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-0 md:ml-64">
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AuthProvider>
  );
}
