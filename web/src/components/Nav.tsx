import { REPO } from "../content";
import { Mark } from "./Logo";

const links = [
  ["Portfolios", "#portfolios"],
  ["Sources", "#sources"],
  ["How it works", "#run"],
  ["Install", "#install"],
];

export function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`whitespace-nowrap font-semibold uppercase ${className}`}>Brag Center</span>;
}

export function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-white">
      <nav className="wrap grid h-[72px] grid-cols-[1fr_auto] items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
        <a href="#top" aria-label="Brag Center home" className="flex items-center gap-2.5 justify-self-start">
          <Mark className="h-[22px] w-auto sm:h-6" />
          <Wordmark className="text-[14px] tracking-[0.18em] sm:text-[17px] sm:tracking-[0.24em]" />
        </a>
        <ul className="hidden items-center gap-9 text-[15px] md:flex">
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="underline-offset-[6px] hover:underline">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 justify-self-end">
          <a href={REPO} aria-label="Source on GitHub" className="hidden h-10 w-10 place-items-center rounded-full hover:bg-mist min-[420px]:grid">
            <svg viewBox="0 0 16 16" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.66 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
            </svg>
          </a>
          <a href="#install" className="btn btn-solid h-10 px-4 text-[14px] sm:px-5">
            Get the skill
          </a>
        </div>
      </nav>
    </header>
  );
}
