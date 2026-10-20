import type { MediaItem } from "../content/story";
import { asset } from "../content/story";
import { motionEnabled } from "../lib/motion";

type Props = { item: MediaItem; className?: string; eager?: boolean };

/** Image or looping video. Videos render a poster <img> that print.css swaps in for PDFs. */
export function Media({ item, className, eager }: Props) {
  if (item.kind === "video") {
    const poster = item.poster ? asset(item.poster) : undefined;
    return (
      <>
        {motionEnabled ? (
          <video
            className={className}
            src={asset(item.src)}
            poster={poster}
            width={item.width}
            height={item.height}
            autoPlay
            muted
            loop
            playsInline
            preload={eager ? "auto" : "metadata"}
            aria-label={item.alt}
          />
        ) : null}
        {poster ? (
          <img
            data-print-poster={motionEnabled ? "" : undefined}
            style={motionEnabled ? undefined : { display: "block" }}
            className={className}
            src={poster}
            alt={item.alt}
            width={item.width}
            height={item.height}
          />
        ) : null}
      </>
    );
  }
  return (
    <img
      className={className}
      src={asset(item.src)}
      alt={item.alt}
      width={item.width}
      height={item.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
