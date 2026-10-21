import { useState } from "react";
import { ADDONS_URL } from "../content";

export function Announcement() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="bg-charcoal text-white">
      <div className="wrap flex h-11 items-center gap-4 text-[14px]">
        <button type="button" onClick={() => setOpen(false)} aria-label="Dismiss" className="-ml-2 grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-white/10">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
        <p className="min-w-0 flex-1 truncate text-center">Org add-ons are here: make Brag Center native to your company.</p>
        <a href={ADDONS_URL} className="shrink-0 underline underline-offset-4 hover:no-underline">
          Learn more
        </a>
      </div>
    </div>
  );
}
