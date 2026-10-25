import { useEffect, useState } from "react";

const LINKS = [
  { href: "#memories", label: "Memories" },
  { href: "#voice", label: "Her Voice" },
  { href: "#letter", label: "Letter" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#contract", label: "Contract" },
  { href: "#hugs", label: "Hugs" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-[#0B0C1E]/75 border-b border-pink-500/15 shadow-[0_8px_32px_rgba(255,117,143,0.12)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <a
          href="#"
          data-testid="nav-brand"
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight group"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-sm shadow-[0_0_18px_rgba(255,117,143,0.45)] group-hover:scale-110 transition-transform">
            🎂
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-purple-300">
            Taniyaaa
          </span>
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-pink-100/75 transition-colors hover:bg-pink-500/10 hover:text-pink-200"
            >
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#hugs"
          data-testid="nav-hugs-cta"
          className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-1.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,117,143,0.35)] transition-transform hover:scale-105 active:scale-95"
        >
          Send Hug 💗
        </a>
      </nav>
    </header>
  );
}
