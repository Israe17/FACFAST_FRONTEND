import { redirect } from "next/navigation";

import { APP_ROUTES } from "@/shared/lib/routes";

export default function LegacyBusinessSettingsPage() {
  redirect(APP_ROUTES.business);
}
