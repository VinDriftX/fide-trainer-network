import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const bootstrapConfiguredAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!email || !password) {
    throw new Error("Admin account is not configured.");
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
  if (listError) throw new Error(listError.message);

  let user = existingUsers.users.find((item) => item.email?.toLowerCase() === email) ?? null;

  if (!user) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: "FIDE Admin", full_name: "FIDE Admin" },
    });
    if (error) throw new Error(error.message);
    user = data.user;
  }

  if (!user) throw new Error("Could not prepare the admin account.");

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: user.id,
    email,
    full_name: "FIDE Admin",
    display_name: "FIDE Admin",
  });
  if (profileError) throw new Error(profileError.message);

  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: user.id, role: "admin" as any }, { onConflict: "user_id,role" });
  if (roleError) throw new Error(roleError.message);

  return { ok: true, email };
});

// List all users with their roles + basic profile
export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: adminError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (adminError) throw new Error(adminError.message);
    if (!isAdmin) throw new Error("Forbidden: admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users, error: uErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (uErr) throw new Error(uErr.message);
    const ids = users.users.map((u) => u.id);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", ids);
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name, fide_id, phone").in("id", ids);
    return users.users.map((u) => ({
      id: u.id,
      email: u.email ?? null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      banned_until: (u as any).banned_until ?? null,
      roles: (roles ?? []).filter((r) => r.user_id === u.id).map((r) => r.role),
      profile: (profiles ?? []).find((p) => p.id === u.id) ?? null,
    }));
  });

export const adminSetUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), role: z.enum(["admin", "moderator", "user"]), grant: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: adminError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (adminError) throw new Error(adminError.message);
    if (!isAdmin) throw new Error("Forbidden: admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role as any });
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role as any);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminBanUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), durationHours: z.number().min(0) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: adminError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (adminError) throw new Error(adminError.message);
    if (!isAdmin) throw new Error("Forbidden: admin only");
    if (data.userId === context.userId) throw new Error("Cannot ban yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ban_duration = data.durationHours === 0 ? "none" : `${data.durationHours}h`;
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { ban_duration } as any);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: adminError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (adminError) throw new Error(adminError.message);
    if (!isAdmin) throw new Error("Forbidden: admin only");
    if (data.userId === context.userId) throw new Error("Cannot delete yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
