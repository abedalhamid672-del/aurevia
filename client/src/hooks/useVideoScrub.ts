import { useEffect, useRef, useState } from "react";

const LERP_TAU = 10;
const MAX_RATE = 2.4;
const MIN_RATE = 0.35;
const TARGET_EPSILON = 0.035;
const PROGRESS_STEP = 0.002;

type Direction = "forward" | "reverse";

export function useVideoScrub(videoSrc: string, reverseVideoSrc?: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reverseVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [canvasLive, setCanvasLive] = useState(false);
  const durationRef = useRef(1);
  const timelineRef = useRef(0);
  const targetTimelineRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    const reverseVideo = reverseVideoRef.current;
    const canvas = canvasRef.current;
    if (!video || !reverseVideo || !canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    let activeDirection: Direction = "forward";
    let lastPublishedProgress = -1;
    let framePainted = false;
    let forwardReady = false;
    let reverseReady = false;
    let switching = false;

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

    const activeVideo = () => activeDirection === "forward" ? video : reverseVideo;

    const paint = () => {
      const source = activeVideo();
      if (source.readyState < 2 || source.videoWidth === 0) return;
      const scale = Math.max(window.innerWidth / source.videoWidth, window.innerHeight / source.videoHeight);
      const width = source.videoWidth * scale;
      const height = source.videoHeight * scale;
      const x = (window.innerWidth - width) / 2;
      const y = (window.innerHeight - height) / 2;
      context.drawImage(source, x, y, width, height);
      if (!framePainted) {
        framePainted = true;
        setCanvasLive(true);
      }
    };

    const paintDecodedFrame = () => {
      const source = activeVideo() as HTMLVideoElement & {
        requestVideoFrameCallback?: (callback: () => void) => number;
      };
      if (source.requestVideoFrameCallback) source.requestVideoFrameCallback(() => paint());
      else paint();
    };

    const pause = (source: HTMLVideoElement) => {
      source.pause();
      source.playbackRate = 1;
    };

    const play = (source: HTMLVideoElement, rate: number) => {
      source.playbackRate = rate;
      if (source.paused) void source.play().then(paintDecodedFrame).catch(() => undefined);
    };

    const switchDirection = (direction: Direction) => {
      if (direction === activeDirection || switching) return;
      const source = direction === "forward" ? video : reverseVideo;
      if (source.readyState < 1) return;

      switching = true;
      pause(video);
      pause(reverseVideo);
      const desiredTime = direction === "forward"
        ? timelineRef.current
        : durationRef.current - timelineRef.current;
      source.currentTime = Math.min(durationRef.current, Math.max(0, desiredTime));
      activeDirection = direction;
      source.addEventListener("seeked", () => {
        switching = false;
        paintDecodedFrame();
      }, { once: true });
    };

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const nextProgress = getScrollProgress();
      targetTimelineRef.current = nextProgress * durationRef.current;

      if (Math.abs(nextProgress - lastPublishedProgress) > PROGRESS_STEP || nextProgress === 0 || nextProgress === 1) {
        lastPublishedProgress = nextProgress;
        setProgress(nextProgress);
      }

      if (reducedMotion) timelineRef.current = targetTimelineRef.current;
      else timelineRef.current += (targetTimelineRef.current - timelineRef.current) * (1 - Math.exp(-dt * LERP_TAU));

      const delta = targetTimelineRef.current - timelineRef.current;
      if (Math.abs(delta) < 0.0015) timelineRef.current = targetTimelineRef.current;
      if (delta > TARGET_EPSILON) switchDirection("forward");
      else if (delta < -TARGET_EPSILON) switchDirection("reverse");

      const source = activeVideo();
      const desiredSourceTime = activeDirection === "forward"
        ? targetTimelineRef.current
        : durationRef.current - targetTimelineRef.current;
      const sourceDelta = desiredSourceTime - source.currentTime;

      if (!switching && Math.abs(sourceDelta) > TARGET_EPSILON) {
        const rate = Math.min(MAX_RATE, Math.max(MIN_RATE, 0.65 + Math.abs(sourceDelta) * 1.3));
        play(source, rate);
      } else if (!switching) {
        pause(source);
      }

      paint();
      raf = requestAnimationFrame(tick);
    };

    const onForwardLoaded = () => {
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
      durationRef.current = duration;
      forwardReady = true;
      video.pause();
      video.currentTime = 0;
      resize();
      paint();
    };

    const onReverseLoaded = () => {
      const reverseDuration = Number.isFinite(reverseVideo.duration) && reverseVideo.duration > 0 ? reverseVideo.duration : 0;
      reverseReady = reverseDuration > 0 && Math.abs(reverseDuration - durationRef.current) <= 0.25;
      reverseVideo.pause();
      reverseVideo.currentTime = reverseReady ? durationRef.current : 0;
    };

    video.addEventListener("loadedmetadata", onForwardLoaded);
    reverseVideo.addEventListener("loadedmetadata", onReverseLoaded);
    video.addEventListener("loadeddata", paint);
    reverseVideo.addEventListener("loadeddata", paint);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    resize();
    if (video.readyState >= 1) onForwardLoaded();
    if (reverseVideo.readyState >= 1) onReverseLoaded();
    void reverseReady;
    void forwardReady;
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      pause(video);
      pause(reverseVideo);
      video.removeEventListener("loadedmetadata", onForwardLoaded);
      reverseVideo.removeEventListener("loadedmetadata", onReverseLoaded);
      video.removeEventListener("loadeddata", paint);
      reverseVideo.removeEventListener("loadeddata", paint);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, [videoSrc, reverseVideoSrc]);

  return { videoRef, reverseVideoRef, canvasRef, progress, canvasLive };
}
