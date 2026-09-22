import type { Fragrance } from "@/types/fragrance";
import FragranceCard from "@/components/FragranceCard";

interface FragranceGridProps { fragrances: Fragrance[]; loading?: boolean; onOpen: (fragrance: Fragrance) => void; onWishlist?: (fragrance: Fragrance) => void; wishlist?: string[]; onCompare?: (fragrance: Fragrance) => void; onAddToCart?: (fragrance: Fragrance) => void; }

export default function FragranceGrid({ fragrances, loading, onOpen, onWishlist, wishlist = [], onCompare, onAddToCart }: FragranceGridProps) {
  if (loading) return <div className="product-grid" aria-label="Loading fragrances">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="product-card" aria-hidden="true"><div className="product-image-wrap" style={{ background: "linear-gradient(90deg, #f5f5f3 25%, #eeeeec 37%, #f5f5f3 63%)", backgroundSize: "400% 100%", animation: "shimmer 1.2s infinite" }} /><div className="card-body"><div style={{ height: 9, width: "32%", background: "#e9e9e7" }} /><div style={{ height: 18, width: "72%", marginTop: 12, background: "#e9e9e7" }} /></div></div>)}</div>;
  if (!fragrances.length) return <div className="empty-state"><h3>No fragrances match your edit.</h3><p>Reset your filters or search another note, accord, or perfumer.</p></div>;
  return <div className="product-grid">{fragrances.map((fragrance) => <FragranceCard key={fragrance.id} fragrance={fragrance} onOpen={onOpen} onWishlist={onWishlist} isWishlisted={wishlist.includes(fragrance.id)} onCompare={onCompare} onAddToCart={onAddToCart} />)}</div>;
}
