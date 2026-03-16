import { Badge } from "@/components/ui/badge";

import { getContactTypeLabel } from "../constants";

type ContactTypeBadgeProps = {
  type?: string | null;
};

function ContactTypeBadge({ type }: ContactTypeBadgeProps) {
  const normalizedType = type?.trim().toLowerCase() || "";
  const className =
    normalizedType === "customer"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : normalizedType === "supplier"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : normalizedType === "both"
          ? "border-violet-200 bg-violet-50 text-violet-700"
          : "border-zinc-200 bg-zinc-100 text-zinc-700";

  return (
    <Badge className={className} variant="outline">
      {getContactTypeLabel(type)}
    </Badge>
  );
}

export { ContactTypeBadge };
