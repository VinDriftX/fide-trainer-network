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

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — FIDE Trainer Network" }] }),
  component: RegisterPage,
});

const schema = z.object({
  fideId: z.string().trim().min(3).max(20),
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email(),
  password: z.string().min(6),
  address: z.string().trim().min(2).max(200),
});
type Values = z.infer<typeof schema>;

function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const form = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    const { error } = await supabase.auth.signUp({
      email: v.email,
      password: v.password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
        data: {
          fide_id: v.fideId,
          full_name: v.fullName,
          phone: v.phone,
          address: v.address,
        },
      },
    });
    if (error) { toast.error(error.message); return; }
    toast.success(t("auth.welcome"));
    navigate({ to: "/profile" });
  };

  const fields: { name: keyof Values; label: string; type?: string }[] = [
    { name: "fideId", label: t("taxSupport.fideId") },
    { name: "fullName", label: t("auth.fullName") },
    { name: "phone", label: t("auth.phoneReq"), type: "tel" },
    { name: "email", label: t("auth.email"), type: "email" },
    { name: "password", label: t("auth.password"), type: "password" },
    { name: "address", label: t("auth.addressLabel") },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="font-display text-3xl">{t("auth.registerTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {fields.map((f) => (
              <div key={f.name} className="grid gap-1.5">
                <Label>{f.label}</Label>
                <Input type={f.type ?? "text"} {...form.register(f.name)} />
                {form.formState.errors[f.name] && (
                  <p className="text-xs text-destructive">{t("common.required")}</p>
                )}
              </div>
            ))}
            <Button type="submit" variant="hero" className="mt-2" disabled={form.formState.isSubmitting}>
              {t("nav.signUp")}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("auth.haveAccount")} <Link to="/auth" className="font-medium text-primary hover:underline">{t("nav.login")}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
