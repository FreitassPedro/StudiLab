import { getCurrentUser } from "@/server/actions/getCurrentUser";
import { redirect } from "next/navigation";

export default async function Home() {
  const currentUser = await getCurrentUser();

  if (currentUser?.id) {
    redirect("/dashboard")
  } else {
    redirect("/sign-in");
  }
}
