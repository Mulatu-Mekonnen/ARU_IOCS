import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import AgendaManagementClient from "./AgendaManagementClient";

export default async function Page() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return <AgendaManagementClient />;
}
