import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, BookOpen, Users, LineChart, Package,
  ShoppingCart, FileText, CreditCard, BarChart, Truck,
  MapPin, Bell, MessageSquare, LifeBuoy, Settings,
  Shield, Tag, User as UserIcon, LogOut, Archive, Menu, X,
} from "lucide-react";
import { useLogout, useGetNotifications, useGetMessages } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { parsePermissions, canView } from "@/lib/permissions";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useLogout();
  const { data: notifications } = useGetNotifications();
  const { data: messages } = useGetMessages();

  const unreadNotifications = notifications?.filter(n => !n.read).length ?? 0;
  const unreadMessages = messages?.filter(m => !m.read).length ?? 0;

  const perms = parsePermissions(user?.sidebarPermissions, user?.role ?? "user");

  const handleLogout = async () => {
    try { await logoutMutation.mutateAsync(); } catch {}
    finally { logout(); setLocation("/login"); }
  };

  const allNavItems = [
    { key: "dashboard",       name: "Dashboard",        href: "/dashboard",        icon: LayoutDashboard },
    { key: "ledger",          name: "Account Ledger",   href: "/ledger",           icon: BookOpen },
    { key: "hr",              name: "HR",               href: "/hr",               icon: Users },
    { key: "sales",           name: "Sales",            href: "/sales",            icon: LineChart },
    { key: "products",        name: "Products",         href: "/products",         icon: Package },
    { key: "inventory",       name: "Inventory",        href: "/inventory",        icon: Archive },
    { key: "purchase_orders", name: "Purchase Orders",  href: "/orders/purchase",  icon: ShoppingCart },
    { key: "sales_orders",    name: "Sales Orders",     href: "/orders/sales",     icon: ShoppingCart },
    { key: "invoices",        name: "Invoices",         href: "/invoices",         icon: FileText },
    { key: "expenses",        name: "Expenses",         href: "/expenses",         icon: CreditCard },
    { key: "reports",         name: "Reports",          href: "/reports",          icon: BarChart },
    { key: "tracking",        name: "Tracking",         href: "/tracking",         icon: MapPin },
    { key: "logistics",       name: "Logistics",        href: "/logistics",        icon: Truck },
    { key: "notifications",   name: "Notifications",    href: "/notifications",    icon: Bell,          badge: unreadNotifications },
    { key: "messages",        name: "Messages",         href: "/messages",         icon: MessageSquare, badge: unreadMessages },
    { key: "support",         name: "Support",          href: "/support",          icon: LifeBuoy },
  ];

  const allAdminItems = [
    { name: "Admin Panel",  href: "/admin/panel",       icon: Settings },
    { name: "Roles",        href: "/admin/roles",       icon: Shield },
    { name: "Promotions",   href: "/admin/promotions",  icon: Tag },
    { name: "Profile",      href: "/profile",           icon: UserIcon },
  ];

  const isAdmin = user?.role === "admin";

  const navItems = isAdmin
    ? allNavItems
    : allNavItems.filter(item => canView(perms, item.key));

  const adminItems = isAdmin
    ? allAdminItems
    : allAdminItems.filter(item => item.href === "/profile");

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-sidebar-border/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-black text-sm">H</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-sidebar-primary tracking-tight leading-none">HYGLOW</h1>
              <p className="text-[10px] text-sidebar-foreground/40 uppercase tracking-widest leading-none mt-0.5">Enterprise ERP</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest mb-2 px-2">Main Menu</p>
            <nav className="space-y-0.5">
              {navItems.length === 0 ? (
                <p className="text-xs text-sidebar-foreground/30 px-3 py-2">No modules assigned</p>
              ) : navItems.map((item) => {
                const active = location === item.href || location.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "opacity-100" : "opacity-60"}`} />
                      <span className="truncate">{item.name}</span>
                    </span>
                    {item.badge && item.badge > 0 ? (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${active ? "bg-white/20 text-white" : "bg-primary text-primary-foreground"}`}>
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          {adminItems.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest mb-2 px-2">Administration</p>
              <nav className="space-y-0.5">
                {adminItems.map((item) => {
                  const active = location === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "opacity-100" : "opacity-60"}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="flex-shrink-0 border-t border-sidebar-border/30 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent/60 transition-colors">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <span className="text-sidebar-primary-foreground font-bold text-xs">
                {user?.name?.slice(0, 2).toUpperCase() ?? "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">{user?.name ?? "User"}</p>
              <p className="text-[11px] text-sidebar-foreground/50 truncate leading-tight">{user?.email ?? ""}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex shrink-0 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={mobileNavOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted md:hidden"
            onClick={() => setMobileNavOpen(true)}
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="hidden flex-1 sm:block">
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/notifications" className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[9px] text-primary-foreground font-bold flex items-center justify-center">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>
            <Link href="/messages" className="relative text-muted-foreground hover:text-foreground transition-colors">
              <MessageSquare className="w-5 h-5" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[9px] text-primary-foreground font-bold flex items-center justify-center">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>
            <div className="w-px h-5 bg-border" />
            <Link href="/profile" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="hidden sm:inline">{user?.name?.split(" ")[0] ?? "User"}</span>
            </Link>
          </div>
        </header>
        <main className="dashboard-main min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
