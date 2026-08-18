import type { PackageVideo } from "@/lib/api/packagesApi";

/** Turn a YouTube/Vimeo watch URL into an embeddable URL; returns null if we
 *  don't recognise it (the caller then falls back to a plain link). */
function embedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean).pop()}`;
    }
  } catch {
    return null;
  }
  return null;
}

export default function TourVideos({ videos }: { videos: PackageVideo[] }) {
  const items = (videos ?? []).filter((v) => v.video || v.video_url);
  if (items.length === 0) return null;

  return (
    <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
      <h2 className="text-xl font-bold font-raleway text-text-primary mb-4">Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((v) => {
          const embed = v.video_url ? embedUrl(v.video_url) : null;
          return (
            <figure key={v.id} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-black/5 dark:bg-white/5">
              {v.video ? (
                <video
                  src={v.video}
                  poster={v.poster ?? undefined}
                  controls
                  preload="metadata"
                  className="w-full aspect-video object-cover bg-black"
                />
              ) : embed ? (
                <iframe
                  src={embed}
                  title={v.caption ?? "Package video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full aspect-video"
                />
              ) : (
                <a
                  href={v.video_url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center aspect-video text-primary font-semibold text-sm"
                >
                  Watch video ↗
                </a>
              )}
              {v.caption && (
                <figcaption className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300 font-open-sans">
                  {v.caption}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </section>
  );
}
