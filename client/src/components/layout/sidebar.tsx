import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Menu,
  X,
  PlusCircle,
  BarChart3,
  List,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [location] = useLocation();
  const isMobile = useIsMobile();

  const commonLinks: SidebarLink[] = [];

  const adminLinks: SidebarLink[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/map', label: 'Map View', icon: Map },
    { href: '/hotspots', label: 'Hotspots', icon: Map },
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
    { href: '/reports', label: 'Overview', icon: LayoutDashboard },
    { href: '/impact', label: 'Impact Metrics', icon: BarChart3 },
  ];

  let links = [...commonLinks];
  if (role === 'admin' || role === 'super_admin') links = [...links, ...adminLinks];
  if (role === 'field_officer') links = [...links, ...fieldLinks];
  if (role === 'partner') links = [...links, ...partnerLinks];

  return (
    <div 
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out relative z-20",
        collapsed ? "w-[70px]" : "w-[240px]",
        isMobile && !collapsed ? "absolute inset-y-0 left-0 w-[240px] shadow-2xl" : ""
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
        <Link href="/" className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer block",
          collapsed && "justify-center px-2"
        )}>
          <LogOut size={20} />
          {!collapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </div>
  );
}
