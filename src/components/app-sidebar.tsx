import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Calendar, GraduationCap, Receipt, Users, ShoppingBag, Settings, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { title: t("nav.home"), url: "/", icon: Home },
    { title: t("nav.events"), url: "/events", icon: Calendar },
    { title: t("nav.exams"), url: "/exams", icon: GraduationCap },
    { title: t("nav.taxSupport"), url: "/tax-support", icon: Receipt },
    { title: t("nav.trainers"), url: "/trainers", icon: Users },
    { title: t("nav.shop"), url: "/shop", icon: ShoppingBag },
    { title: t("nav.settings"), url: "/settings", icon: Settings },
  ] as const;
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-elegant">
            <Crown className="h-5 w-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate font-display text-sm font-bold">{t("brand.short")}</div>
            <div className="truncate text-xs text-muted-foreground">{t("brand.tagline")}</div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
