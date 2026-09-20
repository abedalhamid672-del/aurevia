import { useEffect, useRef, useState } from "react";

const LERP_TAU = 8;
const SNAP = 0.002;

export function useVideoScrub(videoSrc: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [canvasLive, setCanvasLive] = useState(false);
  const durationRef = useRef(1);
  const currentRef = useRef(0);
  const targetRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    let framePainted = false;
    let lastPublishedProgress = -1;

    const getScrollProgress = () => {
      const hero = video.closest(".hero-scroll");
      if (!hero) return 0;
      const max = Math.max(1, hero.clientHeight - window.innerHeight);
      return Math.min(1, Math.max(0, window.scrollY / max));
    };

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
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

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const nextProgress = getScrollProgress();
      if (Math.abs(nextProgress - lastPublishedProgress) > 0.002 || nextProgress === 0 || nextProgress === 1) {
        lastPublishedProgress = nextProgress;
        setProgress(nextProgress);
      }
      targetRef.current = nextProgress * durationRef.current;
      if (reducedMotion) currentRef.current = targetRef.current;
      else currentRef.current += (targetRef.current - currentRef.current) * (1 - Math.exp(-dt * LERP_TAU));
      if (Math.abs(targetRef.current - currentRef.current) < SNAP) currentRef.current = targetRef.current;
      if (Math.abs(video.currentTime - currentRef.current) > 0.012) video.currentTime = currentRef.current;
      paint();
      raf = requestAnimationFrame(tick);
    };

    const onLoaded = () => {
      durationRef.current = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
      resize();
      video.pause();
      video.currentTime = 0;
    };

    video.addEventListener("loadedmetadata", onLoaded);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    resize();
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("loadedmetadata", onLoaded);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, [videoSrc]);

  return { videoRef, canvasRef, progress, canvasLive };
}
