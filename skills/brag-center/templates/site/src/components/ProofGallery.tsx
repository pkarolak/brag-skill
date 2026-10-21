import { useRef, useState } from "react";
import type { Proof } from "../content/story";
import { useAsset } from "../lib/lock";
import { ExternalLink } from "./ExternalLink";

function ProofImage({ src, ...rest }: { src: string } & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src">) {
  const url = useAsset(src);
  return url ? <img src={url} {...rest} /> : null;
}

const labels: Record<string, string> = {
  jira: "Jira",
  confluence: "Confluence",
  linear: "Linear",
  notion: "Notion",
  gdrive: "Google Drive",
  sharepoint: "SharePoint",
  figma: "Figma",
  figjam: "FigJam",
  miro: "Miro",
  mural: "Mural",
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
  slack: "Slack",
  teams: "Teams",
  glean: "Doc",
  app: "Live app",
  other: "Source",
};

export const sourceLabel = (s: string) => labels[s] ?? s.replace(/(^|-)(\w)/g, (_, sep, c) => (sep ? " " : "") + c.toUpperCase());

type Props = {
  items: Proof[];
  title?: string;
  /** Styling hooks so each run can restyle without rewriting behavior. */
  classNames?: Partial<Record<"root" | "title" | "grid" | "item" | "image" | "meta" | "label" | "caption" | "dialog", string>>;
};

/** "Behind the work": screenshots of the real artifacts, each linking to its source. Lightbox on click. */
export function ProofGallery({ items, title = "Behind the work", classNames: c = {} }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Proof | null>(null);
  if (!items.length) return null;

  const show = (p: Proof) => {
    setOpen(p);
    dialog.current?.showModal();
  };

  return (
    <section data-print="proof" aria-labelledby="proof-title" className={c.root}>
      <h2 id="proof-title" className={c.title}>
        {title}
      </h2>
      <ul className={c.grid ?? "grid gap-6 sm:grid-cols-2"}>
        {items.map((p) => (
          <li key={p.src} className={c.item}>
            <figure>
              <button type="button" onClick={() => show(p)} className="block w-full cursor-zoom-in text-left" aria-label={`Enlarge: ${p.caption}`}>
                <ProofImage className={c.image ?? "w-full"} src={p.src} alt={p.caption} width={p.width} height={p.height} loading="lazy" decoding="async" />
              </button>
              <figcaption className={c.meta}>
                <span className={c.label}>{sourceLabel(p.source)}</span>{" "}
                {p.url ? (
                  <ExternalLink href={p.url} className={c.caption}>
                    {p.caption}
                  </ExternalLink>
                ) : (
                  <span className={c.caption}>{p.caption}</span>
                )}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        className={c.dialog ?? "m-auto max-h-[92vh] max-w-[92vw] bg-transparent p-0 backdrop:bg-black/80"}
        onClick={() => dialog.current?.close()}
        onClose={() => setOpen(null)}
      >
        {open ? <ProofImage src={open.src} alt={open.caption} className="max-h-[92vh] max-w-[92vw] object-contain" /> : null}
      </dialog>
    </section>
  );
}
