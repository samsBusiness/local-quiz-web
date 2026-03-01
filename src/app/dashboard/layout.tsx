"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/contexts/auth-context";

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
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Locahoot</h1>
          </div>
          <div className="p-6">{children}</div>
        </main>
      </SidebarProvider>
    </AuthProvider>
  );
}
