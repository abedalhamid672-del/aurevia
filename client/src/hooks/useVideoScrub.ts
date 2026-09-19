import { useEffect, useRef, useState } from "react";

const TARGET_TAU = 18;
const CATCH_UP_WINDOW = 1.35;
const SETTLE_EPSILON = 0.035;
const PROGRESS_STEP = 0.0015;

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number;
};

export function useVideoScrub(videoSrc: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [canvasLive, setCanvasLive] = useState(false);
  const durationRef = useRef(1);
  const targetTimeRef = useRef(0);

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
    let seeking = false;
    let framePainted = false;
    let lastPublishedProgress = -1;
    let smoothedTarget = 0;

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
      const x = (window.innerWidth - width) / 2;
      const y = (window.innerHeight - height) / 2;
      context.drawImage(video, x, y, width, height);
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
          scheduleFramePaint();
        });
      } else if (!video.paused) {
        paint();
      }
    };

    const seekTo = (time: number) => {
      const clamped = Math.min(durationRef.current, Math.max(0, time));
      if (Math.abs(video.currentTime - clamped) < SETTLE_EPSILON || seeking) return;
      seeking = true;
      video.pause();
      video.currentTime = clamped;
    };

    const stopAtTarget = () => {
      video.pause();
      video.playbackRate = 1;
    };

    const chaseTarget = (dt: number) => {
      const rawProgress = getScrollProgress();
      const rawTarget = rawProgress * durationRef.current;
      smoothedTarget += (rawTarget - smoothedTarget) * (1 - Math.exp(-dt * TARGET_TAU));
      targetTimeRef.current = smoothedTarget;

      if (Math.abs(rawProgress - lastPublishedProgress) > PROGRESS_STEP || rawProgress === 0 || rawProgress === 1) {
        lastPublishedProgress = rawProgress;
        setProgress(rawProgress);
      }

      if (reducedMotion) {
        stopAtTarget();
        seekTo(rawTarget);
        return;
      }

      const difference = targetTimeRef.current - video.currentTime;
      if (seeking) return;

      if (difference > SETTLE_EPSILON && difference < CATCH_UP_WINDOW) {
        video.playbackRate = Math.min(2.6, Math.max(0.55, 0.65 + difference * 2.6));
        if (video.paused) void video.play().catch(() => undefined);
      } else if (difference < -SETTLE_EPSILON) {
        stopAtTarget();
        seekTo(targetTimeRef.current);
      } else if (difference >= -SETTLE_EPSILON && difference <= SETTLE_EPSILON) {
        stopAtTarget();
      } else {
        stopAtTarget();
        seekTo(targetTimeRef.current);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.08, (now - last) / 1000);
      last = now;
      chaseTarget(dt);
      if (!video.requestVideoFrameCallback && !video.paused) paint();
      raf = requestAnimationFrame(tick);
    };

    const onLoaded = () => {
      durationRef.current = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
      smoothedTarget = 0;
      targetTimeRef.current = 0;
      resize();
      video.pause();
      video.playbackRate = 1;
      video.currentTime = 0;
      paint();
      scheduleFramePaint();
    };

    const onSeeked = () => {
      seeking = false;
      paint();
      scheduleFramePaint();
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
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("loadeddata", scheduleFramePaint);
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, [videoSrc]);

  return { videoRef, canvasRef, progress, canvasLive };
}
