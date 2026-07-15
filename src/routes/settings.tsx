import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Moon, Sun, Bell, Globe, KeyRound } from "lucide-react";
import { LANGUAGES, setLanguage, type LanguageCode } from "@/lib/i18n";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — FIDE Trainer Network" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, profile, logout, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [emailNotif, setEmailNotif] = useState(true);
  const [reminders, setReminders] = useState(true);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">{t("common.signInRequired")}</h1>
        <p className="mt-2 text-muted-foreground">{t("common.signInToSettings")}</p>
        <Button className="mt-6" variant="hero" asChild><Link to="/auth">{t("nav.login")}</Link></Button>
      </div>
    );
  }

  const updateProfile = async (patch: { full_name?: string }) => {
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (error) toast.error(error.message);
    else { toast.success(t("settings.saved")); refreshProfile(); }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="mb-8 font-display text-4xl font-bold">{t("settings.title")}</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5" />{t("settings.appearance")}</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="font-medium">{t("settings.theme")}</div>
              <div className="text-sm text-muted-foreground">{t("settings.themeDesc")}</div>
            </div>
            <div className="flex gap-2">
              <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")}><Sun className="mr-1 h-4 w-4" />{t("settings.light")}</Button>
              <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}><Moon className="mr-1 h-4 w-4" />{t("settings.dark")}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />{t("settings.languageCard")}</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">{t("settings.languageDesc")}</div>
            <Select value={i18n.language} onValueChange={(v) => setLanguage(v as LanguageCode)}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.native} ({l.label})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("settings.account")}</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>{t("profile.fullName")}</Label>
              <Input defaultValue={profile?.full_name ?? ""} onBlur={(e) => updateProfile({ full_name: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>{t("auth.email")}</Label>
              <Input type="email" defaultValue={user.email ?? ""} disabled />
            </div>
            <Button
              variant="outline"
              className="w-fit"
              onClick={async () => {
                if (!user.email) return;
                const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) toast.error(error.message);
                else toast.success(t("settings.passwordResetSent"));
              }}
            >
              <KeyRound className="mr-1 h-4 w-4" />{t("settings.changePassword")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />{t("settings.notifications")}</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between"><Label>{t("settings.emailNotif")}</Label><Switch checked={emailNotif} onCheckedChange={setEmailNotif} /></div>
            <div className="flex items-center justify-between"><Label>{t("settings.eventReminders")}</Label><Switch checked={reminders} onCheckedChange={setReminders} /></div>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-fit" onClick={logout}><LogOut className="mr-1 h-4 w-4" />{t("nav.logout")}</Button>
      </div>
    </div>
  );
}
