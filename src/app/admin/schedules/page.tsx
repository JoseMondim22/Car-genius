import { getSession } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import SchedulesView from "./SchedulesView";

export default async function SchedulesPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <AppShell session={session}>
      <SchedulesView />
    </AppShell>
  );
}
