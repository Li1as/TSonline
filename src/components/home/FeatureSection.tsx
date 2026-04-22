import { features } from "../../mock/features";
import { FeatureCard } from "../ui/FeatureCard";

export function FeatureSection() {
  return (
    <section className="space-y-4">
      <div className="max-w-2xl space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.08em] text-zinc-500">
          Planned Platform Modules
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
          A frontend structure that can grow into rooms, boards, and editor tools.
        </h2>
        <p className="text-base leading-7 text-zinc-600">
          These cards summarize the main modules the platform is designed to support
          after real multiplayer and board interactions are added.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </section>
  );
}
