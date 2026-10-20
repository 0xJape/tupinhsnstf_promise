import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminRole = "research_admin" | "referral_staff";

export const requireAdmin = cache(async (roles?: AdminRole[]) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: membership } = await supabase
    .from("admin_memberships")
    .select("role, active")
    .eq("user_id", user.id)
    .maybeSingle();
  const role = membership?.role as AdminRole | undefined;
  if (!membership?.active || !role || (roles && !roles.includes(role))) redirect("/home");

  return { supabase, user, role };
});
