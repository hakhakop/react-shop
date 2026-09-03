"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  className: string;
  poster?: string;
};

/** Reliable shared lifecycle for decorative section and column videos. */
export default function BuilderBackgroundVideo({ src, className, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const video = videoRef.current;
    if (!video) return;
    // Cached media can reach HAVE_CURRENT_DATA before React attaches the
    // loadeddata/canplay handlers during hydration or a builder remount.
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) setReady(true);

    const playWhenVisible = () => {
      if (document.visibilityState === "visible") void video.play().catch(() => undefined);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) playWhenVisible();
      else video.pause();
    }, { threshold: 0.01 });
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && video.getBoundingClientRect().bottom > 0 && video.getBoundingClientRect().top < window.innerHeight) {
        playWhenVisible();
      }
    };

    observer.observe(video);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [src]);

  return (
    <>
      <span
        className="shop-builder-background-video-fallback"
        style={poster ? { backgroundImage: `url(${JSON.stringify(poster)})` } : undefined}
        aria-hidden="true"
      />
      <video
        ref={videoRef}
        className={className}
        src={src}
        poster={poster}
        preload="auto"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        data-media-ready={ready ? "true" : "false"}
        onLoadedData={() => setReady(true)}
        onCanPlay={() => setReady(true)}
        onError={() => setReady(false)}
      />
    </>
  );
}
