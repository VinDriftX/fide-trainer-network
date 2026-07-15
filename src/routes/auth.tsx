import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Login — FIDE Trainer Network" }] }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
type Values = z.infer<typeof schema>;

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const form = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    const { error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
    if (error) { toast.error(error.message); return; }
    toast.success(t("auth.signedIn"));
    navigate({ to: "/profile" });
  };

  const googleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/profile` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <Card className="shadow-elegant">
        <CardHeader><CardTitle className="font-display text-3xl">{t("auth.welcomeBack")}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>{t("auth.email")}</Label>
              <Input type="email" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-xs text-destructive">{t("auth.invalidEmail")}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label>{t("auth.password")}</Label>
              <Input type="password" {...form.register("password")} />
              {form.formState.errors.password && <p className="text-xs text-destructive">{t("common.required")}</p>}
            </div>
            <Button type="submit" variant="hero" disabled={form.formState.isSubmitting}>{t("nav.login")}</Button>
          </form>

          <div className="my-6 flex items-center gap-2 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />{t("common.or")}<div className="h-px flex-1 bg-border" /></div>

          <div className="grid gap-2">
            <Button variant="outline" onClick={googleLogin}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              {t("auth.continueGoogle")}
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.newHere")} <Link to="/register" className="font-medium text-primary hover:underline">{t("auth.createAccount")}</Link>
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Administrator? <Link to="/admin/login" className="font-medium text-primary hover:underline">Admin login →</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
