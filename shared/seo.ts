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
    navFragrances: "Fragrances",
    navMen: "Men",
    navWomen: "Women",
    navUnisex: "Unisex",
    navNiche: "Niche",
    navDiscovery: "Discovery",
    navBrands: "Brands",
    navSearch: "Search",
    navAccount: "Account",
    navBag: "Bag",
    close: "Close",
    closeMenu: "Close menu",
    closeSearch: "Close search",
    searchLabel: "Smart fragrance search",
    searchPlaceholder: "Search a note, mood, brand, or accord...",
    searchAria: "Search fragrance by note, mood, brand, or accord",
    tune: "Tune",
    tuned: "tuned",
    whoIsItFor: "Who is it for?",
    accordsYouLove: "Accords you love",
    notesYouWant: "Notes you want to feel",
    resetPreferences: "Reset preferences",
    intelligence: "Aurevia intelligence",
    beginFeeling: "Begin with a feeling",
    compatibleTraces: "Your most compatible traces",
    consideredMatches: "considered matches",
    strongMatch: "Strong match",
    goodMatch: "Good match",
    curatedForYou: "Curated for you",
    noCloseTrace: "No close trace found",
    tryNote: "Try a single note such as vanilla, oud, rose, or bergamot.",
    fragranceDiscovery: "Fragrance discovery",
    findYourScent: "Find your scent",
    collectionDeck: "A considered selection of exceptional fragrances, made easier to explore.",
    findYourTrace: "Find your trace",
    directAnswer: "Direct answer",
    saved: "saved",
    comparing: "comparing",
    inBag: "in bag",
    smartDiscovery: "Smart discovery",
    startWithFeeling: "Start with a feeling.",
    refineDiscovery: "Use the finder, then refine the edit by note, family, or presence.",
    openFinder: "Open fragrance finder",
    compare: "Compare",
    fragrances: "fragrances",
    realCatalogEntries: "real catalog entries",
    sort: "Sort",
    filterBrand: "Brand",
    filterGender: "Gender",
    filterConcentration: "Concentration",
    filterFamily: "Family",
    filterAccord: "Accord",
    filterAvailability: "Availability",
    filterYear: "Year",
    filters: "Filters",
    reset: "Reset",
    refineSelection: "Refine selection",
    applyFilters: "Apply filters",
    editorialSection: "Discovery & education",
    worldOfFragrance: "The world of fragrance",
    editorialCopy: "Fragrance is an invisible architecture. A memory, a material, a trace left in the air.",
    notes: "Notes",
    compositionLanguage: "Composition as language.",
    notesCopy: "Learn how top, heart, and base notes reveal themselves over time.",
    discovery: "Discovery",
    guides: "Guides",
    preciseSelection: "Precise selection.",
    guidesCopy: "Real houses. Clear data. A calmer way to choose what comes next.",
    editorial: "Aurevia editorial",
    notesGuidesEducation: "Notes, guides, and education.",
    account: "Your account",
    personalArchive: "Personal archive",
    backToCollection: "Back to collection",
    ritualRemembered: "Your ritual, remembered.",
    ritualClose: "Keep your ritual, close.",
    savedFragrances: "Saved fragrances",
    compared: "Compared",
    inYourBag: "In your bag",
    wishlist: "Wishlist",
    comparison: "Comparison",
    emptyWishlist: "Your personal edit is empty. Save a fragrance from the collection to see it here.",
    emptyComparison: "Add up to three fragrances to comparison from the collection. Your selections will appear here.",
    exploreFragrances: "Explore fragrances",
    viewScent: "View scent",
    selected: "selected",
    loadingArchive: "Loading your archive…",
    signInSync: "Sign in & sync",
    bagTitle: "Your next ritual.",
    bagEmpty: "Your bag is waiting for a considered choice. Add a fragrance from the collection.",
    total: "Total",
    priceUnavailable: "Price unavailable",
    continue: "Continue",
    showMyEdit: "Show my edit",
    closeBag: "Close shopping bag",
    accountSyncGuest: "Sign in to sync your saved fragrances across devices. Your guest wishlist will merge when you sign in.",
    comparePrices: "Compare prices",
    retailer: "Retailer",
    size: "Size",
    price: "Price",
    updated: "Updated",
    viewOffer: "View offer",
    pricePolicy: "Prices may change by retailer. Aurevia never presents an invented universal price.",
    purchaseFromRetailer: "Purchase from retailer",
    viewRetailer: "View retailer",
    savedAction: "Saved",
    wishlistAction: "Wishlist",
    providerData: "Provider data",
    developmentData: "Development data",
    rating: "Rating",
    notSupplied: "Not supplied",
    priceUnavailableDetail: "Price unavailable — no current retailer offer was supplied by the development data source.",
    footerTagline: "Exceptional fragrances. Precisely chosen.",
    footerData: "Real product data · transparent offers",
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
    navFragrances: "العطور",
    navMen: "رجال",
    navWomen: "نساء",
    navUnisex: "للجميع",
    navNiche: "نيتش",
    navDiscovery: "اكتشاف",
    navBrands: "العلامات",
    navSearch: "بحث",
    navAccount: "الحساب",
    navBag: "السلة",
    close: "إغلاق",
    closeMenu: "إغلاق القائمة",
    closeSearch: "إغلاق البحث",
    searchLabel: "البحث الذكي عن العطور",
    searchPlaceholder: "ابحث عن مكوّن أو مزاج أو علامة أو توافق عطري…",
    searchAria: "البحث عن عطر حسب المكوّن أو المزاج أو العلامة أو التوافق العطري",
    tune: "ضبط",
    tuned: "تفضيلات مضبوطة",
    whoIsItFor: "لمن يناسبه؟",
    accordsYouLove: "التوافقات التي تحبها",
    notesYouWant: "المكونات التي تريد الإحساس بها",
    resetPreferences: "إعادة ضبط التفضيلات",
    intelligence: "ذكاء أوريفيا",
    beginFeeling: "ابدأ بإحساس",
    compatibleTraces: "روائحك الأكثر توافقاً",
    consideredMatches: "نتائج مختارة",
    strongMatch: "توافق قوي",
    goodMatch: "توافق جيد",
    curatedForYou: "مختار لك",
    noCloseTrace: "لم نعثر على أثر قريب",
    tryNote: "جرّب مكوّناً واحداً مثل الفانيلا أو العود أو الورد أو البرغموت.",
    fragranceDiscovery: "اكتشاف العطر",
    findYourScent: "اكتشف عطرك",
    collectionDeck: "مجموعة منتقاة من العطور الاستثنائية، أصبحت أسهل للاستكشاف.",
    findYourTrace: "اعثر على أثرك",
    directAnswer: "إجابة مباشرة",
    saved: "محفوظ",
    comparing: "للمقارنة",
    inBag: "في السلة",
    smartDiscovery: "اكتشاف ذكي",
    startWithFeeling: "ابدأ بإحساس.",
    refineDiscovery: "استخدم الاختبار، ثم صقّل اختيارك حسب المكوّن أو العائلة أو الحضور.",
    openFinder: "افتح مستكشف العطور",
    compare: "قارن",
    fragrances: "عطور",
    realCatalogEntries: "مدخل حقيقي في الكتالوج",
    sort: "ترتيب",
    filterBrand: "العلامة",
    filterGender: "الفئة",
    filterConcentration: "التركيز",
    filterFamily: "العائلة",
    filterAccord: "التوافق",
    filterAvailability: "التوفر",
    filterYear: "السنة",
    filters: "الفلاتر",
    reset: "إعادة ضبط",
    refineSelection: "صقّل الاختيار",
    applyFilters: "تطبيق الفلاتر",
    editorialSection: "الاكتشاف والتثقيف",
    worldOfFragrance: "عالم العطور",
    editorialCopy: "العطر عمارة غير مرئية؛ ذاكرة ومادة وأثر يبقى في الهواء.",
    notes: "المكونات",
    compositionLanguage: "التركيب لغة.",
    notesCopy: "تعرّف إلى طريقة ظهور المكونات العليا والوسطى والقاعدية مع مرور الوقت.",
    discovery: "اكتشاف",
    guides: "أدلة",
    preciseSelection: "اختيار دقيق.",
    guidesCopy: "بيوت عطرية حقيقية. بيانات واضحة. طريقة أهدأ لاختيار ما يناسبك.",
    editorial: "تحرير أوريفيا",
    notesGuidesEducation: "مكونات وأدلة وتثقيف.",
    account: "حسابك",
    personalArchive: "أرشيفك الشخصي",
    backToCollection: "العودة إلى المجموعة",
    ritualRemembered: "طقسك، محفوظاً.",
    ritualClose: "احتفظ بطقسك قريباً.",
    savedFragrances: "العطور المحفوظة",
    compared: "للمقارنة",
    inYourBag: "في سلتك",
    wishlist: "قائمة الرغبات",
    comparison: "المقارنة",
    emptyWishlist: "قائمتك الشخصية فارغة. احفظ عطراً من المجموعة ليظهر هنا.",
    emptyComparison: "أضف حتى ثلاثة عطور للمقارنة من المجموعة، وستظهر اختياراتك هنا.",
    exploreFragrances: "استكشف العطور",
    viewScent: "عرض العطر",
    selected: "محدد",
    loadingArchive: "جارٍ تحميل أرشيفك…",
    signInSync: "سجّل الدخول للمزامنة",
    bagTitle: "طقسك القادم.",
    bagEmpty: "سلتك تنتظر اختياراً مدروساً. أضف عطراً من المجموعة.",
    total: "الإجمالي",
    priceUnavailable: "السعر غير متاح",
    continue: "متابعة",
    showMyEdit: "اعرض اختياراتي",
    closeBag: "إغلاق السلة",
    accountSyncGuest: "سجّل الدخول لمزامنة عطرك المحفوظ عبر الأجهزة. ستندمج قائمة الضيف عند تسجيل الدخول.",
    comparePrices: "مقارنة الأسعار",
    retailer: "المتجر",
    size: "الحجم",
    price: "السعر",
    updated: "آخر تحديث",
    viewOffer: "عرض السعر",
    pricePolicy: "قد تتغير الأسعار حسب المتجر. لا تعرض أوريفيا سعراً موحداً غير موثق.",
    purchaseFromRetailer: "الشراء من المتجر",
    viewRetailer: "زيارة المتجر",
    savedAction: "محفوظ",
    wishlistAction: "قائمة الرغبات",
    providerData: "بيانات مصدر موثوق",
    developmentData: "بيانات تطويرية",
    rating: "التقييم",
    notSupplied: "غير متوفر",
    priceUnavailableDetail: "السعر غير متاح — لم يرد عرض حالي من متجر ضمن مصدر البيانات التطويري.",
    footerTagline: "عطور استثنائية. مختارة بدقة.",
    footerData: "بيانات حقيقية · عروض شفافة",
    answerTitle: "ما هي أوريفيا؟",
    answer: "أوريفيا متجر لاكتشاف العطور يساعدك على استكشاف كتالوج حقيقي حسب العلامة التجارية والمكونات والتوافقات العطرية والتركيز والفئة والتوفر، مع عرض واضح لآخر عروض الأسعار الرسمية المتاحة.",
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
