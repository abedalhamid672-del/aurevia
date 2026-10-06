import type { Fragrance } from "@/types/fragrance";
import { formatPrice, formatUpdatedAt } from "@/types/fragrance";
import { useLocale } from "@/lib/i18n";

export default function PriceOffers({ fragrance }: { fragrance: Fragrance }) {
  const { copy } = useLocale();
  return <section className="price-offers" aria-labelledby="offers-heading">
    <h3 id="offers-heading">{copy.comparePrices}</h3>
    {fragrance.offers.length ? <>
      <div className="offer-row offer-heading"><span>{copy.retailer}</span><span>{copy.size}</span><span>{copy.price}</span><span>{copy.updated}</span><span /></div>
      {fragrance.offers.map((offer) => <div className="offer-row" key={`${offer.retailer}-${offer.size}-${offer.updatedAt}`}><span>{offer.retailer}</span><span>{offer.size}</span><span>{formatPrice(offer)}</span><span>{formatUpdatedAt(offer.updatedAt)}</span><a className="outline-button offer-cta" href={offer.url} target="_blank" rel="noreferrer">{copy.viewOffer}</a></div>)}
    </> : <div className="empty-state" style={{ textAlign: "left", padding: "34px 0" }}><p style={{ margin: 0 }}>{copy.priceUnavailableDetail}</p></div>}
    <p className="offer-note">{copy.pricePolicy}</p>
  </section>;
}
