export type Gender = "Women" | "Men" | "Unisex";

export interface FragranceOffer {
  retailer: string;
  price: number | null;
  currency: string;
  size: string;
  availability: "In stock" | "Out of stock" | "Unavailable";
  url: string;
  updatedAt: string;
}

export interface Fragrance {
  id: string;
  brand: string;
  name: string;
  slug: string;
  image: string;
  gallery: string[];
  year: number | null;
  concentration: string;
  gender: Gender;
  family: string;
  perfumers: string[];
  notes: { top: string[]; heart: string[]; base: string[] };
  accords: string[];
  rating: number | null;
  reviewCount: number | null;
  sizes: string[];
  offers: FragranceOffer[];
  source: string;
  sourceUrl: string;
  imageSourceUrl: string;
  updatedAt: string;
  dataStatus: "development" | "provider";
}

export interface FragranceFilters {
  brand?: string;
  gender?: Gender | "All";
  concentration?: string;
  family?: string;
  note?: string;
  accord?: string;
  availability?: string;
  year?: string;
}

export type SortOption = "relevance" | "price-low" | "price-high" | "newest" | "reviewed" | "rated";

export interface FragranceProvider {
  search(query: string, filters?: FragranceFilters): Promise<Fragrance[]>;
  getProduct(idOrSlug: string): Promise<Fragrance | null>;
  getBrands(): Promise<string[]>;
  getCategories(): Promise<string[]>;
  getTrending(): Promise<Fragrance[]>;
  getOffers(id: string): Promise<FragranceOffer[]>;
  getPriceHistory(id: string): Promise<Array<{ date: string; price: number; currency: string }>>;
}

export const DEVELOPMENT_DATA_NOTICE =
  "Development dataset — six real fragrances. Prices, ratings, and retailer offers appear only when supplied by a licensed provider.";

export const DEV_UPDATED_AT = "2026-09-19T10:00:00.000Z";
export const DEV_SOURCE = "Aurevia development dataset — public brand metadata";

export const GENDER_OPTIONS: Array<Gender | "All"> = ["All", "Women", "Men", "Unisex"];
export const CONCENTRATION_OPTIONS = ["All", "Eau de Parfum", "Parfum"];
export const FAMILY_OPTIONS = ["All", "Floral Aldehyde", "Woody Aromatic", "Woody", "Amber Floral", "Citrus Woody"];
export const ACCORD_OPTIONS = ["All", "Woody", "Floral", "Amber", "Citrus", "Fresh", "Musky", "Spicy", "Powdery"];
export const AVAILABILITY_OPTIONS = ["All", "In stock", "Out of stock", "Price unavailable"];
export const YEAR_OPTIONS = ["All", "1921", "2009", "2010", "2011", "2015", "2018"];

export const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Relevance",
  "price-low": "Price low → high",
  "price-high": "Price high → low",
  newest: "Newest",
  reviewed: "Most reviewed",
  rated: "Highest rated",
};

export function formatPrice(offer?: FragranceOffer) {
  if (!offer || offer.price === null) return "Price unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: offer.currency,
    maximumFractionDigits: 0,
  }).format(offer.price);
}

export function formatUpdatedAt(timestamp: string) {
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(new Date(timestamp));
}

export function getLowestOffer(fragrance: Fragrance) {
  return fragrance.offers
    .filter((offer) => offer.price !== null)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))[0];
}

export function getAllNotes(fragrance: Fragrance) {
  return [...fragrance.notes.top, ...fragrance.notes.heart, ...fragrance.notes.base];
}

export function getAvailability(fragrance: Fragrance) {
  if (fragrance.offers.length === 0) return "Price unavailable";
  return fragrance.offers.some((offer) => offer.availability === "In stock") ? "In stock" : "Out of stock";
}

export function matchesFilters(fragrance: Fragrance, query: string, filters: FragranceFilters) {
  const haystack = [
    fragrance.brand,
    fragrance.name,
    fragrance.concentration,
    fragrance.gender,
    fragrance.family,
    fragrance.perfumers.join(" "),
    fragrance.accords.join(" "),
    getAllNotes(fragrance).join(" "),
  ].join(" ").toLowerCase();

  const valueMatches = (value: string | undefined, target?: string) => !target || target === "All" || value === target;
  return (
    (!query.trim() || haystack.includes(query.trim().toLowerCase())) &&
    valueMatches(fragrance.brand, filters.brand) &&
    valueMatches(fragrance.gender, filters.gender) &&
    valueMatches(fragrance.concentration, filters.concentration) &&
    valueMatches(fragrance.family, filters.family) &&
    (!filters.note || filters.note === "All" || getAllNotes(fragrance).includes(filters.note)) &&
    (!filters.accord || filters.accord === "All" || fragrance.accords.includes(filters.accord)) &&
    (!filters.availability || filters.availability === "All" || getAvailability(fragrance) === filters.availability) &&
    (!filters.year || filters.year === "All" || String(fragrance.year) === filters.year)
  );
}

export function sortFragrances(fragrances: Fragrance[], sort: SortOption) {
  const list = [...fragrances];
  switch (sort) {
    case "newest": return list.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    case "reviewed": return list.sort((a, b) => (b.reviewCount ?? -1) - (a.reviewCount ?? -1));
    case "rated": return list.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    case "price-low": return list.sort((a, b) => (getLowestOffer(a)?.price ?? Infinity) - (getLowestOffer(b)?.price ?? Infinity));
    case "price-high": return list.sort((a, b) => (getLowestOffer(b)?.price ?? -1) - (getLowestOffer(a)?.price ?? -1));
    default: return list;
  }
}

export function getDisplayPrice(fragrance: Fragrance) {
  return formatPrice(getLowestOffer(fragrance));
}

export function getDisplaySize(fragrance: Fragrance) {
  return fragrance.sizes.length ? fragrance.sizes.join(" · ") : "Sizes not supplied";
}

export function getDisplayRating(fragrance: Fragrance) {
  return fragrance.rating === null ? "—" : fragrance.rating.toFixed(1);
}

export function getDisplayReviews(fragrance: Fragrance) {
  return fragrance.reviewCount === null ? "Reviews not supplied" : `${fragrance.reviewCount.toLocaleString()} reviews`;
}

export function getDisplayUpdatedLabel(fragrance: Fragrance) {
  return `Price last updated: ${fragrance.offers[0] ? formatUpdatedAt(fragrance.offers[0].updatedAt) : "not supplied"}`;
}

export function getPrimaryImage(fragrance: Fragrance) {
  return fragrance.image;
}
