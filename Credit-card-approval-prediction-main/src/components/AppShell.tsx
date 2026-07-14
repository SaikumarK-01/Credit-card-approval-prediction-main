import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Sparkles, ClipboardList, BarChart3, GitCompare, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/predict", label: "New Prediction", icon: Sparkles },
  { to: "/applications", label: "Applications", icon: ClipboardList },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/models", label: "Model Comparison", icon: GitCompare },
];

export function AppShell() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-6 py-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary shadow-glow grid place-items-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-semibold leading-tight">CreditIQ</div>
              <div className="text-xs text-sidebar-foreground/60">Approval Intelligence</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="rounded-lg bg-sidebar-accent p-3">
            <div className="text-xs text-sidebar-foreground/60">Champion Model</div>
            <div className="text-sm font-semibold">XGBoost · 93.7%</div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-30 bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center justify-between border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">CreditIQ</span>
          </Link>
          <nav className="flex gap-1">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} className={cn("p-2 rounded-md", active ? "bg-sidebar-primary" : "")}>
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
