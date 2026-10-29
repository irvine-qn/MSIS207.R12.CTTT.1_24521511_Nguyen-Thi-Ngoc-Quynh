"use client";

import { useState } from "react";
import { MEDIA_PATHS } from "@/config/audio";

interface CoverImageProps {
  src: string;
  alt: string;
  className?: string;
}

/** Album cover from /public that falls back to a placeholder when the file is missing. */
export default function CoverImage({ src, alt, className }: CoverImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolvedSrc = failedSrc === src ? MEDIA_PATHS.coverFallback : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (resolvedSrc !== MEDIA_PATHS.coverFallback) setFailedSrc(src);
      }}
    />
  );
}
