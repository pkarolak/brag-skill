import type { MediaItem } from "../content/story";
import { asset } from "../content/story";
import { motionEnabled } from "../lib/motion";

type Props = { item: MediaItem; className?: string; eager?: boolean };

/** Image or looping video. Videos render a poster <img> that print.css swaps in for PDFs.
 *  Untrimmed recordings loop between `start` and `end` instead of from 0. */
export function Media({ item, className, eager }: Props) {
  if (item.kind === "video") {
    const poster = item.poster ? asset(item.poster) : undefined;
    const start = item.start ?? 0;
    const trimmed = item.start != null || item.end != null;
    const restart = (v: HTMLVideoElement) => {
      v.currentTime = start;
      void v.play().catch(() => {});
    };
    return (
      <>
        {motionEnabled ? (
          <video
            className={className}
            src={start ? `${asset(item.src)}#t=${start}` : asset(item.src)}
            poster={poster}
            width={item.width}
            height={item.height}
            autoPlay
            muted
            loop={!trimmed}
            onEnded={trimmed ? (e) => restart(e.currentTarget) : undefined}
            onTimeUpdate={item.end != null ? (e) => e.currentTarget.currentTime >= item.end! && restart(e.currentTarget) : undefined}
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
