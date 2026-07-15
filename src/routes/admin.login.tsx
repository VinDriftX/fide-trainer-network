import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { bootstrapConfiguredAdmin } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — FIDE Trainer Network" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const bootstrapAdmin = useServerFn(bootstrapConfiguredAdmin);
  const { user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin", replace: true });
  }, [loading, user, isAdmin, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      await bootstrapAdmin();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Admin account setup failed.");
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) { toast.error(error.message); setSubmitting(false); return; }
    // Verify admin role before continuing
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user!.id);
    const admin = !!roles?.some((r) => r.role === "admin");
    if (!admin) {
      await supabase.auth.signOut();
      toast.error("This account does not have admin access.");
      setSubmitting(false);
      return;
    }
    toast.success("Welcome, admin.");
    navigate({ to: "/admin", replace: true });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Shield className="h-5 w-5" /></div>
          <CardTitle className="font-display text-3xl">Admin Portal</CardTitle>
          <p className="text-sm text-muted-foreground">Restricted access. Administrator credentials required.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Password</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" variant="hero" disabled={submitting}>{submitting ? "Signing in…" : "Sign in as Admin"}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Not an admin? <Link to="/auth" className="font-medium text-primary hover:underline">User login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
