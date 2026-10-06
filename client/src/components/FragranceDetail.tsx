import { ArrowLeft, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import type { Fragrance } from "@/types/fragrance";
import { getAvailability, getDisplayPrice, getDisplayRating, getDisplaySize, getDisplayUpdatedLabel } from "@/types/fragrance";
import NotePyramid from "@/components/NotePyramid";
import PriceOffers from "@/components/PriceOffers";
import { useLocale } from "@/lib/i18n";

interface FragranceDetailProps { fragrance: Fragrance; onBack: () => void; onWishlist?: (fragrance: Fragrance) => void; isWishlisted?: boolean; }

export default function FragranceDetail({ fragrance, onBack, onWishlist, isWishlisted = false }: FragranceDetailProps) {
  const { copy, locale } = useLocale();
  const [saved, setSaved] = useState(isWishlisted);
  const [image, setImage] = useState(fragrance.image);
  useEffect(() => setSaved(isWishlisted), [isWishlisted]);
  const wishlist = () => { setSaved((value) => !value); onWishlist?.(fragrance); };
  return <main className="detail-page">
    <header className="detail-header"><button type="button" className="text-button invert" onClick={onBack}><ArrowLeft size={14} /> {copy.backToCollection}</button><span className="brand-mark">Aurevia</span><span className="micro">{fragrance.dataStatus === "development" ? copy.developmentData : copy.providerData}</span></header>
    <section className="detail-main">
      <div className="detail-visual"><div className="detail-thumbs">{fragrance.gallery.map((item) => <button type="button" className={`detail-thumb ${image === item ? "active" : ""}`} key={item} onClick={() => setImage(item)}><img src={item} alt="" /></button>)}</div><img className="detail-hero-image" src={image} alt={`${fragrance.brand} ${fragrance.name} fragrance bottle`} /></div>
      <div className="detail-copy"><div className="detail-brand micro">{fragrance.brand}</div><h1 className="detail-title">{fragrance.name}</h1><div className="detail-subline">{fragrance.concentration} · {fragrance.gender} · {fragrance.family}</div><div className="detail-purchase"><div className={getDisplayPrice(fragrance) === "Price unavailable" ? "detail-unavailable" : "detail-price"}>{getDisplayPrice(fragrance) === "Price unavailable" ? copy.priceUnavailable : getDisplayPrice(fragrance)}</div><div className="detail-price-note">{getDisplayUpdatedLabel(fragrance)} · {locale === "ar" ? "قد تتغير الأسعار حسب المتجر." : "Prices may change by retailer."}</div><div className="detail-actions"><a className="dark-button" href={fragrance.offers[0]?.url || fragrance.sourceUrl} target="_blank" rel="noreferrer">{fragrance.offers.length ? copy.purchaseFromRetailer : copy.viewRetailer}</a><button type="button" className="outline-button" onClick={wishlist}><Heart size={15} fill={saved ? "currentColor" : "none"} /> {saved ? copy.savedAction : copy.wishlistAction}</button></div></div><div className="micro">{getAvailability(fragrance)} · {getDisplaySize(fragrance)} · {copy.rating} {getDisplayRating(fragrance)}</div></div>
    </section>
    <section className="detail-data"><div className="profile-heading"><h2>{locale === "ar" ? "معلومات العطر" : "Fragrance profile"}</h2><span className="micro">01 / {copy.notes}</span></div><div className="profile-grid"><NotePyramid fragrance={fragrance} /><div><div className="profile-facts"><div className="fact"><div className="fact-label micro">{locale === "ar" ? "العطّارون" : "Perfumers"}</div><div className="fact-value">{fragrance.perfumers.length ? fragrance.perfumers.join(", ") : copy.notSupplied}</div></div><div className="fact"><div className="fact-label micro">{locale === "ar" ? "السنة" : "Year"}</div><div className="fact-value">{fragrance.year ?? copy.notSupplied}</div></div><div className="fact"><div className="fact-label micro">{copy.filterFamily}</div><div className="fact-value">{fragrance.family || copy.notSupplied}</div></div><div className="fact"><div className="fact-label micro">{copy.size}</div><div className="fact-value">{getDisplaySize(fragrance)}</div></div></div><div className="accord-list">{fragrance.accords.length ? fragrance.accords.map((accord) => <span className="accord" key={accord}>{accord}</span>) : <span className="accord">{locale === "ar" ? "التوافقات غير متوفرة" : "Accords not supplied"}</span>}</div></div></div><PriceOffers fragrance={fragrance} /></section>
  </main>;
}
