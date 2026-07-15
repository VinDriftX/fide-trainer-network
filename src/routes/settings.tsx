import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — FIDE Trainer Network" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [emailNotif, setEmailNotif] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [lang, setLang] = useState("en");

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Sign in required</h1>
        <p className="mt-2 text-muted-foreground">Please log in to manage your settings.</p>
        <Button className="mt-6" variant="hero" asChild><Link to="/auth">Login</Link></Button>
      </div>
    );
  }

  const updateProfile = async (patch: { full_name?: string }) => {
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); refreshProfile(); }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="mb-8 font-display text-4xl font-bold">Settings</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5" />Appearance</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-sm text-muted-foreground">Choose light or dark mode.</div>
            </div>
            <div className="flex gap-2">
              <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")}><Sun className="mr-1 h-4 w-4" />Light</Button>
              <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}><Moon className="mr-1 h-4 w-4" />Dark</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Full Name</Label>
              <Input defaultValue={profile?.full_name ?? ""} onBlur={(e) => updateProfile({ full_name: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Email</Label>
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
                else toast.success("Password reset email sent");
              }}
            >
              <KeyRound className="mr-1 h-4 w-4" />Change Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between"><Label>Email Notifications</Label><Switch checked={emailNotif} onCheckedChange={setEmailNotif} /></div>
            <div className="flex items-center justify-between"><Label>Event Reminders</Label><Switch checked={reminders} onCheckedChange={setReminders} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />Support Language</CardTitle></CardHeader>
          <CardContent>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="my">Burmese (မြန်မာ)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-fit" onClick={logout}><LogOut className="mr-1 h-4 w-4" />Log out</Button>
      </div>
    </div>
  );
}
