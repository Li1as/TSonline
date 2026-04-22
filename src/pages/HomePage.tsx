import { Footer } from "../components/layout/Footer";
import { TopBar } from "../components/layout/TopBar";
import { BoardWorkspace } from "../components/home/BoardWorkspace";
import { FeatureSection } from "../components/home/FeatureSection";
import { HeroPanel } from "../components/home/HeroPanel";
import { SidePanel } from "../components/home/SidePanel";

export function HomePage() {
  return (
    <div className="min-h-screen bg-stone-100 text-zinc-900">
      <TopBar />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <HeroPanel />

        <section
          aria-label="Platform workspace preview"
          className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_360px]"
        >
          <BoardWorkspace />
          <SidePanel />
        </section>

        <FeatureSection />
      </main>
      <Footer />
    </div>
  );
}
