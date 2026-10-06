import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, GitCompare, Heart, ShoppingBag, Sparkles, X } from "lucide-react";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import Hero from "@/components/Hero";
import MobileMenu from "@/components/MobileMenu";
import Search from "@/components/Search";
import Filters from "@/components/Filters";
import FragranceGrid from "@/components/FragranceGrid";
import FragranceDetail from "@/components/FragranceDetail";
import BrandDirectory from "@/components/BrandDirectory";
import { fragrances } from "@/data/fragrances";
import type { Fragrance, FragranceFilters, SortOption } from "@/types/fragrance";
import { DEVELOPMENT_DATA_NOTICE, SORT_LABELS, sortFragrances, matchesFilters, getAllNotes, getAvailability } from "@/types/fragrance";
import { usePersistentIds } from "@/lib/persistence";
import { useLocale } from "@/lib/i18n";
import { localizedAccountPath, localizedFragrancePath } from "@shared/seo";

const defaultFilters: FragranceFilters = { brand: "All", gender: "All", concentration: "All", family: "All", note: "All", accord: "All", availability: "All", year: "All" };
const finderSteps = ["Mood", "Texture", "Presence"];

export default function Home() {
  const { locale, copy } = useLocale();
  const sortLabels = locale === "ar" ? { relevance: "الأكثر صلة", priceAsc: "السعر: من الأقل إلى الأعلى", priceDesc: "السعر: من الأعلى إلى الأقل", newest: "الأحدث", reviewed: "الأكثر مراجعة", rating: "الأعلى تقييماً" } : SORT_LABELS;
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<Fragrance | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FragranceFilters>(defaultFilters);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [wishlist, setWishlist] = usePersistentIds("aurevia:wishlist:v1");
  const { data: account } = trpc.auth.me.useQuery();
  const syncWishlist = trpc.wishlist.sync.useMutation();
  const addWishlist = trpc.wishlist.add.useMutation();
  const removeWishlist = trpc.wishlist.remove.useMutation();
  const syncedUserRef = useRef<number | null>(null);
  const [compare, setCompare] = usePersistentIds("aurevia:compare:v1");
  const [cart, setCart] = usePersistentIds("aurevia:cart:v1");
  const [finderStep, setFinderStep] = useState(0);
  const [finderAnswer, setFinderAnswer] = useState("");
  const brands = useMemo(() => Array.from(new Set(fragrances.map((item) => item.brand))).sort(), []);
  const results = useMemo(() => sortFragrances(fragrances.filter((fragrance) => matchesFilters(fragrance, query, filters)), sort), [query, filters, sort]);
  const compareItems = fragrances.filter((item) => compare.includes(item.id));
  const cartItems = fragrances.filter((item) => cart.includes(item.id));
  const cartTotal = cartItems.reduce((total, item) => total + (item.offers[0]?.price ?? 0), 0);
  const cartHasUnavailablePrice = cartItems.some((item) => !item.offers[0]?.price);
  const recommendationTitle = selected ? String(selected.name) : "the collection";
  const recommendations = useMemo(() => {
    const source = selected ?? results[0];
    if (!source) return [];
    return fragrances.filter((item) => item.id !== source.id).map((item) => ({ item, score: item.accords.filter((accord) => source.accords.includes(accord)).length + item.notes.base.filter((note) => source.notes.base.includes(note)).length })).sort((a, b) => b.score - a.score).slice(0, 3).map(({ item }) => item);
  }, [selected, results]);

  useEffect(() => { document.body.style.overflow = menuOpen || searchOpen || finderOpen || cartOpen || compareOpen || accountOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [menuOpen, searchOpen, finderOpen, cartOpen, compareOpen, accountOpen]);
  useEffect(() => {
    if (!account) { syncedUserRef.current = null; return; }
    if (syncedUserRef.current === account.id || syncWishlist.isPending) return;
    syncWishlist.mutate({ localIds: wishlist }, {
      onSuccess: (merged) => { setWishlist(merged); syncedUserRef.current = account.id; },
    });
  }, [account, wishlist, syncWishlist, setWishlist]);
  useEffect(() => { const slug = window.location.pathname.startsWith("/fragrance/") ? window.location.pathname.replace("/fragrance/", "") : window.location.pathname.startsWith("/ar/عطر/") ? window.location.pathname.replace("/ar/عطر/", "") : ""; if (slug) setSelected(fragrances.find((item) => item.slug === slug) ?? null); }, []);
  useEffect(() => { const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")); if (!elements.length || !("IntersectionObserver" in window)) { elements.forEach((element) => element.classList.add("is-visible")); return; } const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }); elements.forEach((element) => observer.observe(element)); return () => observer.disconnect(); }, [selected, compareOpen]);

  const openProduct = (fragrance: Fragrance) => { setSelected(fragrance); window.history.pushState({}, "", localizedFragrancePath(locale, fragrance.slug)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const backToCollection = () => { setSelected(null); window.history.pushState({}, "", locale === "ar" ? "/ar" : "/"); window.scrollTo({ top: document.getElementById("collection")?.offsetTop ?? 0, behavior: "smooth" }); };
  const resetFilters = () => { setFilters(defaultFilters); setQuery(""); setSort("relevance"); };
  const toggleWishlist = (item: Fragrance) => {
    const saved = wishlist.includes(item.id);
    setWishlist((items) => saved ? items.filter((id) => id !== item.id) : [...items, item.id]);
    if (account) {
      const mutation = saved ? removeWishlist : addWishlist;
      mutation.mutate({ fragranceId: item.id }, { onSuccess: (next) => setWishlist(next) });
    }
  };
  const toggleCompare = (item: Fragrance) => setCompare((items) => items.includes(item.id) ? items.filter((id) => id !== item.id) : items.length >= 3 ? items : [...items, item.id]);
  const addToCart = (item: Fragrance) => { setCart((items) => items.includes(item.id) ? items : [...items, item.id]); setCartOpen(true); };
  const openFinder = () => { setFinderStep(0); setFinderAnswer(""); setFinderOpen(true); };
  const openCompare = () => setCompareOpen(true);
  const openBag = () => setCartOpen(true);
  const openAccountPage = () => setLocation(localizedAccountPath(locale));

  if (selected) return <FragranceDetail fragrance={selected} onBack={backToCollection} onWishlist={toggleWishlist} isWishlisted={wishlist.includes(selected.id)} />;

  return <div className="site-shell">
    <Search open={searchOpen} fragrances={fragrances} onClose={() => setSearchOpen(false)} onOpenProduct={openProduct} />
    <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onSearch={() => setSearchOpen(true)} />
    <Hero onSearch={() => setSearchOpen(true)} onMenu={() => setMenuOpen(true)} onAccount={openAccountPage} onBag={openBag} bagCount={cart.length} />
    <main id="collection" className="collection">
      <section className="collection-intro" data-reveal><div><div className="collection-kicker micro">01 / {copy.fragranceDiscovery}</div><h2 className="collection-title">{locale === "ar" ? <>اكتشف<br />عطرك</> : <>Find<br />your scent</>}</h2></div><div className="collection-deck"><p>{copy.collectionDeck}</p><button type="button" className="text-button invert" onClick={openFinder}><Sparkles size={14} /> {copy.findYourTrace}</button></div></section>
      <section className="seo-answer" data-reveal aria-labelledby="aurevia-answer-heading"><div className="micro">Aurevia / {copy.directAnswer}</div><h2 id="aurevia-answer-heading">{copy.answerTitle}</h2><p>{copy.answer}</p><p className="muted-copy">{copy.answerLimit}</p></section>
      <div className="notice-bar" data-reveal><span>{locale === "ar" ? "البيانات التطويرية موضحة بوضوح؛ الأسعار لقطات موثقة وليست تقديرات." : DEVELOPMENT_DATA_NOTICE}</span><span>{wishlist.length} {copy.saved} · {compare.length} {copy.comparing} · {cart.length} {copy.inBag}</span></div>
      <section className="discovery-tools" data-reveal><div><div className="micro">{copy.smartDiscovery}</div><h3>{copy.startWithFeeling}</h3><p>{copy.refineDiscovery}</p></div><div className="discovery-actions"><button className="dark-button" type="button" onClick={openFinder}><Sparkles size={15} /> {copy.openFinder}</button><button className="outline-button" type="button" onClick={openCompare} aria-label={`${copy.compare} ${copy.fragrances}${compare.length ? ` (${compare.length} ${copy.selected})` : ""}`}><GitCompare size={15} /> {copy.compare} {compare.length ? `(${compare.length})` : copy.fragrances}</button><button className="outline-button" type="button" onClick={openBag} aria-label={`${copy.navBag}${cart.length ? ` (${cart.length})` : ""}`}><ShoppingBag size={15} /> {copy.navBag} {cart.length ? `(${cart.length})` : ""}</button></div></section>
      <Filters filters={filters} brands={brands} onChange={setFilters} onReset={resetFilters} />
      <section className="catalog-body" data-reveal aria-labelledby="catalog-heading"><div className="catalog-toolbar" style={{ padding: "0 0 26px", borderBottom: 0 }}><span id="catalog-heading" className="results-count micro">{results.length} {copy.fragrances} · {copy.realCatalogEntries}</span><label className="drawer-group" style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="filter-label">{copy.sort}</span><select className="filter-control" value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>{Object.entries(sortLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown size={13} strokeWidth={1.1} /></label></div><FragranceGrid fragrances={results} onOpen={openProduct} onWishlist={toggleWishlist} wishlist={wishlist} onCompare={toggleCompare} onAddToCart={addToCart} /></section>
      {recommendations.length > 0 && <section className="recommendation-strip" data-reveal><div><div className="micro">{copy.intelligence}</div><h3>{locale === "ar" ? `لأنك استكشفت ${recommendationTitle}.` : `Because you explored ${recommendationTitle}.`}</h3><p>{locale === "ar" ? "تركيب متشابه وتوافقات مشتركة، بتوقيع مختلف." : "Similar structure, shared accords, a different signature."}</p></div><div className="recommendation-list">{recommendations.map((item) => <button type="button" className="recommendation-item" key={item.id} onClick={() => openProduct(item)}><img src={item.image} alt="" /><span><small>{item.brand}</small><strong>{item.name}</strong></span><ArrowRight size={14} /></button>)}</div></section>}
    </main>
    <section id="discover" className="editorial" data-reveal><div className="editorial-top"><div><div className="section-index micro">02 / {copy.editorialSection}</div><h2 className="editorial-title">{locale === "ar" ? <>عالم<br />العطور</> : <>The world<br />of fragrance</>}</h2></div><p className="editorial-copy">{copy.editorialCopy}</p></div><div className="editorial-grid"><article className="editorial-card"><div className="micro">{copy.notes}</div><h3>{locale === "ar" ? <>التركيب<br />لغة.</> : <>Composition<br />as language.</>}</h3><p>{copy.notesCopy}</p><button className="text-button" type="button" onClick={() => document.getElementById("education")?.scrollIntoView({ behavior: "smooth" })}>{locale === "ar" ? "اقرأ عن المكونات" : "Read the notes"} <ArrowRight size={14} /></button></article><article className="editorial-card"><div className="micro">{copy.discovery}</div><h3>{locale === "ar" ? <>اعثر<br />على أثرك.</> : <>Find<br />your trace.</>}</h3><button className="text-button" type="button" onClick={openFinder}>{copy.openFinder} <Sparkles size={14} /></button></article><article className="editorial-card"><div className="micro">{copy.guides}</div><h3>{locale === "ar" ? <>اختيار<br />دقيق.</> : <>Precise<br />selection.</>}</h3><p>{copy.guidesCopy}</p></article></div></section>
    <section id="education" className="education-layer" data-reveal><div><div className="micro">03 / {copy.editorial}</div><h2>{locale === "ar" ? <>مكونات وأدلة،<br />وتثقيف.</> : <>Notes, guides,<br />and education.</>}</h2></div><div className="education-grid"><article><span className="micro">{locale === "ar" ? "دليل 01" : "Guide 01"}</span><h3>{locale === "ar" ? "كيف تقرأ هرم المكونات" : "How to read a note pyramid"}</h3><p>{locale === "ar" ? "تمنح المكونات العليا الانطباع الأول، وتبني مكونات القلب الشخصية، وتترك القاعدة الذاكرة." : "Top notes create the first impression; heart notes form the character; base notes leave the memory."}</p></article><article><span className="micro">{locale === "ar" ? "دليل 02" : "Guide 02"}</span><h3>{locale === "ar" ? "اختر حسب الحضور" : "Choosing by presence"}</h3><p>{locale === "ar" ? "قارن الانتشار والملمس والمزاج، لا الاسم على الزجاجة فقط." : "Compare projection, texture, and mood—not only the name on the bottle."}</p></article><article><span className="micro">{locale === "ar" ? "دليل 03" : "Guide 03"}</span><h3>{locale === "ar" ? "ابنِ خزانة عطرية" : "Build a fragrance wardrobe"}</h3><p>{locale === "ar" ? "ابدأ بتوقيع يومي، ورائحة للمساء، وأثر غير متوقع." : "Start with one daily signature, one evening shape, and one unexpected trace."}</p></article></div></section>
    <div data-reveal><BrandDirectory /></div>
    <footer className="site-footer"><span>© 2026 Aurevia</span><span>{copy.footerTagline}</span><span>{copy.footerData}</span><span className="creator-credit">{locale === "ar" ? "تنفيذ ENG. Abdulhamid ALkatib" : "Created by ENG. Abdulhamid ALkatib"}</span></footer>

    {finderOpen && <div className="overlay-layer" role="dialog" aria-modal="true"><div className="modal-card finder-card"><button className="modal-close" type="button" onClick={() => setFinderOpen(false)} aria-label={copy.close}><X /></button><div className="micro">{locale === "ar" ? "مستكشف العطور" : "Fragrance finder"} · 0{finderStep + 1} / 03</div><h2>{locale === "ar" ? ["المزاج", "الملمس", "الحضور"][finderStep] : finderSteps[finderStep]}</h2><p>{finderStep === 0 ? (locale === "ar" ? "كيف تريد أن تشعر برائحتك؟" : "What do you want your fragrance to feel like?") : finderStep === 1 ? (locale === "ar" ? "اختر الملمس الذي يجذبك." : "Choose the texture you are drawn to.") : (locale === "ar" ? "كيف تريد للعطر أن يدخل المكان؟" : "How should it enter the room?")}</p><div className="finder-options">{(finderStep === 0 ? (locale === "ar" ? ["هادئ ومضيء", "دافئ ومحتوٍ", "منعش وحيوي"] : ["Quiet and luminous", "Warm and enveloping", "Fresh and kinetic"]) : finderStep === 1 ? (locale === "ar" ? ["أخشاب حريرية", "زهور مخملية", "انتعاش معدني"] : ["Silky woods", "Velvet florals", "Mineral freshness"]) : (locale === "ar" ? ["قريب من البشرة", "أثر واثق", "حضور ناعم"] : ["Close to skin", "A confident trail", "A soft statement"])).map((option) => <button type="button" key={option} className={finderAnswer === option ? "finder-option active" : "finder-option"} onClick={() => setFinderAnswer(option)}>{option}<Check size={15} /></button>)}</div><button className="dark-button finder-next" disabled={!finderAnswer} type="button" onClick={() => { if (finderStep < 2) { setFinderStep((step) => step + 1); setFinderAnswer(""); } else { setFinderOpen(false); document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }); } }}>{finderStep < 2 ? copy.continue : copy.showMyEdit}<ArrowRight size={15} /></button></div></div>}
    {cartOpen && <div className="overlay-layer cart-overlay" role="dialog" aria-modal="true"><div className="modal-card side-card cart-drawer"><button className="modal-close" type="button" onClick={() => setCartOpen(false)} aria-label={copy.closeBag}><X /></button><div className="micro">{copy.navBag} · {cartItems.length}</div><h2>{copy.bagTitle}</h2>{cartItems.length ? <div className="drawer-list">{cartItems.map((item) => <div className="drawer-row" key={item.id}><img src={item.image} alt={`${item.brand} ${item.name}`} /><div><strong>{item.name}</strong><small>{item.brand} · {item.sizes[0]} · {item.offers[0]?.price ? `$${item.offers[0].price}` : copy.priceUnavailable}</small></div><button type="button" onClick={() => setCart((items) => items.filter((id) => id !== item.id))} aria-label={`${locale === "ar" ? "إزالة" : "Remove"} ${item.name} ${copy.navBag}`}><X size={14} /></button></div>)}</div> : <p className="muted-copy">{copy.bagEmpty}</p>}{cartItems.length > 0 && <div className="cart-total"><span>{copy.total}</span><strong>{cartTotal ? `$${cartTotal.toLocaleString("en-US")}` : copy.priceUnavailable}</strong>{cartHasUnavailablePrice && <small>{locale === "ar" ? "بعض الأسعار غير متاحة، لذلك لم تدخل في الإجمالي." : "Some selected prices are unavailable and are excluded from the total."}</small>}</div>}<button className="dark-button full-button" type="button" onClick={() => setCartOpen(false)}>{cartItems.length ? (locale === "ar" ? "متابعة إلى الدفع" : "Continue to checkout") : copy.exploreFragrances}</button><p className="micro drawer-note">{locale === "ar" ? "تُحدّث الأسعار من لقطة العرض الرسمي المختارة." : "Prices update from the selected official offer snapshot."}</p></div></div>}
    {compareOpen && <div className="overlay-layer" role="dialog" aria-modal="true"><div className="modal-card compare-card"><button className="modal-close" type="button" onClick={() => setCompareOpen(false)} aria-label={copy.close}><X /></button><div className="micro">{copy.compare} {copy.fragrances} · {compareItems.length} / 3</div><h2>{locale === "ar" ? "اكتشف الفروق." : "See the difference."}</h2>{compareItems.length ? <div className="compare-table">{compareItems.map((item) => <article key={item.id}><img src={item.image} alt="" /><span className="micro">{item.brand}</span><h3>{item.name}</h3><p>{item.family}</p><div><small>{locale === "ar" ? "المقدمة" : "Top"}</small><span>{item.notes.top.join(" · ")}</span></div><div><small>{locale === "ar" ? "القاعدة" : "Base"}</small><span>{item.notes.base.join(" · ")}</span></div><button className="text-button" type="button" onClick={() => toggleCompare(item)}>{locale === "ar" ? "إزالة" : "Remove"}</button></article>)}</div> : <p className="muted-copy">{copy.emptyComparison}</p>}</div></div>}
    {accountOpen && <div className="overlay-layer" role="dialog" aria-modal="true"><div className="modal-card side-card account-card"><button className="modal-close" type="button" onClick={() => setAccountOpen(false)} aria-label={copy.close}><X /></button><div className="micro">Aurevia {copy.account}</div><h2>{account ? (locale === "ar" ? <>طقسك،<br />محفوظ.</> : <>Your ritual,<br />remembered.</>) : (locale === "ar" ? <>احتفظ بطقسك،<br />عبر أجهزتك.</> : <>Keep your ritual,<br />across devices.</>)}</h2><p className="muted-copy">{account ? `${locale === "ar" ? "مسجّل باسم " : "Signed in as "}${account.name || account.email || (locale === "ar" ? "عضو أوريفيا" : "Aurevia member")}. ${locale === "ar" ? "قائمة رغباتك متزامنة مع هذا الحساب." : "Your wishlist is synced to this account."}` : copy.accountSyncGuest}</p><div className="account-stats"><div><strong>{wishlist.length}</strong><span>{copy.savedFragrances}</span></div><div><strong>{compare.length}</strong><span>{copy.compared}</span></div><div><strong>{cart.length}</strong><span>{copy.inYourBag}</span></div></div>{account ? <button className="dark-button full-button" type="button" onClick={() => { setAccountOpen(false); openAccountPage(); }}>{copy.viewScent} <ArrowRight size={15} /></button> : <button className="dark-button full-button" type="button" onClick={() => startLogin()}>{copy.signInSync} <ArrowRight size={15} /></button>}<p className="micro drawer-note">{account ? (locale === "ar" ? "المزامنة فعالة عبر أجهزتك المسجّل دخولك عليها." : "Wishlist sync is active across your signed-in devices.") : (locale === "ar" ? "تبقى قائمة الضيف محفوظة محلياً حتى تسجيل الدخول." : "Local guest storage remains available until you sign in.")}</p></div></div>}
  </div>;
}
