import { http } from "@/shared/lib/http";

import type { EnterTenantContextPayload } from "./types";

export async function enterBusinessContext(payload: EnterTenantContextPayload) {
  await http.post("/platform/enter-business-context", payload);
}

export async function clearBusinessContext() {
  await http.post("/platform/clear-business-context");
}
