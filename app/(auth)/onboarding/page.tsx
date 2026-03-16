import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getServerSession } from "@/features/auth/api";
import { getLandingRoute } from "@/features/auth/utils";

export default async function LegacyOnboardingPage() {
  const cookieStore = await cookies();
  const session = await getServerSession(cookieStore.toString());

  if (session) {
    redirect(getLandingRoute(session));
  }

  redirect(getLandingRoute(null));
}
