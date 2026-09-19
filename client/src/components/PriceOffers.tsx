import type { Fragrance } from "@/types/fragrance";
import { formatPrice, formatUpdatedAt } from "@/types/fragrance";

export default function PriceOffers({ fragrance }: { fragrance: Fragrance }) {
  return <section className="price-offers" aria-labelledby="offers-heading">
    <h3 id="offers-heading">Compare prices</h3>
    {fragrance.offers.length ? <>
      <div className="offer-row offer-heading"><span>Retailer</span><span>Size</span><span>Price</span><span>Updated</span><span /></div>
      {fragrance.offers.map((offer) => <div className="offer-row" key={`${offer.retailer}-${offer.size}-${offer.updatedAt}`}><span>{offer.retailer}</span><span>{offer.size}</span><span>{formatPrice(offer)}</span><span>{formatUpdatedAt(offer.updatedAt)}</span><a className="outline-button offer-cta" href={offer.url} target="_blank" rel="noreferrer">View offer</a></div>)}
    </> : <div className="empty-state" style={{ textAlign: "left", padding: "34px 0" }}><p style={{ margin: 0 }}>Price unavailable — no current retailer offer was supplied by the development data source.</p></div>}
    <p className="offer-note">Prices may change by retailer. Aurevia never presents an invented universal price.</p>
  </section>;
}
