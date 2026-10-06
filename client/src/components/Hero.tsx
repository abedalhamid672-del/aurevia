import { ArrowDown } from "lucide-react";
import { useVideoScrub } from "@/hooks/useVideoScrub";
import Navbar from "@/components/Navbar";
import { useLocale } from "@/lib/i18n";

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260821_114821_a8ca298f-be2c-4613-a4dd-51b69e16bbde.mp4";
const VIDEO_WEBM_SRC = "/manus-storage/aurevia-hero-forward-1080-seek_7c9711cf.webm";
const VIDEO_REVERSE_WEBM_SRC = "/manus-storage/aurevia-hero-reverse-1080-seek_52c3aa57.webm";

interface HeroProps { onSearch: () => void; onMenu: () => void; bagCount: number; onAccount?: () => void; onBag?: () => void; }

export default function Hero({ onSearch, onMenu, bagCount, onAccount, onBag }: HeroProps) {
  const { copy, locale } = useLocale();
  const { videoRef, reverseVideoRef, canvasRef, progress, canvasLive } = useVideoScrub(VIDEO_SRC, VIDEO_REVERSE_WEBM_SRC);
  const scrollToCollection = () => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="hero-scroll" aria-label={locale === "ar" ? "المقدمة السينمائية لأوريفيا" : "Aurevia cinematic introduction"}>
      <div className="hero-sticky">
        <video ref={videoRef} className="hero-media" muted playsInline preload="auto" aria-hidden="true">
          <source src={VIDEO_WEBM_SRC} type="video/webm" />
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
        <video ref={reverseVideoRef} className="hero-reverse-media" muted playsInline preload="auto" aria-hidden="true">
          <source src={VIDEO_REVERSE_WEBM_SRC} type="video/webm" />
        </video>
        <canvas ref={canvasRef} className={`hero-canvas ${canvasLive ? "live" : ""}`} aria-hidden="true" />
        <div className="hero-shade" />
        <Navbar onSearch={onSearch} onMenu={onMenu} bagCount={bagCount} onAccount={onAccount} onBag={onBag} />
        <div className="hero-content">
          <div className="eyebrow">{copy.heroEyebrow}</div>
          <h1 className="hero-title">{locale === "ar" ? <>فنّ<br />العطر</> : <>The art<br />of scent</>}</h1>
          <p className="hero-subtitle">{copy.heroSubtitle}</p>
          <div className="hero-actions">
            <button type="button" className="text-button" onClick={scrollToCollection}>{copy.explore}</button>
            <a className="text-button" href="#discover">{copy.discover}</a>
          </div>
        </div>
        <div className="hero-progress" aria-label={locale === "ar" ? "تقدم التمرير السينمائي" : "Cinematic scroll progress"}><span style={{ transform: `scaleX(${progress})` }} /></div>
        <button type="button" className="hero-scroll-hint" onClick={scrollToCollection} aria-label={locale === "ar" ? "التمرير إلى المجموعة" : "Scroll to collection"}><ArrowDown size={17} strokeWidth={1} /></button>
      </div>
    </section>
  );
}
