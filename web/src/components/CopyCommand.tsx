import { useState } from "react";
import { INSTALL } from "../content";

export function CopyCommand({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the command stays selectable */
    }
  };
  const skin =
    tone === "dark"
      ? "bg-white/[0.07] text-white hover:bg-white/[0.12] border-white/10"
      : "bg-black/[0.04] text-black hover:bg-black/[0.07] border-black/10";
  return (
    <button
      type="button"
      onClick={copy}
      className={`group inline-flex max-w-full items-center gap-3 rounded-full border py-2.5 pl-4 pr-2.5 text-left transition-colors sm:gap-4 sm:py-3 sm:pl-5 sm:pr-3 ${skin} ${className}`}
      aria-label={`Copy install command: ${INSTALL}`}
    >
      <code className="min-w-0 truncate font-mono text-[12px] sm:text-[15px]">
        <span className="hidden opacity-40 select-none sm:inline">$ </span>
        {INSTALL}
      </code>
      <span
        aria-live="polite"
        className={`grid h-7 shrink-0 place-items-center rounded-full px-2 text-[13px] transition-colors sm:px-3 ${
          tone === "dark" ? "bg-white text-black" : "bg-black text-white"
        }`}
      >
        <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 sm:hidden" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
          {copied ? <path d="M3 8.5l3 3 7-7" /> : <><rect x="5" y="5" width="8" height="8" rx="1.5" /><path d="M3 10.5V4a1 1 0 0 1 1-1h6.5" /></>}
        </svg>
      </span>
    </button>
  );
}
