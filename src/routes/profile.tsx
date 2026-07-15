import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, UserCircle2, Receipt } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — FIDE Trainer Network" }] }),
  component: ProfilePage,
});

type Enrollment = {
  id: string; event_id: string; event_name: string; payment_method: string; status: string; created_at: string;
};
type Payment = {
  id: string; category: string; description: string; amount: number; currency: string;
  payment_method: string; reference_id: string | null; status: string; created_at: string;
};

function ProfilePage() {
  const { t } = useTranslation();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [form, setForm] = useState({ full_name: "", fide_id: "", phone: "", address: "" });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        fide_id: profile.fide_id ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase.from("event_enrollments")
      .select("id, event_id, event_name, payment_method, status, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setEnrollments((data as Enrollment[]) ?? []));
    supabase.from("payment_history")
      .select("id, category, description, amount, currency, payment_method, reference_id, status, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPayments((data as Payment[]) ?? []));
  }, [user]);

  if (loading) return <div className="p-10 text-center text-muted-foreground">{t("common.loading")}</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">{t("common.signInRequired")}</h1>
        <p className="mt-2 text-muted-foreground">{t("common.signInToProfile")}</p>
        <Button className="mt-6" variant="hero" asChild><Link to="/auth">{t("nav.login")}</Link></Button>
      </div>
    );
  }

  const save = async () => {
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
    if (error) toast.error(error.message);
    else { toast.success(t("profile.saved")); refreshProfile(); }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-elegant">
          <UserCircle2 className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold">{t("profile.title")}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader><CardTitle>{t("profile.personalInfo")}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label>{t("profile.fullName")}</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>{t("profile.fideId")}</Label>
              <Input value={form.fide_id} onChange={(e) => setForm({ ...form, fide_id: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>{t("profile.phone")}</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="grid gap-1.5 sm:col-span-2"><Label>{t("profile.address")}</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <Button className="sm:col-span-2 w-fit" variant="hero" onClick={save}>{t("profile.saveChanges")}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />{t("profile.myEvents")}</CardTitle></CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("profile.noEvents")} <Link to="/events" className="text-primary underline">{t("profile.browseEvents")}</Link>.
              </p>
            ) : (
              <div className="grid gap-3">
                {enrollments.map((e) => (
                  <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                    <div>
                      <div className="font-medium">{e.event_name}</div>
                      <div className="text-xs text-muted-foreground">{t("profile.enrolled")} {new Date(e.created_at).toLocaleDateString()} • {e.payment_method}</div>
                    </div>
                    <Badge variant={e.status === "confirmed" ? "default" : "secondary"}>{e.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" />{t("profile.paymentHistory")}</CardTitle></CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("profile.noPayments")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground">
                    <tr className="border-b">
                      <th className="py-2 pr-3">{t("profile.colDate")}</th>
                      <th className="py-2 pr-3">{t("profile.colCategory")}</th>
                      <th className="py-2 pr-3">{t("profile.colDescription")}</th>
                      <th className="py-2 pr-3">{t("profile.colMethod")}</th>
                      <th className="py-2 pr-3">{t("profile.colReference")}</th>
                      <th className="py-2 pr-3 text-right">{t("profile.colAmount")}</th>
                      <th className="py-2 pr-3">{t("profile.colStatus")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-3 pr-3 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="py-3 pr-3">{p.category}</td>
                        <td className="py-3 pr-3">{p.description}</td>
                        <td className="py-3 pr-3">{p.payment_method}</td>
                        <td className="py-3 pr-3 font-mono text-xs">{p.reference_id ?? "—"}</td>
                        <td className="py-3 pr-3 text-right font-medium">{p.amount > 0 ? `$${Number(p.amount).toFixed(2)}` : "—"}</td>
                        <td className="py-3 pr-3"><Badge variant={p.status === "confirmed" ? "default" : "secondary"}>{p.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
