import type { Feature } from "../../types/feature";
import { StatusBadge } from "./StatusBadge";

interface FeatureCardProps {
  feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-900">{feature.title}</h3>
        <StatusBadge label={feature.tag} tone="accent" />
      </div>
      <p className="text-sm leading-6 text-zinc-600">{feature.description}</p>
    </article>
  );
}
