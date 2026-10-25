export default function Footer() {
  return (
    <footer className="relative border-t border-pink-500/15 bg-[#080918]/80 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["Guuu", "Devi ji", "Kallo", "Rehtal"].map((n) => (
            <span
              key={n}
              className="rounded-full border border-pink-500/25 bg-pink-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-pink-200"
            >
              {n}
            </span>
          ))}
        </div>
        <p className="text-sm text-pink-100/70">
          Made with <span className="text-pink-400">💜</span> by your best friend — for the one and
          only Taniyaaa.
        </p>
        <p className="text-xs text-purple-200/50">
          No vacancy in the bestie position — this friendship is permanent. ✨
        </p>
      </div>
    </footer>
  );
}
