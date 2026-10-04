export const SITE_URL = "https://aureviafragr-yuhvuls8.manus.space";
export const PRODUCT_NAME = "Aurevia";
export const DEFAULT_LOCALE = "en" as const;
export const TARGET_LOCALES = ["en", "ar"] as const;
export const RTL_LOCALES = ["ar"] as const;
export type Locale = (typeof TARGET_LOCALES)[number];

export const localeConfig: Record<Locale, { label: string; nativeLabel: string; dir: "ltr" | "rtl"; htmlLang: string }> = {
  en: { label: "English", nativeLabel: "English", dir: "ltr", htmlLang: "en" },
  ar: { label: "Arabic", nativeLabel: "العربية", dir: "rtl", htmlLang: "ar" },
};

export const localizedCopy = {
  en: {
    title: "Aurevia — Luxury Fragrance Discovery",
    description: "Aurevia is a curated fragrance discovery and commerce experience with real product metadata, transparent offer snapshots, and scent-finding tools.",
    oneLiner: "A curated fragrance discovery and commerce experience built around real product data.",
    heroEyebrow: "Curated fragrance collection",
    heroTitle: "The art of scent",
    heroSubtitle: "Exceptional fragrances. Precisely chosen.",
    explore: "Explore collection",
    discover: "Discover your scent",
    language: "Language",
    switchTo: "العربية",
    answerTitle: "What is Aurevia?",
    answer: "Aurevia is a fragrance discovery storefront that helps people explore a real catalog by brand, notes, accords, concentration, gender, availability, and transparent official offer snapshots.",
    answerLimit: "Prices are US snapshots and can change by size, retailer, or time. Items without a verified offer are shown as price unavailable rather than estimated.",
  },
  ar: {
    title: "أوريفيا — اكتشاف العطور الفاخرة",
    description: "أوريفيا تجربة لاكتشاف وشراء العطور المختارة، مع بيانات حقيقية للمنتجات ولقطات أسعار شفافة وأدوات لاختيار الرائحة.",
    oneLiner: "تجربة مختارة لاكتشاف العطور والتسوق منها اعتماداً على بيانات حقيقية للمنتجات.",
    heroEyebrow: "مجموعة عطور مختارة",
    heroTitle: "فنّ العطر",
    heroSubtitle: "عطور استثنائية. مختارة بدقة.",
    explore: "استكشف المجموعة",
    discover: "اكتشف عطرك",
    language: "اللغة",
    switchTo: "English",
    answerTitle: "ما هي أوريفيا؟",
    answer: "أوريفيا متجر لاكتشاف العطور يساعدك على استكشاف كتالوج حقيقي حسب العلامة التجارية والمكونات والأ accords والتركيز والجنس والتوفر، مع عرض واضح لآخر عروض الأسعار الرسمية المتاحة.",
    answerLimit: "الأسعار المعروضة لقطات من السوق الأمريكي وقد تتغير حسب الحجم أو المتجر أو الوقت. العطور التي لا تملك عرضاً موثقاً تظهر على أنها بلا سعر متاح بدلاً من تخمين السعر.",
  },
} satisfies Record<Locale, Record<string, string>>;

export const publicRoutes = ["/", "/account"] as const;

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname === "/ar" || pathname.startsWith("/ar/") ? "ar" : "en";
}

export function localizedHomePath(locale: Locale) {
  return locale === DEFAULT_LOCALE ? "/" : "/ar";
}

export function localizedAccountPath(locale: Locale) {
  return locale === DEFAULT_LOCALE ? "/account" : "/ar/account";
}

export function localizedFragrancePath(locale: Locale, slug: string) {
  return locale === DEFAULT_LOCALE ? `/fragrance/${slug}` : `/ar/عطر/${slug}`;
}

export function absoluteUrl(pathname: string) {
  return `${SITE_URL}${pathname === "/" ? "" : encodeURI(pathname)}`;
}

export function alternateEntries(pathname: string) {
  const locale = getLocaleFromPathname(pathname);
  const isAccount = pathname === "/account" || pathname === "/ar/account";
  const productMatch = pathname.match(/^\/(?:ar\/عطر|fragrance)\/([^/]+)$/);
  const paths = productMatch
    ? { en: localizedFragrancePath("en", productMatch[1]), ar: localizedFragrancePath("ar", productMatch[1]) }
    : isAccount
      ? { en: localizedAccountPath("en"), ar: localizedAccountPath("ar") }
      : { en: localizedHomePath("en"), ar: localizedHomePath("ar") };
  return { locale, paths, alternates: { ...paths, "x-default": paths.en } };
}

export function metadataForPath(pathname: string) {
  const { locale, paths, alternates } = alternateEntries(pathname);
  const copy = localizedCopy[locale];
  const privateRoute = pathname === "/account" || pathname === "/ar/account";
  return { locale, canonical: absoluteUrl(paths[locale]), alternates, title: copy.title, description: copy.description, robots: privateRoute ? "noindex,nofollow" : "index,follow,max-image-preview:large" };
}

export function buildSitemapXml(productSlugs: string[]) {
  const urls = [
    { en: "/", ar: "/ar" },
    ...productSlugs.map(slug => ({ en: localizedFragrancePath("en", slug), ar: localizedFragrancePath("ar", slug) })),
  ];
  const body = urls.map(paths => `  <url>\n    <loc>${absoluteUrl(paths.en)}</loc>\n    <xhtml:link rel="alternate" hreflang="en" href="${absoluteUrl(paths.en)}" />\n    <xhtml:link rel="alternate" hreflang="ar" href="${absoluteUrl(paths.ar)}" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(paths.en)}" />\n  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>`;
}

export function buildLlmsTxt(productSlugs: string[]) {
  const productLinks = productSlugs.slice(0, 12).map(slug => `- ${PRODUCT_NAME} fragrance: ${absoluteUrl(localizedFragrancePath("en", slug))}`).join("\n");
  return `# ${PRODUCT_NAME}\n\n> ${localizedCopy.en.oneLiner}\n\n## Public catalog\n\n- Homepage: ${absoluteUrl("/")}\n- Arabic homepage: ${absoluteUrl("/ar")}\n- Fragrance catalog: ${absoluteUrl("/#collection")}\n\n## Selected product pages\n\n${productLinks}\n\n## Data policy\n\nPrices are time-stamped US offer snapshots when available. Missing prices are not estimated. Product facts and retailer links should be checked against the cited source URL on each product record.\n\nThis file is a curated navigation layer; it does not replace robots.txt, sitemap.xml, structured data, or the public pages themselves.\n`;
}
