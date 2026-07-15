import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  fideId: z.string().trim().min(3, "FIDE ID required").max(20),
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email(),
  password: z.string().min(6, "At least 6 characters"),
  address: z.string().trim().min(2).max(200),
});
type Values = z.infer<typeof schema>;

function RegisterPage() {
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
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome! Redirecting to your profile.");
    navigate({ to: "/profile" });
  };

  const fields: { name: keyof Values; label: string; type?: string }[] = [
    { name: "fideId", label: "FIDE ID" },
    { name: "fullName", label: "Full Name" },
    { name: "phone", label: "Phone Number", type: "tel" },
    { name: "email", label: "Email", type: "email" },
    { name: "password", label: "Password", type: "password" },
    { name: "address", label: "Address" },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="font-display text-3xl">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {fields.map((f) => (
              <div key={f.name} className="grid gap-1.5">
                <Label>{f.label}</Label>
                <Input type={f.type ?? "text"} {...form.register(f.name)} />
                {form.formState.errors[f.name] && (
                  <p className="text-xs text-destructive">{String(form.formState.errors[f.name]?.message)}</p>
                )}
              </div>
            ))}
            <Button type="submit" variant="hero" className="mt-2" disabled={form.formState.isSubmitting}>
              Register
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/auth" className="font-medium text-primary hover:underline">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
