import { ArrowDown } from "lucide-react";
import { useVideoScrub } from "@/hooks/useVideoScrub";
import Navbar from "@/components/Navbar";

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260821_114821_a8ca298f-be2c-4613-a4dd-51b69e16bbde.mp4";
const REVERSE_VIDEO_SRC = "/manus-storage/aurevia-hero-reverse_569eaaeb.mp4";
const POSTER_SRC = "/manus-storage/aurevia-hero-poster_3ed6c345.jpg";

interface HeroProps { onSearch: () => void; onMenu: () => void; bagCount: number; }

export default function Hero({ onSearch, onMenu, bagCount }: HeroProps) {
  const { videoRef, reverseVideoRef, canvasRef, progress, canvasLive } = useVideoScrub(VIDEO_SRC, REVERSE_VIDEO_SRC);
  const scrollToCollection = () => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="hero-scroll" aria-label="Aurevia cinematic introduction">
      <div className="hero-sticky">
        <video ref={videoRef} className={`hero-media hero-video-layer ${canvasLive ? "source-hidden" : ""}`} src={VIDEO_SRC} poster={POSTER_SRC} muted playsInline preload="auto" disablePictureInPicture disableRemotePlayback controlsList="nodownload noplaybackrate" tabIndex={-1} aria-hidden="true" />
        <video ref={reverseVideoRef} className="hero-reverse-layer" src={REVERSE_VIDEO_SRC} muted playsInline preload="auto" disablePictureInPicture disableRemotePlayback controlsList="nodownload noplaybackrate" tabIndex={-1} aria-hidden="true" />
        <canvas ref={canvasRef} className={`hero-canvas ${canvasLive ? "live" : ""}`} aria-hidden="true" />
        <div className="hero-shade" />
        <Navbar onSearch={onSearch} onMenu={onMenu} bagCount={bagCount} />
        <div className="hero-content">
          <div className="eyebrow">Curated fragrance collection</div>
          <h1 className="hero-title">The art<br />of scent</h1>
          <p className="hero-subtitle">Exceptional fragrances.<br />Precisely chosen.</p>
          <div className="hero-actions">
            <button type="button" className="text-button" onClick={scrollToCollection}>Explore collection</button>
            <a className="text-button" href="#discover">Discover your scent</a>
          </div>
        </div>
        <div className="hero-progress" aria-label="Cinematic scroll progress"><span style={{ transform: `scaleX(${progress})` }} /></div>
        <button type="button" className="hero-scroll-hint" onClick={scrollToCollection} aria-label="Scroll to collection"><ArrowDown size={17} strokeWidth={1} /></button>
      </div>
    </section>
  );
}
