import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Store,
  Users,
  UserCircle,
  Scissors,
  ListChecks,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ImageIcon,
  FolderOpen,
  CalendarCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Appointments", href: "/appointments", icon: CalendarCheck },
  { name: "Cities", href: "/cities", icon: MapPin },
  { name: "Vendors", href: "/vendors", icon: Store },
  { name: "Beauticians", href: "/beauticians", icon: Scissors },
  { name: "Users", href: "/users", icon: UserCircle },
  { name: "Banners", href: "/banners", icon: ImageIcon },
  { name: "Categories", href: "/categories", icon: FolderOpen },
  { name: "Services", href: "/services", icon: ListChecks },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Alerts", href: "/alerts", icon: Bell },
];

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          collapsed ? "w-[70px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Nova Beauty" className="h-9 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-sidebar-foreground">Nova Beauty</span>
                <span className="text-xs text-sidebar-muted">Super Admin</span>
              </div>
            </div>
          )}
          {collapsed && (
            <img src="/logo.png" alt="Nova Beauty" className="h-9 w-9 object-contain mx-auto" />
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "nav-item",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-0")} />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>

          <Separator className="my-4 bg-sidebar-border" />

          <nav className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "nav-item",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-0")} />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">
              {navigation.find((n) => n.href === location.pathname)?.name ||
                secondaryNavigation.find((n) => n.href === location.pathname)?.name ||
                (location.pathname.startsWith("/beauticians/") ? "Beautician profile" : null) ||
                (location.pathname.startsWith("/users/") ? "User profile" : null) ||
                (location.pathname.startsWith("/appointments/") ? "Appointment details" : null) ||
                "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                3
              </span>
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">{user?.name?.charAt(0) ?? "A"}</span>
              </div>
              {!collapsed && (
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-medium text-foreground">Super Admin</span>
                  <span className="text-xs text-muted-foreground">{user?.email ?? ""}</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { logout(); navigate("/login"); }}
                title="Logout"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 scrollbar-thin">
          {children}
        </div>
      </main>
    </div>
  );
}
