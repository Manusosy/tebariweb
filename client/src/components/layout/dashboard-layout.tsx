import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { UserRole } from "@/lib/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole; // Optional for now, defaults to admin
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export function DashboardLayout({ 
  children, 
  userRole = 'admin',
  userName = 'Demo User',
  userEmail = 'demo@tebari.com',
  userAvatar
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-muted/20 overflow-hidden">
      <Sidebar 
        role={userRole} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
          userName={userName}
          userEmail={userEmail}
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
