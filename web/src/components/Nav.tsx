import { REPO } from "../content";

const links = [
  { href: "#sources", label: "Sources" },
  { href: "#hood", label: "How it works" },
  { href: "#run", label: "A run" },
  { href: "#install", label: "Install" },
];

export function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <nav className="wrap flex h-[76px] items-center justify-between">
        <a href="#top" className="text-[22px] font-medium tracking-[-0.04em]">
          Brag <span className="accent">Center</span>
        </a>
        <ul className="hidden items-center gap-8 text-[15px] text-white/70 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href={REPO} className="rounded-full bg-white px-5 py-2.5 text-[15px] text-black transition-colors hover:bg-lime">
          GitHub ↗
        </a>
      </nav>
    </header>
  );
}
