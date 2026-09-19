import { fragrances } from "@/data/fragrances";
import type { Fragrance, FragranceFilters, FragranceOffer, FragranceProvider } from "@/types/fragrance";
import { matchesFilters } from "@/types/fragrance";

export class DevelopmentFragranceProvider implements FragranceProvider {
  private records = fragrances;

  async search(query: string, filters: FragranceFilters = {}) {
    return this.records.filter((record) => matchesFilters(record, query, filters));
  }

  async getProduct(idOrSlug: string) {
    return this.records.find((record) => record.id === idOrSlug || record.slug === idOrSlug) ?? null;
  }

  async getBrands() {
    return Array.from(new Set(this.records.map((record) => record.brand))).sort();
  }

  async getCategories() {
    return Array.from(new Set(this.records.map((record) => record.family))).sort();
  }

  async getTrending() {
    return this.records.slice(0, 4);
  }

  async getOffers(id: string) {
    return (await this.getProduct(id))?.offers ?? [];
  }

  async getPriceHistory(_id: string) {
    return [];
  }
}

export const fragranceProvider: FragranceProvider = new DevelopmentFragranceProvider();

export async function getCatalog(query = "", filters: FragranceFilters = {}) {
  return fragranceProvider.search(query, filters);
}

export function isProviderConfigured() {
  return Boolean(import.meta.env.VITE_PUBLIC_API_URL);
}

export function normalizeProviderRecord(record: Fragrance): Fragrance {
  return {
    ...record,
    gallery: record.gallery?.length ? record.gallery : [record.image],
    notes: { top: record.notes?.top ?? [], heart: record.notes?.heart ?? [], base: record.notes?.base ?? [] },
    accords: record.accords ?? [],
    perfumers: record.perfumers ?? [],
    sizes: record.sizes ?? [],
    offers: (record.offers ?? []) as FragranceOffer[],
    dataStatus: record.dataStatus ?? "provider",
  };
}
