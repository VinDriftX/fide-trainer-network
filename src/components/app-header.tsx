import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, UserCircle2, Moon, Sun, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme";
import { LanguageSwitcher } from "@/components/language-switcher";

export function AppHeader() {
  const { t } = useTranslation();
  const { user, profile, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const displayName = profile?.full_name || user?.email || "";
  const initials = displayName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md sm:px-6">
      <SidebarTrigger />
      <Link to="/" className="flex min-w-0 items-center gap-2">
        <Crown className="h-5 w-5 shrink-0 text-primary" />
        <span className="truncate font-display text-lg font-bold sm:text-xl">{t("brand.name")}</span>
      </Link>
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" onClick={toggle} aria-label={t("nav.toggleTheme")}>
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border bg-card px-2 py-1 pr-3 transition hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">{displayName}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="truncate">{displayName}</div>
                <div className="truncate text-xs font-normal text-muted-foreground">{user.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile"><UserCircle2 className="mr-2 h-4 w-4" />{t("nav.myProfile")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings"><UserCircle2 className="mr-2 h-4 w-4" />{t("nav.settings")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />{t("nav.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth"><LogIn className="mr-1 h-4 w-4" />{t("nav.login")}</Link>
            </Button>
            <Button size="sm" asChild variant="gold">
              <Link to="/register">{t("nav.signUp")}</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
