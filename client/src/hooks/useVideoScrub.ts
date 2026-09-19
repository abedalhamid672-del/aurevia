import { useEffect, useRef, useState } from "react";

const TARGET_TAU = 13;
const MAX_FORWARD_RATE = 3.8;
const CLOSE_ENOUGH = 0.06;
const REVERSE_SEEK_INTERVAL = 72;
const PROGRESS_STEP = 0.0015;

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number;
};

export function useVideoScrub(videoSrc: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [canvasLive, setCanvasLive] = useState(false);

  useEffect(() => {
    const video = videoRef.current as VideoWithFrameCallback | null;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
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
    let previousProgress = 0;
    let reversePlaybackSupported: boolean | null = null;

    const getScrollProgress = () => {
      const hero = video.closest(".hero-scroll");
      if (!hero) return 0;
      const max = Math.max(1, hero.clientHeight - window.innerHeight);
      return Math.min(1, Math.max(0, window.scrollY / max));
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    };

    const paint = () => {
      if (video.readyState < 2 || video.videoWidth === 0) return;
      const scale = Math.max(window.innerWidth / video.videoWidth, window.innerHeight / video.videoHeight);
      const width = video.videoWidth * scale;
      const height = video.videoHeight * scale;
      context.drawImage(video, (window.innerWidth - width) / 2, (window.innerHeight - height) / 2, width, height);
      if (!framePainted) {
        framePainted = true;
        setCanvasLive(true);
      }
    };

    const scheduleFramePaint = () => {
      if (!active || video.readyState < 2) return;
      if (video.requestVideoFrameCallback) {
        video.requestVideoFrameCallback(() => {
          if (!active) return;
          paint();
          if (!video.paused) scheduleFramePaint();
        });
      } else if (!video.paused) {
        paint();
      }
    };

    const startPlayback = (rate: number) => {
      video.playbackRate = rate;
      if (video.paused) void video.play().then(scheduleFramePaint).catch(() => undefined);
    };

    const pausePlayback = () => {
      if (!video.paused) video.pause();
      video.playbackRate = 1;
    };

    const startReversePlayback = (difference: number) => {
      if (reversePlaybackSupported === false) return false;
      try {
        const rate = -Math.min(1.8, Math.max(0.55, Math.abs(difference) * 1.4));
        video.playbackRate = rate;
        reversePlaybackSupported = video.playbackRate < 0;
        if (!reversePlaybackSupported) {
          video.playbackRate = 1;
          return false;
        }
        if (video.paused) {
          void video.play().catch(() => {
            reversePlaybackSupported = false;
            video.playbackRate = 1;
          });
        }
        return true;
      } catch {
        reversePlaybackSupported = false;
        video.playbackRate = 1;
        return false;
      }
    };

    const correctReverse = (targetTime: number, now: number) => {
      if (now - lastReverseSeek < REVERSE_SEEK_INTERVAL) return;
      lastReverseSeek = now;
      video.pause();
      video.currentTime = Math.max(0, Math.min(duration, targetTime));
      paint();
    };

    const tick = (now: number) => {
      const dt = Math.min(0.08, (now - last) / 1000);
      last = now;
      const rawProgress = getScrollProgress();
      const rawTarget = rawProgress * duration;
      const direction = rawProgress - previousProgress;
      previousProgress = rawProgress;
      smoothedTarget += (rawTarget - smoothedTarget) * (1 - Math.exp(-dt * TARGET_TAU));

      if (Math.abs(rawProgress - lastPublishedProgress) > PROGRESS_STEP || rawProgress === 0 || rawProgress === 1) {
        lastPublishedProgress = rawProgress;
        setProgress(rawProgress);
      }

      if (reducedMotion) {
        pausePlayback();
        if (Math.abs(video.currentTime - rawTarget) > CLOSE_ENOUGH) video.currentTime = rawTarget;
      } else {
        const difference = smoothedTarget - video.currentTime;
        if (difference > CLOSE_ENOUGH) {
          // Keep forward motion continuous. The video catches up by playback speed, never by repeated seeks.
          const rate = Math.min(MAX_FORWARD_RATE, Math.max(0.8, 0.85 + difference * 1.15));
          startPlayback(rate);
        } else if (difference < -CLOSE_ENOUGH) {
          // Prefer native reverse playback; only use sparse seeks when the browser rejects negative rates.
          if (!startReversePlayback(difference)) correctReverse(smoothedTarget, now);
        } else {
          pausePlayback();
        }
      }

      if (direction > 0.0002 && video.playbackRate < 0) pausePlayback();

      raf = requestAnimationFrame(tick);
    };

    const onLoaded = () => {
      duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
      smoothedTarget = 0;
      resize();
      video.pause();
      video.playbackRate = 1;
      video.currentTime = 0;
      paint();
      scheduleFramePaint();
    };

    const onSeeked = () => {
      paint();
      if (!video.paused) scheduleFramePaint();
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("loadeddata", scheduleFramePaint);
    video.addEventListener("seeked", onSeeked);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    resize();
    raf = requestAnimationFrame(tick);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      video.pause();
      video.playbackRate = 1;
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("loadeddata", scheduleFramePaint);
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, [videoSrc]);

  return { videoRef, canvasRef, progress, canvasLive };
}
