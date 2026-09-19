import { ArrowLeft, Heart } from "lucide-react";
import { useState } from "react";
import type { Fragrance } from "@/types/fragrance";
import { getAvailability, getDisplayPrice, getDisplayRating, getDisplaySize, getDisplayUpdatedLabel } from "@/types/fragrance";
import NotePyramid from "@/components/NotePyramid";
import PriceOffers from "@/components/PriceOffers";

interface FragranceDetailProps { fragrance: Fragrance; onBack: () => void; onWishlist?: (fragrance: Fragrance) => void; }

export default function FragranceDetail({ fragrance, onBack, onWishlist }: FragranceDetailProps) {
  const [saved, setSaved] = useState(false);
  const [image, setImage] = useState(fragrance.image);
  const wishlist = () => { setSaved((value) => !value); onWishlist?.(fragrance); };
  return <main className="detail-page">
    <header className="detail-header"><button type="button" className="text-button invert" onClick={onBack}><ArrowLeft size={14} /> Back to collection</button><span className="brand-mark">Aurevia</span><span className="micro">{fragrance.dataStatus === "development" ? "Development data" : "Provider data"}</span></header>
    <section className="detail-main">
      <div className="detail-visual"><div className="detail-thumbs">{fragrance.gallery.map((item) => <button type="button" className={`detail-thumb ${image === item ? "active" : ""}`} key={item} onClick={() => setImage(item)}><img src={item} alt="" /></button>)}</div><img className="detail-hero-image" src={image} alt={`${fragrance.brand} ${fragrance.name} fragrance bottle`} /></div>
      <div className="detail-copy"><div className="detail-brand micro">{fragrance.brand}</div><h1 className="detail-title">{fragrance.name}</h1><div className="detail-subline">{fragrance.concentration} · {fragrance.gender} · {fragrance.family}</div><div className="detail-purchase"><div className={getDisplayPrice(fragrance) === "Price unavailable" ? "detail-unavailable" : "detail-price"}>{getDisplayPrice(fragrance)}</div><div className="detail-price-note">{getDisplayUpdatedLabel(fragrance)} · Prices may change by retailer.</div><div className="detail-actions"><a className="dark-button" href={fragrance.offers[0]?.url || fragrance.sourceUrl} target="_blank" rel="noreferrer">{fragrance.offers.length ? "Purchase from retailer" : "View retailer"}</a><button type="button" className="outline-button" onClick={wishlist}><Heart size={15} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Wishlist"}</button></div></div><div className="micro">{getAvailability(fragrance)} · {getDisplaySize(fragrance)} · Rating {getDisplayRating(fragrance)}</div></div>
    </section>
    <section className="detail-data"><div className="profile-heading"><h2>Fragrance profile</h2><span className="micro">01 / Notes</span></div><div className="profile-grid"><NotePyramid fragrance={fragrance} /><div><div className="profile-facts"><div className="fact"><div className="fact-label micro">Perfumers</div><div className="fact-value">{fragrance.perfumers.length ? fragrance.perfumers.join(", ") : "Not supplied"}</div></div><div className="fact"><div className="fact-label micro">Year</div><div className="fact-value">{fragrance.year ?? "Not supplied"}</div></div><div className="fact"><div className="fact-label micro">Family</div><div className="fact-value">{fragrance.family || "Not supplied"}</div></div><div className="fact"><div className="fact-label micro">Sizes</div><div className="fact-value">{getDisplaySize(fragrance)}</div></div></div><div className="accord-list">{fragrance.accords.length ? fragrance.accords.map((accord) => <span className="accord" key={accord}>{accord}</span>) : <span className="accord">Accords not supplied</span>}</div></div></div><PriceOffers fragrance={fragrance} /></section>
  </main>;
}
