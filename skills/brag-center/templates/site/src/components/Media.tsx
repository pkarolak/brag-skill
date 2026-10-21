import type { MediaItem } from "../content/story";
import { useAsset } from "../lib/lock";
import { motionEnabled } from "../lib/motion";

type Props = { item: MediaItem; className?: string; eager?: boolean };

/** Image or looping video. Videos render a poster <img> that print.css swaps in for PDFs.
 *  Untrimmed recordings loop between `start` and `end` instead of from 0.
 *  URLs come from useAsset so password-protected files are decrypted on demand. */
export function Media({ item, className, eager }: Props) {
  const src = useAsset(item.src);
  const poster = useAsset(item.kind === "video" ? item.poster : undefined);

  if (item.kind === "video") {
    const start = item.start ?? 0;
    const trimmed = item.start != null || item.end != null;
    const restart = (v: HTMLVideoElement) => {
      v.currentTime = start;
      void v.play().catch(() => {});
    };
    return (
      <>
        {motionEnabled && src ? (
          <video
            className={className}
            src={src}
            poster={poster}
            width={item.width}
            height={item.height}
            autoPlay
            muted
            loop={!trimmed}
            onLoadedMetadata={start ? (e) => (e.currentTarget.currentTime = start) : undefined}
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
  return src ? (
    <img
      className={className}
      src={src}
      alt={item.alt}
      width={item.width}
      height={item.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  ) : (
    <div className={className} style={{ aspectRatio: item.width && item.height ? `${item.width} / ${item.height}` : undefined }} aria-busy="true" />
  );
}
