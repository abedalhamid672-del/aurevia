import { useEffect, useRef, useState } from "react";

const LERP_TAU = 11;
const SEEK_THRESHOLD = 0.018;
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
  const currentRef = useRef(0);
  const targetRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current as VideoWithFrameCallback | null;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    let framePainted = false;
    let lastPublishedProgress = -1;
    let seeking = false;
    let pendingTime = 0;
    let previousProgress = 0;
    let scrollVelocity = 0;

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

    const queueSeek = (time: number) => {
      pendingTime = time;
      if (reducedMotion || seeking) return;
      if (Math.abs(video.currentTime - pendingTime) < SEEK_THRESHOLD) return;
      seeking = true;
      video.currentTime = pendingTime;
    };

    const flushSeek = () => {
      seeking = false;
      paint();
      if (reducedMotion || Math.abs(video.currentTime - pendingTime) < SEEK_THRESHOLD) return;
      seeking = true;
      video.currentTime = pendingTime;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.08, (now - last) / 1000);
      last = now;
      const nextProgress = getScrollProgress();
      const instantaneousVelocity = Math.abs(nextProgress - previousProgress) / Math.max(dt, 0.001);
      scrollVelocity += (instantaneousVelocity - scrollVelocity) * Math.min(1, dt * 8);
      previousProgress = nextProgress;
      if (Math.abs(nextProgress - lastPublishedProgress) > PROGRESS_STEP || nextProgress === 0 || nextProgress === 1) {
        lastPublishedProgress = nextProgress;
        setProgress(nextProgress);
      }
      targetRef.current = nextProgress * durationRef.current;
      if (reducedMotion) currentRef.current = targetRef.current;
      else {
        const adaptiveTau = Math.min(18, LERP_TAU + scrollVelocity * 0.75);
        currentRef.current += (targetRef.current - currentRef.current) * (1 - Math.exp(-dt * adaptiveTau));
      }
      if (Math.abs(targetRef.current - currentRef.current) < SEEK_THRESHOLD) currentRef.current = targetRef.current;
      if (video.readyState >= 2) queueSeek(currentRef.current);
      raf = requestAnimationFrame(tick);
    };

    const onLoaded = () => {
      durationRef.current = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
      resize();
      video.pause();
      video.currentTime = 0;
      paint();
    };

    const onFrame = () => paint();
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("loadeddata", onFrame);
    video.addEventListener("seeked", flushSeek);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    resize();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("loadeddata", onFrame);
      video.removeEventListener("seeked", flushSeek);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, [videoSrc]);

  return { videoRef, canvasRef, progress, canvasLive };
}
