import type { ReactNode } from "react";

type CatalogSectionCardProps = {
  action?: ReactNode;
  children: ReactNode;
  description: string;
  title: string;
};

function CatalogSectionCard({
  action,
  children,
  description,
  title,
}: CatalogSectionCardProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>

      {children}
    </section>
  );
}

export { CatalogSectionCard };
