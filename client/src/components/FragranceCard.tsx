import { GitCompare, Heart, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import type { Fragrance } from "@/types/fragrance";
import { getAvailability, getDisplayPrice, getDisplayRating, getDisplaySize } from "@/types/fragrance";
import { useLocale } from "@/lib/i18n";

interface FragranceCardProps { fragrance: Fragrance; onOpen: (fragrance: Fragrance) => void; onWishlist?: (fragrance: Fragrance) => void; isWishlisted?: boolean; onCompare?: (fragrance: Fragrance) => void; onAddToCart?: (fragrance: Fragrance) => void; }

export default function FragranceCard({ fragrance, onOpen, onWishlist, isWishlisted = false, onCompare, onAddToCart }: FragranceCardProps) {
  const { copy, locale } = useLocale();
  const [saved, setSaved] = useState(isWishlisted);
  const [broken, setBroken] = useState(false);
  const availability = getAvailability(fragrance);
  const localizedAvailability = locale === "ar" ? ({ "In stock": "متوفر", "Out of stock": "غير متوفر", "Price unavailable": copy.priceUnavailable } as Record<string, string>)[availability] ?? availability : availability;
  useEffect(() => setSaved(isWishlisted), [isWishlisted]);
  const toggleWishlist = (event: React.MouseEvent) => { event.stopPropagation(); setSaved((value) => !value); onWishlist?.(fragrance); };
  return <article className="product-card" onClick={() => onOpen(fragrance)} tabIndex={0} role="link" aria-label={`${locale === "ar" ? "عرض" : "View"} ${fragrance.brand} ${fragrance.name}`} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(fragrance); } }}>
    <div className="product-image-wrap">{broken ? <div className="empty-state"><span className="micro">{locale === "ar" ? "الصورة غير متاحة" : "Image unavailable"}</span></div> : <img className="product-image" src={fragrance.image} alt={`${fragrance.brand} ${fragrance.name} ${locale === "ar" ? "زجاجة عطر" : "fragrance bottle"}`} loading="lazy" decoding="async" onError={() => setBroken(true)} />}<button className={`wishlist-button ${saved ? "saved" : ""}`} type="button" onClick={toggleWishlist} aria-label={`${saved ? (locale === "ar" ? "إزالة" : "Remove") : (locale === "ar" ? "إضافة" : "Add")} ${fragrance.name} ${copy.wishlist}`}><Heart fill={saved ? "currentColor" : "none"} /></button><div className="card-quick-actions"><button type="button" onClick={(event) => { event.stopPropagation(); onCompare?.(fragrance); }} aria-label={`${copy.compare} ${fragrance.name}`}><GitCompare size={14} /></button><button type="button" onClick={(event) => { event.stopPropagation(); onAddToCart?.(fragrance); }} aria-label={`${locale === "ar" ? "إضافة" : "Add"} ${fragrance.name} ${copy.navBag}`}><ShoppingBag size={14} /></button></div></div>
    <div className="card-body"><div className="card-brand micro">{fragrance.brand}</div><h3 className="card-name">{fragrance.name}</h3><div className="card-meta"><span>{fragrance.concentration}</span><span>{getDisplaySize(fragrance)}</span></div><div className={`card-meta ${getDisplayPrice(fragrance) === "Price unavailable" ? "unavailable" : ""}`}><span className="card-price">{getDisplayPrice(fragrance) === "Price unavailable" ? copy.priceUnavailable : getDisplayPrice(fragrance)}</span><span>{getDisplayRating(fragrance) !== "—" ? `★ ${getDisplayRating(fragrance)}` : copy.notSupplied}</span></div><div className="card-status">{localizedAvailability} · {fragrance.dataStatus === "development" ? copy.developmentData : copy.providerData}</div></div>
  </article>;
}
