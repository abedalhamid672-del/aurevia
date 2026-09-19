import { useEffect, useRef, useState } from "react";

const TARGET_TAU = 13;
const MAX_PLAYBACK_RATE = 3.8;
const CLOSE_ENOUGH = 0.06;
const SOFT_SETTLE_ZONE = 0.025;
const REVERSE_SEEK_INTERVAL = 72;
const PROGRESS_STEP = 0.0015;

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number;
};

export function useVideoScrub(videoSrc: string, reverseVideoSrc: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reverseVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [canvasLive, setCanvasLive] = useState(false);

  useEffect(() => {
    const video = videoRef.current as VideoWithFrameCallback | null;
    const reverseVideo = reverseVideoRef.current as VideoWithFrameCallback | null;
    const canvas = canvasRef.current;
    if (!video || !reverseVideo || !canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    let active = true;
    let framePainted = false;
    let lastPublishedProgress = -1;
    let duration = 1;
    let smoothedTarget = 0;
    let lastReverseSeek = 0;
    let reverseReady = false;
    let forwardReady = false;
    let reverseDuration = 0;
    let activeDirection: "forward" | "reverse" = "forward";
    let syncingDirection: "forward" | "reverse" | null = null;
    let motionRate = 1;

    const getScrollProgress = () => {
      const hero = video.closest(".hero-scroll");
      if (!hero) return 0;
      const max = Math.max(1, hero.clientHeight - window.innerHeight);
      return Math.min(1, Math.max(0, window.scrollY / max));
    };

    const activeSource = () => activeDirection === "reverse" ? reverseVideo : video;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    };

    const paint = () => {
      const source = activeSource();
      if (source.readyState < 2 || source.videoWidth === 0) return;
      const scale = Math.max(window.innerWidth / source.videoWidth, window.innerHeight / source.videoHeight);
      const width = source.videoWidth * scale;
      const height = source.videoHeight * scale;
      context.drawImage(source, (window.innerWidth - width) / 2, (window.innerHeight - height) / 2, width, height);
      if (!framePainted && source.currentTime > 0.02) {
        framePainted = true;
        setCanvasLive(true);
      }
    };

    const scheduleFramePaint = () => {
      const source = activeSource();
      if (!active || source.readyState < 2) return;
      if (source.requestVideoFrameCallback) {
        source.requestVideoFrameCallback(() => {
          if (!active) return;
          paint();
          if (!source.paused) scheduleFramePaint();
        });
      } else if (!source.paused) {
        paint();
      }
    };

    const startPlayback = (source: HTMLVideoElement, rate: number) => {
      motionRate += (rate - motionRate) * 0.16;
      source.playbackRate = motionRate;
      if (source.paused) void source.play().then(scheduleFramePaint).catch(() => undefined);
    };

    const pauseSource = (source: HTMLVideoElement) => {
      if (!source.paused) source.pause();
      motionRate = 1;
      source.playbackRate = 1;
    };

    const pauseAll = () => {
      pauseSource(video);
      pauseSource(reverseVideo);
    };

    const switchToReverse = () => {
      if (!reverseReady || activeDirection === "reverse") return reverseReady;
      pauseAll();
      syncingDirection = "reverse";
      reverseVideo.currentTime = Math.max(0, Math.min(duration, duration - video.currentTime));
      activeDirection = "reverse";
      return true;
    };

    const switchToForward = () => {
      if (activeDirection === "forward") return;
      pauseAll();
      syncingDirection = "forward";
      video.currentTime = Math.max(0, Math.min(duration, duration - reverseVideo.currentTime));
      activeDirection = "forward";
    };

    const correctReverseFallback = (targetTime: number, now: number) => {
      if (now - lastReverseSeek < REVERSE_SEEK_INTERVAL) return;
      lastReverseSeek = now;
      pauseAll();
      video.currentTime = Math.max(0, Math.min(duration, targetTime));
      paint();
    };

    const tick = (now: number) => {
      const dt = Math.min(0.08, (now - last) / 1000);
      last = now;
      const rawProgress = getScrollProgress();
      const rawTarget = rawProgress * duration;
      smoothedTarget += (rawTarget - smoothedTarget) * (1 - Math.exp(-dt * TARGET_TAU));

      if (Math.abs(rawProgress - lastPublishedProgress) > PROGRESS_STEP || rawProgress === 0 || rawProgress === 1) {
        lastPublishedProgress = rawProgress;
        setProgress(rawProgress);
      }

      if (!forwardReady) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (reducedMotion) {
        pauseAll();
        if (Math.abs(video.currentTime - rawTarget) > CLOSE_ENOUGH) video.currentTime = rawTarget;
      } else if (rawProgress < (smoothedTarget / duration) - 0.0002) {
        if (reverseReady && switchToReverse()) {
          if (!syncingDirection) {
            const reverseTarget = duration - smoothedTarget;
            const difference = reverseTarget - reverseVideo.currentTime;
            if (difference > CLOSE_ENOUGH) startPlayback(reverseVideo, Math.min(MAX_PLAYBACK_RATE, Math.max(0.8, 0.85 + difference * 1.15)));
            else if (difference > SOFT_SETTLE_ZONE) startPlayback(reverseVideo, 0.82);
            else pauseSource(reverseVideo);
          }
        } else {
          correctReverseFallback(smoothedTarget, now);
        }
      } else {
        if (activeDirection === "reverse") switchToForward();
        if (!syncingDirection) {
          const difference = smoothedTarget - video.currentTime;
          if (difference > CLOSE_ENOUGH) startPlayback(video, Math.min(MAX_PLAYBACK_RATE, Math.max(0.8, 0.85 + difference * 1.15)));
          else if (difference > SOFT_SETTLE_ZONE) startPlayback(video, 0.82);
          else pauseSource(video);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    const onForwardLoaded = () => {
      duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
      forwardReady = true;
      if (reverseDuration > 0) reverseReady = Math.abs(reverseDuration - duration) <= 0.25;
      smoothedTarget = 0;
      resize();
      pauseAll();
      video.currentTime = 0;
      if (reverseReady) reverseVideo.currentTime = duration;
      paint();
      scheduleFramePaint();
    };

    const onReverseLoaded = () => {
      reverseDuration = Number.isFinite(reverseVideo.duration) && reverseVideo.duration > 0 ? reverseVideo.duration : 0;
      reverseReady = forwardReady && reverseDuration > 0 && Math.abs(reverseDuration - duration) <= 0.25;
      reverseVideo.pause();
      reverseVideo.playbackRate = 1;
      if (reverseReady) reverseVideo.currentTime = duration;
    };

    const onSeeked = () => {
      syncingDirection = null;
      paint();
      if (!activeSource().paused) scheduleFramePaint();
    };

    video.addEventListener("loadedmetadata", onForwardLoaded);
    video.addEventListener("loadeddata", scheduleFramePaint);
    video.addEventListener("seeked", onSeeked);
    reverseVideo.addEventListener("loadedmetadata", onReverseLoaded);
    reverseVideo.addEventListener("loadeddata", scheduleFramePaint);
    reverseVideo.addEventListener("seeked", onSeeked);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    resize();
    raf = requestAnimationFrame(tick);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      pauseAll();
      video.removeEventListener("loadedmetadata", onForwardLoaded);
      video.removeEventListener("loadeddata", scheduleFramePaint);
      video.removeEventListener("seeked", onSeeked);
      reverseVideo.removeEventListener("loadedmetadata", onReverseLoaded);
      reverseVideo.removeEventListener("loadeddata", scheduleFramePaint);
      reverseVideo.removeEventListener("seeked", onSeeked);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, [videoSrc, reverseVideoSrc]);

  return { videoRef, reverseVideoRef, canvasRef, progress, canvasLive };
}
