import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { UserRole } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export function DashboardLayout({
  children,
  userRole,
  userName,
  userEmail,
  userAvatar
}: DashboardLayoutProps) {
  const { user } = useAuth();

  const finalRole = userRole || (user?.role as UserRole) || 'field_officer';
  const finalName = userName || user?.name || 'User';
  const finalEmail = userEmail || user?.email || '';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-muted/20 overflow-hidden">
      <Sidebar
        role={finalRole}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          userName={finalName}
          userEmail={finalEmail}
          userAvatar={userAvatar}
        />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
