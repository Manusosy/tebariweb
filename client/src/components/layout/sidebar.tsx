import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Map,
  MapPin,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
  BarChart3,
  List,
  LucideIcon,
  Truck,
  PieChart,
  Briefcase,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  role: 'super_admin' | 'admin' | 'field_officer' | 'partner';
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function Sidebar({ role, collapsed, setCollapsed }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const { logoutMutation } = useAuth();

  const handleSignOut = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/login");
  };

  const commonLinks: SidebarLink[] = [];

  const superAdminLinks: SidebarLink[] = [
    { href: '/executive', label: 'Executive Overview', icon: Briefcase },
    { href: '/super-admin/notifications', label: 'Notifications', icon: Bell },
    // Super admin also inherits admin links usually, but let's keep it focused for this role based on PRD
    { href: '/dashboard', label: 'Ops Dashboard', icon: LayoutDashboard },
    { href: '/hotspots', label: 'Collection Zones', icon: MapPin },
    { href: '/reports', label: 'Global Reports', icon: BarChart3 },
    { href: '/officers', label: 'Team Mgmt', icon: Users },
  ];

  const adminLinks: SidebarLink[] = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/hotspots', label: 'Zones', icon: MapPin },
    { href: '/officers', label: 'Field Officers', icon: Users },
    { href: '/submissions', label: 'Submissions', icon: FileText },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  const fieldLinks: SidebarLink[] = [
    { href: '/field/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { href: '/collection/new', label: 'New Collection', icon: PlusCircle },
    { href: '/field/submissions', label: 'My Submissions', icon: List },
    { href: '/field/map', label: 'Zone Map', icon: Map },
  ];

  const partnerLinks: SidebarLink[] = [
    { href: '/partner/overview', label: 'Impact Dashboard', icon: LayoutDashboard },
    { href: '/partner/collections', label: 'Collections', icon: Truck },
    { href: '/partner/analytics', label: 'Analytics', icon: PieChart },
  ];

  let links = [...commonLinks];
  if (role === 'super_admin') links = [...links, ...superAdminLinks];
  else if (role === 'admin') links = [...links, ...adminLinks];
  else if (role === 'field_officer') links = [...links, ...fieldLinks];
  else if (role === 'partner') links = [...links, ...partnerLinks];

  return (
    <div
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out z-20",
        isMobile
          ? (collapsed ? "hidden" : "fixed inset-y-0 left-0 w-[240px] shadow-2xl")
          : (collapsed ? "w-[70px]" : "w-[240px] relative")
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
        {!collapsed && (
          <span className="font-bold text-xl tracking-tight text-sidebar-primary-foreground">
            Tebari<span className="text-sidebar-primary">.</span>
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location === link.href || location.startsWith(link.href + '/');
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 px-4 py-3 mx-2 rounded-md transition-colors text-sm font-medium cursor-pointer block",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-2"
            )} title={collapsed ? link.label : undefined}>
              <link.icon size={20} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border shrink-0">
        <Link href="/settings" className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-2 cursor-pointer block",
          collapsed && "justify-center px-2"
        )}>
          <Settings size={20} />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}

