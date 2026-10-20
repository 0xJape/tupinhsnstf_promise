import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireAdmin();
  return <AdminShell role={role}>{children}</AdminShell>;
}
