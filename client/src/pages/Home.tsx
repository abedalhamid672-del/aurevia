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
      <section className="collection-intro" data-reveal><div><div className="collection-kicker micro">01 / {locale === "ar" ? "اكتشاف العطر" : "Fragrance discovery"}</div><h2 className="collection-title">{locale === "ar" ? <>اكتشف<br />عطرك</> : <>Find<br />your scent</>}</h2></div><div className="collection-deck"><p>{locale === "ar" ? "مجموعة مختارة من العطور الاستثنائية، أصبحت أسهل للاستكشاف." : "A considered selection of exceptional fragrances, made easier to explore."}</p><button type="button" className="text-button invert" onClick={openFinder}><Sparkles size={14} /> {locale === "ar" ? "اعثر على أثرك" : "Find your trace"}</button></div></section>
      <section className="seo-answer" data-reveal aria-labelledby="aurevia-answer-heading"><div className="micro">Aurevia / {locale === "ar" ? "إجابة مباشرة" : "Direct answer"}</div><h2 id="aurevia-answer-heading">{copy.answerTitle}</h2><p>{copy.answer}</p><p className="muted-copy">{copy.answerLimit}</p></section>
      <div className="notice-bar" data-reveal><span>{DEVELOPMENT_DATA_NOTICE}</span><span>{wishlist.length} saved · {compare.length} comparing · {cart.length} in bag</span></div>
      <section className="discovery-tools" data-reveal><div><div className="micro">Smart discovery</div><h3>Start with a feeling.</h3><p>Use the finder, then refine the edit by note, family, or presence.</p></div><div className="discovery-actions"><button className="dark-button" type="button" onClick={openFinder}><Sparkles size={15} /> Open fragrance finder</button><button className="outline-button" type="button" onClick={openCompare} aria-label={`Open fragrance comparison${compare.length ? ` with ${compare.length} selected` : ""}`}><GitCompare size={15} /> Compare {compare.length ? `(${compare.length})` : "fragrances"}</button><button className="outline-button" type="button" onClick={openBag} aria-label={`Open shopping bag${cart.length ? ` with ${cart.length} item${cart.length === 1 ? "" : "s"}` : ""}`}><ShoppingBag size={15} /> Bag {cart.length ? `(${cart.length})` : ""}</button></div></section>
      <Filters filters={filters} brands={brands} onChange={setFilters} onReset={resetFilters} />
      <section className="catalog-body" data-reveal aria-labelledby="catalog-heading"><div className="catalog-toolbar" style={{ padding: "0 0 26px", borderBottom: 0 }}><span id="catalog-heading" className="results-count micro">{results.length} fragrances · real catalog entries</span><label className="drawer-group" style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="filter-label">Sort</span><select className="filter-control" value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>{Object.entries(SORT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown size={13} strokeWidth={1.1} /></label></div><FragranceGrid fragrances={results} onOpen={openProduct} onWishlist={toggleWishlist} wishlist={wishlist} onCompare={toggleCompare} onAddToCart={addToCart} /></section>
      {recommendations.length > 0 && <section className="recommendation-strip" data-reveal><div><div className="micro">Aurevia intelligence</div><h3>Because you explored {recommendationTitle}.</h3><p>Similar structure, shared accords, a different signature.</p></div><div className="recommendation-list">{recommendations.map((item) => <button type="button" className="recommendation-item" key={item.id} onClick={() => openProduct(item)}><img src={item.image} alt="" /><span><small>{item.brand}</small><strong>{item.name}</strong></span><ArrowRight size={14} /></button>)}</div></section>}
    </main>
    <section id="discover" className="editorial" data-reveal><div className="editorial-top"><div><div className="section-index micro">02 / Discovery & education</div><h2 className="editorial-title">The world<br />of fragrance</h2></div><p className="editorial-copy">Fragrance is an invisible architecture. A memory, a material, a trace left in the air.</p></div><div className="editorial-grid"><article className="editorial-card"><div className="micro">Notes</div><h3>Composition<br />as language.</h3><p>Learn how top, heart, and base notes reveal themselves over time.</p><button className="text-button" type="button" onClick={() => document.getElementById("education")?.scrollIntoView({ behavior: "smooth" })}>Read the notes <ArrowRight size={14} /></button></article><article className="editorial-card"><div className="micro">Discovery</div><h3>Find<br />your trace.</h3><button className="text-button" type="button" onClick={openFinder}>Open the finder <Sparkles size={14} /></button></article><article className="editorial-card"><div className="micro">Guides</div><h3>Precise<br />selection.</h3><p>Real houses. Clear data. A calmer way to choose what comes next.</p></article></div></section>
    <section id="education" className="education-layer" data-reveal><div><div className="micro">03 / Aurevia editorial</div><h2>Notes, guides,<br />and education.</h2></div><div className="education-grid"><article><span className="micro">Guide 01</span><h3>How to read a note pyramid</h3><p>Top notes create the first impression; heart notes form the character; base notes leave the memory.</p></article><article><span className="micro">Guide 02</span><h3>Choosing by presence</h3><p>Compare projection, texture, and mood—not only the name on the bottle.</p></article><article><span className="micro">Guide 03</span><h3>Build a fragrance wardrobe</h3><p>Start with one daily signature, one evening shape, and one unexpected trace.</p></article></div></section>
    <div data-reveal><BrandDirectory /></div>
    <footer className="site-footer"><span>© 2026 Aurevia</span><span>Exceptional fragrances. Precisely chosen.</span><span>Real product data · transparent offers</span><span className="creator-credit">Created by ENG. Abdulhamid ALkatib</span></footer>

    {finderOpen && <div className="overlay-layer" role="dialog" aria-modal="true"><div className="modal-card finder-card"><button className="modal-close" type="button" onClick={() => setFinderOpen(false)} aria-label="Close"><X /></button><div className="micro">Fragrance finder · 0{finderStep + 1} / 03</div><h2>{finderSteps[finderStep]}</h2><p>{finderStep === 0 ? "What do you want your fragrance to feel like?" : finderStep === 1 ? "Choose the texture you are drawn to." : "How should it enter the room?"}</p><div className="finder-options">{(finderStep === 0 ? ["Quiet and luminous", "Warm and enveloping", "Fresh and kinetic"] : finderStep === 1 ? ["Silky woods", "Velvet florals", "Mineral freshness"] : ["Close to skin", "A confident trail", "A soft statement"]).map((option) => <button type="button" key={option} className={finderAnswer === option ? "finder-option active" : "finder-option"} onClick={() => setFinderAnswer(option)}>{option}<Check size={15} /></button>)}</div><button className="dark-button finder-next" disabled={!finderAnswer} type="button" onClick={() => { if (finderStep < 2) { setFinderStep((step) => step + 1); setFinderAnswer(""); } else { setFinderOpen(false); document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }); } }}>{finderStep < 2 ? "Continue" : "Show my edit"}<ArrowRight size={15} /></button></div></div>}
    {cartOpen && <div className="overlay-layer cart-overlay" role="dialog" aria-modal="true"><div className="modal-card side-card cart-drawer"><button className="modal-close" type="button" onClick={() => setCartOpen(false)} aria-label="Close shopping bag"><X /></button><div className="micro">Your bag · {cartItems.length}</div><h2>Your next ritual.</h2>{cartItems.length ? <div className="drawer-list">{cartItems.map((item) => <div className="drawer-row" key={item.id}><img src={item.image} alt={`${item.brand} ${item.name}`} /><div><strong>{item.name}</strong><small>{item.brand} · {item.sizes[0]} · {item.offers[0]?.price ? `$${item.offers[0].price}` : "Price unavailable"}</small></div><button type="button" onClick={() => setCart((items) => items.filter((id) => id !== item.id))} aria-label={`Remove ${item.name} from bag`}><X size={14} /></button></div>)}</div> : <p className="muted-copy">Your bag is waiting for a considered choice. Add a fragrance from the collection.</p>}{cartItems.length > 0 && <div className="cart-total"><span>Total</span><strong>{cartTotal ? `$${cartTotal.toLocaleString("en-US")}` : "Price unavailable"}</strong>{cartHasUnavailablePrice && <small>Some selected prices are unavailable and are excluded from the total.</small>}</div>}<button className="dark-button full-button" type="button" onClick={() => setCartOpen(false)}>{cartItems.length ? "Continue to checkout" : "Explore the collection"}</button><p className="micro drawer-note">Prices update from the selected official offer snapshot.</p></div></div>}
    {compareOpen && <div className="overlay-layer" role="dialog" aria-modal="true"><div className="modal-card compare-card"><button className="modal-close" type="button" onClick={() => setCompareOpen(false)} aria-label="Close"><X /></button><div className="micro">Compare fragrances · {compareItems.length} / 3</div><h2>See the difference.</h2>{compareItems.length ? <div className="compare-table">{compareItems.map((item) => <article key={item.id}><img src={item.image} alt="" /><span className="micro">{item.brand}</span><h3>{item.name}</h3><p>{item.family}</p><div><small>Top</small><span>{item.notes.top.join(" · ")}</span></div><div><small>Base</small><span>{item.notes.base.join(" · ")}</span></div><button className="text-button" type="button" onClick={() => toggleCompare(item)}>Remove</button></article>)}</div> : <p className="muted-copy">Select up to three fragrances from the collection to compare their notes, family, and presence.</p>}</div></div>}
    {accountOpen && <div className="overlay-layer" role="dialog" aria-modal="true"><div className="modal-card side-card account-card"><button className="modal-close" type="button" onClick={() => setAccountOpen(false)} aria-label="Close"><X /></button><div className="micro">Aurevia account</div><h2>{account ? <>Your ritual,<br />remembered.</> : <>Keep your ritual,<br />across devices.</>}</h2><p className="muted-copy">{account ? `Signed in as ${account.name || account.email || "Aurevia member"}. Your wishlist is synced to this account.` : "Sign in to keep your wishlist available on every device. Your guest list will merge automatically after sign-in."}</p><div className="account-stats"><div><strong>{wishlist.length}</strong><span>Saved fragrances</span></div><div><strong>{compare.length}</strong><span>In comparison</span></div><div><strong>{cart.length}</strong><span>In your bag</span></div></div>{account ? <button className="dark-button full-button" type="button" onClick={() => setAccountOpen(false)}>Continue to my edit <ArrowRight size={15} /></button> : <button className="dark-button full-button" type="button" onClick={() => startLogin()}>Sign in & sync wishlist <ArrowRight size={15} /></button>}<p className="micro drawer-note">{account ? "Wishlist sync is active across your signed-in devices." : "Local guest storage remains available until you sign in."}</p></div></div>}
  </div>;
}
