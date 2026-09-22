import { GitCompare, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { Fragrance } from "@/types/fragrance";
import { getAvailability, getDisplayPrice, getDisplayRating, getDisplaySize } from "@/types/fragrance";

interface FragranceCardProps { fragrance: Fragrance; onOpen: (fragrance: Fragrance) => void; onWishlist?: (fragrance: Fragrance) => void; onCompare?: (fragrance: Fragrance) => void; onAddToCart?: (fragrance: Fragrance) => void; }

export default function FragranceCard({ fragrance, onOpen, onWishlist, onCompare, onAddToCart }: FragranceCardProps) {
  const [saved, setSaved] = useState(false);
  const [broken, setBroken] = useState(false);
  const toggleWishlist = (event: React.MouseEvent) => { event.stopPropagation(); setSaved((value) => !value); onWishlist?.(fragrance); };
  return <article className="product-card" onClick={() => onOpen(fragrance)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onOpen(fragrance); }}>
    <div className="product-image-wrap">{broken ? <div className="empty-state"><span className="micro">Image unavailable</span></div> : <img className="product-image" src={fragrance.image} alt={`${fragrance.brand} ${fragrance.name} fragrance bottle`} loading="lazy" onError={() => setBroken(true)} />}<button className={`wishlist-button ${saved ? "saved" : ""}`} type="button" onClick={toggleWishlist} aria-label={`${saved ? "Remove" : "Add"} ${fragrance.name} to wishlist`}><Heart fill={saved ? "currentColor" : "none"} /></button><div className="card-quick-actions"><button type="button" onClick={(event) => { event.stopPropagation(); onCompare?.(fragrance); }} aria-label={`Compare ${fragrance.name}`}><GitCompare size={14} /></button><button type="button" onClick={(event) => { event.stopPropagation(); onAddToCart?.(fragrance); }} aria-label={`Add ${fragrance.name} to bag`}><ShoppingBag size={14} /></button></div></div>
    <div className="card-body"><div className="card-brand micro">{fragrance.brand}</div><h3 className="card-name">{fragrance.name}</h3><div className="card-meta"><span>{fragrance.concentration}</span><span>{getDisplaySize(fragrance)}</span></div><div className={`card-meta ${getDisplayPrice(fragrance) === "Price unavailable" ? "unavailable" : ""}`}><span className="card-price">{getDisplayPrice(fragrance)}</span><span>{getDisplayRating(fragrance) !== "—" ? `★ ${getDisplayRating(fragrance)}` : "Rating not supplied"}</span></div><div className="card-status">{getAvailability(fragrance)} · {fragrance.dataStatus === "development" ? "Development data" : "Provider data"}</div></div>
  </article>;
}
