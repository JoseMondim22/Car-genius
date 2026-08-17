import { getSession } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import EmployeesView from "./EmployeesView";

export default async function EmployeesPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <AppShell session={session}>
      <EmployeesView />
    </AppShell>
  );
}
