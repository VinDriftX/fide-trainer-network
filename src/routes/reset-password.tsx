import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — FIDE Trainer Network" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    if (pwd.length < 6) { toast.error("At least 6 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); navigate({ to: "/profile" }); }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <Card className="shadow-elegant">
        <CardHeader><CardTitle className="font-display text-3xl">Set new password</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>New password</Label>
            <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
          </div>
          <Button variant="hero" onClick={submit} disabled={loading}>Update password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
