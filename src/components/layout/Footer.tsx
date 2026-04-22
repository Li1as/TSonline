export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-zinc-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-medium text-zinc-900">Frontend Prototype</p>
          <p>Course project homepage for an online tabletop platform and editor.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["React", "TypeScript", "Vite", "Tailwind", "react-konva"].map(
            (item) => (
              <span
                key={item}
                className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700"
              >
                {item}
              </span>
            ),
          )}
        </div>
      </div>
    </footer>
  );
}
