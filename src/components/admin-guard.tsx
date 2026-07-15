import { useEffect, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Shield, LayoutDashboard, Calendar, Receipt, Users, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV: { to: string; label: string; icon: any; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/tax-support", label: "Tax Support", icon: Receipt },
  { to: "/admin/partners", label: "Partners", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/admin/login", replace: true });
    else if (!isAdmin) navigate({ to: "/", replace: true });
  }, [loading, user, isAdmin, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2 pr-3 border-r">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-display font-bold">Admin Portal</span>
        </div>
        <nav className="flex flex-wrap gap-1">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to as any} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <n.icon className="h-4 w-4" />{n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={async () => { await logout(); navigate({ to: "/admin/login" }); }}>
            <LogOut className="mr-1 h-4 w-4" />Sign out
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
