"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/contexts/auth-context";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex items-center gap-3 border-b px-4 py-2 md:hidden">
            <SidebarTrigger />
            <Image
              src="/tech21-logo.png"
              alt="Tech 21"
              width={28}
              height={28}
              className="rounded"
            />
            <span className="text-sm font-semibold">Tech 21</span>
          </div>
          <div className="p-6">{children}</div>
        </main>
      </SidebarProvider>
    </AuthProvider>
  );
}
