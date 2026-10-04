import { useEffect } from "react";
import { fragrances } from "@/data/fragrances";
import { localizedFragrancePath, metadataForPath, absoluteUrl, type Locale } from "@shared/seo";

function upsertMeta(selector: string, attrs: Record<string, string>, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) { element = document.createElement("meta"); document.head.appendChild(element); }
  Object.entries(attrs).forEach(([key, value]) => element!.setAttribute(key, value));
  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string, extra: Record<string, string> = {}) {
  const selector = `link[rel="${rel}"][href="${href}"]`;
  if (document.head.querySelector(selector)) return;
  const link = document.createElement("link");
  link.rel = rel; link.href = href;
  Object.entries(extra).forEach(([key, value]) => link.setAttribute(key, value));
  document.head.appendChild(link);
}

export default function SeoHead({ locale }: { locale: Locale }) {
  useEffect(() => {
    const pathname = window.location.pathname;
    const metadata = metadataForPath(pathname);
    const productSlug = pathname.match(/^\/(?:ar\/عطر|fragrance)\/([^/]+)$/)?.[1];
    const product = productSlug ? fragrances.find(item => item.slug === productSlug) : undefined;
    const title = product ? `${product.name} — ${product.brand} | Aurevia` : metadata.title;
    const description = product ? `${product.brand} ${product.name}: ${product.concentration}, ${product.gender.toLowerCase()} fragrance with notes of ${product.notes.top.slice(0, 3).join(", ")}.` : metadata.description;
    document.title = title;
    document.documentElement.lang = metadata.locale;
    document.documentElement.dir = metadata.locale === "ar" ? "rtl" : "ltr";
    upsertMeta('meta[name="description"]', { name: "description" }, description);
    upsertMeta('meta[name="robots"]', { name: "robots" }, metadata.robots);
    upsertMeta('meta[property="og:title"]', { property: "og:title" }, title);
    upsertMeta('meta[property="og:description"]', { property: "og:description" }, description);
    upsertMeta('meta[property="og:url"]', { property: "og:url" }, metadata.canonical);
    upsertMeta('meta[property="og:locale"]', { property: "og:locale" }, metadata.locale === "ar" ? "ar_AR" : "en_US");
    upsertLink("canonical", metadata.canonical);
    Object.entries(metadata.alternates).forEach(([alternateLocale, href]) => upsertLink("alternate", absoluteUrl(href), { hreflang: alternateLocale }));

    const graph: Record<string, unknown>[] = [{ "@type": "Organization", "@id": `${absoluteUrl("/")}#organization`, name: "Aurevia", url: absoluteUrl("/"), description: metadata.description }, { "@type": "WebSite", "@id": `${absoluteUrl("/")}#website`, name: "Aurevia", url: absoluteUrl("/"), inLanguage: metadata.locale }];
    if (product) {
      const offer = product.offers[0];
      graph.push({ "@type": "Product", name: product.name, brand: { "@type": "Brand", name: product.brand }, image: product.gallery.map(image => absoluteUrl(image)), category: "Fragrance", description, url: absoluteUrl(localizedFragrancePath(metadata.locale, product.slug)), ...(offer?.price != null ? { offers: { "@type": "Offer", priceCurrency: offer.currency, price: offer.price, availability: offer.availability === "In stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: offer.url } } : {}) });
    }
    let script = document.head.querySelector<HTMLScriptElement>('script[data-aurevia-schema="true"]');
    if (!script) { script = document.createElement("script"); script.type = "application/ld+json"; script.dataset.aureviaSchema = "true"; document.head.appendChild(script); }
    script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  }, [locale]);
  return null;
}
