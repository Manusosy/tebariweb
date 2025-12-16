import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { UserRole } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen w-full bg-muted/20 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-10 transition-opacity animate-in fade-in"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <Sidebar
        role={finalRole}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header
          userName={finalName}
          userEmail={finalEmail}
          userAvatar={userAvatar}
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
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
