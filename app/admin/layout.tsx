import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "staff") {
    redirect("/sign-in?callbackUrl=%2Fadmin");
  }
  return children;
}
