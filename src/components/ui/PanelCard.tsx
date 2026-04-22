import type { PropsWithChildren, ReactNode } from "react";

interface PanelCardProps extends PropsWithChildren {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PanelCard({
  title,
  description,
  action,
  children,
}: PanelCardProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          {description ? (
            <p className="text-xs leading-5 text-zinc-600">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
