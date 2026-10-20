import type { AnchorHTMLAttributes } from "react";

/** External link that print mode turns into a numbered footnote. */
export function ExternalLink({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a href={href} data-href={href} target="_blank" rel="noreferrer noopener" {...rest}>
      {children}
    </a>
  );
}
