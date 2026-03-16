import { redirect } from "next/navigation";

import { APP_ROUTES } from "@/shared/lib/routes";

export default function SuperadminIndexPage() {
  redirect(APP_ROUTES.superadminEnterContext);
}
