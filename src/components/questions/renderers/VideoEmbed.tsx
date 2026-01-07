"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { ContentBlockProps, VideoEmbedSettings } from "../types";
import { ArrowRight, Play, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

function getVideoEmbedUrl(url: string): { embedUrl: string; provider: string } | null {
  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`,
      provider: "youtube",
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      provider: "vimeo",
    };
  }

  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch) {
    return {
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      provider: "loom",
    };
  }

  // Direct video URL (mp4, webm, etc.)
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return { embedUrl: url, provider: "direct" };
  }

  return null;
}

export function VideoEmbed({
  question,
  onContinue,
  disabled = false,
}: ContentBlockProps) {
  const settings = question.settings as VideoEmbedSettings;
  const url = settings?.url;
  const autoplay = settings?.autoplay ?? false;
  const showControls = settings?.showControls ?? true;
  const loop = settings?.loop ?? false;
  const muted = settings?.muted ?? autoplay;
  const requiredWatchTime = settings?.requiredWatchTime;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [hasMetRequirement, setHasMetRequirement] = useState(!requiredWatchTime);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !disabled && onContinue && hasMetRequirement) {
        e.preventDefault();
        onContinue();
      }
    },
    [disabled, onContinue, hasMetRequirement]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (requiredWatchTime && watchedSeconds >= requiredWatchTime) {
      setHasMetRequirement(true);
    }
  }, [watchedSeconds, requiredWatchTime]);

  // Track time for direct video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setWatchedSeconds(video.currentTime);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  if (!url) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No video URL configured</p>
      </div>
    );
  }

  const videoInfo = getVideoEmbedUrl(url);

  if (!videoInfo) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground mb-4">
          Unable to embed this video. You can watch it directly:
        </p>
        <Button asChild variant="outline">
          <a href={url} target="_blank" rel="noopener noreferrer" className="gap-2">
            Open Video <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    );
  }

  const buildIframeUrl = () => {
    let embedUrl = videoInfo.embedUrl;
    const params = new URLSearchParams();

    if (autoplay) params.set("autoplay", "1");
    if (muted) params.set("muted", "1");
    if (loop) params.set("loop", "1");

    if (videoInfo.provider === "youtube") {
      if (autoplay) params.set("autoplay", "1");
      if (muted) params.set("mute", "1");
      if (loop) params.set("loop", "1");
      if (!showControls) params.set("controls", "0");
    }

    if (videoInfo.provider === "vimeo") {
      if (autoplay) params.set("autoplay", "1");
      if (muted) params.set("muted", "1");
      if (loop) params.set("loop", "1");
    }

    const separator = embedUrl.includes("?") ? "&" : "?";
    return embedUrl + separator + params.toString();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Video player */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        {videoInfo.provider === "direct" ? (
          <video
            ref={videoRef}
            src={videoInfo.embedUrl}
            className="h-full w-full"
            controls={showControls}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <iframe
            src={buildIframeUrl()}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title="Video embed"
          />
        )}
      </div>

      {/* Required watch time indicator */}
      {requiredWatchTime && !hasMetRequirement && videoInfo.provider === "direct" && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Please watch at least {requiredWatchTime} seconds to continue
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${Math.min((watchedSeconds / requiredWatchTime) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Continue button */}
      {onContinue && (
        <div className="flex justify-center">
          <Button
            onClick={onContinue}
            disabled={disabled || !hasMetRequirement}
            className={cn("gap-2", !hasMetRequirement && "opacity-50")}
          >
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
